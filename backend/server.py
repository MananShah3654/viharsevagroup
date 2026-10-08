"""
Naranpura Vihar Seva — companion backend.

The single source of truth for all app data (users, vihars, participation) is
the EXISTING production API at https://viharsevagroup.vercel.app/api.

This companion backend does two things:
  1. Transparent PROXY for all data endpoints -> the production API. The mobile
     app calls this backend (same origin as the app), which removes browser
     CORS issues on web and keeps the production backend as the single source
     of truth (every request is forwarded verbatim).
  2. Push notification relay using Expo's own push service (no third-party
     account/key needed) — stores each user's Expo push token in memory and
     forwards send requests to https://exp.host/--/api/v2/push/send.
"""
import os
import re
import json
import logging
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("viharseva")

UPSTREAM_API_URL = os.environ.get("UPSTREAM_API_URL", "https://viharsevagroup.vercel.app/api")

app = FastAPI(title="Vihar Seva Companion (proxy + push)")

# ---------------------------------------------------------------------------
# Push relay — Expo's own push service (no third-party account/key).
# https://docs.expo.dev/push-notifications/sending-notifications/
# ---------------------------------------------------------------------------
EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

_push_client = httpx.AsyncClient(timeout=10.0)

# Upstream client for the data proxy.
_upstream = httpx.AsyncClient(base_url=UPSTREAM_API_URL, timeout=30.0)

push_router = APIRouter(prefix="/api")

# user_id -> set of Expo push tokens ("ExponentPushToken[...]"). In-memory by
# design: tokens re-register every app open (see registerForPush on the
# client), so losing this on a backend restart/redeploy just means the next
# app open repopulates it — no separate datastore needed for this volume.
_push_tokens: dict[str, set[str]] = {}


class RegisterPushBody(BaseModel):
    user_id: str
    platform: str  # "android" | "ios" — kept for logging/debugging only
    device_token: str  # an Expo push token, e.g. "ExponentPushToken[xxxx]"


@push_router.post("/register-push", status_code=201)
async def register_push(body: RegisterPushBody):
    _push_tokens.setdefault(body.user_id, set()).add(body.device_token)
    return {"status": "registered"}


async def send_push(recipients: list[str], data: dict) -> None:
    if not recipients:
        return
    if "title" not in data or "message" not in data:
        raise ValueError("data must include title and message")

    tokens = sorted({t for uid in recipients for t in _push_tokens.get(uid, ())})
    if not tokens:
        return

    messages = [
        {
            "to": token,
            "title": data["title"],
            "body": data["message"],
            "data": {k: v for k, v in data.items() if k not in ("title", "message")},
        }
        for token in tokens
    ]
    # Expo accepts up to 100 messages per request.
    for i in range(0, len(messages), 100):
        resp = await _push_client.post(EXPO_PUSH_URL, json=messages[i : i + 100])
        if resp.status_code >= 500:
            raise HTTPException(502, "Push provider unavailable")
        resp.raise_for_status()


class NotifyBody(BaseModel):
    recipients: list[str]
    title: str
    message: str
    vihar_id: str | None = None


@push_router.post("/push/notify")
async def push_notify(body: NotifyBody):
    """Admin-triggered push. Deep-links to the given vihar when tapped."""
    data = {"title": body.title, "message": body.message}
    if body.vihar_id:
        data["action_url"] = f"/vihar/{body.vihar_id}"
    try:
        await send_push(body.recipients, data)
    except Exception as e:  # never crash the admin action on push failure
        logger.warning(f"Push failed (non-blocking): {e}")
        return {"status": "error", "detail": str(e)}
    return {"status": "sent", "count": len(body.recipients)}


@push_router.get("/health")
async def health():
    return {"status": "healthy", "service": "vihar-seva-companion", "upstream": UPSTREAM_API_URL}


# Register the local routes BEFORE the catch-all proxy so they take precedence.
app.include_router(push_router)

# Local routes that must NOT be proxied to the upstream API.
_LOCAL_PATHS = {"register-push", "push/notify", "health"}
_HOP_BY_HOP = {
    "host", "content-length", "connection", "keep-alive", "transfer-encoding",
    "accept-encoding",
}


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(path: str, request: Request):
    """Transparent passthrough to the production API (single source of truth)."""
    if path in _LOCAL_PATHS:
        raise HTTPException(404, "Not found")

    # Forward headers (keep Authorization), stripping hop-by-hop ones.
    fwd_headers = {
        k: v for k, v in request.headers.items() if k.lower() not in _HOP_BY_HOP
    }

    # WORKAROUND: the upstream GET /vihars/{id} currently throws HTTP 500 (an
    # undefined variable in its detail handler). Reconstruct the detail from
    # the working list endpoint so the app's join-seva flow works. Data still
    # comes from the upstream (single source of truth); we only reshape it.
    detail_match = re.fullmatch(r"vihars/([^/]+)", path)
    if request.method == "GET" and detail_match and detail_match.group(1) != "next-route-number":
        vihar_id = detail_match.group(1)
        detail = await _rebuild_vihar_detail(vihar_id, fwd_headers)
        if detail is not None:
            return Response(content=json.dumps(detail), status_code=200, media_type="application/json")
        # fall through to normal proxy if we could not rebuild

    body = await request.body()
    try:
        upstream_resp = await _upstream.request(
            request.method,
            f"/{path}",
            params=dict(request.query_params),
            content=body if body else None,
            headers=fwd_headers,
        )
    except httpx.HTTPError as e:
        logger.warning(f"Proxy error for /{path}: {e}")
        raise HTTPException(502, "Upstream unavailable")

    # WORKAROUND: upstream POST /auth/register returns HTTP 500 even though it
    # DOES create the user (serverless response quirk). If so, log the new user
    # in and return the token so the app's sign-up flow completes.
    if request.method == "POST" and path == "auth/register" and upstream_resp.status_code >= 500:
        try:
            creds = json.loads(body or b"{}")
            login_resp = await _upstream.post(
                "/auth/login",
                json={"phone": creds.get("phone"), "password": creds.get("password")},
            )
            if login_resp.status_code == 200:
                return Response(content=login_resp.content, status_code=200, media_type="application/json")
        except Exception as e:
            logger.warning(f"register fallback failed: {e}")

    # Pass body + content-type + status straight back.
    media_type = upstream_resp.headers.get("content-type", "application/json")
    return Response(
        content=upstream_resp.content,
        status_code=upstream_resp.status_code,
        media_type=media_type,
    )


async def _rebuild_vihar_detail(vihar_id: str, headers: dict):
    """Find a vihar in the upstream list and attach participants if allowed."""
    try:
        list_resp = await _upstream.get("/vihars", headers=headers, params={"limit": 2000})
        if list_resp.status_code != 200:
            return None
        vihars = list_resp.json()
    except Exception as e:
        logger.warning(f"rebuild detail: list fetch failed: {e}")
        return None

    match = next((v for v in vihars if v.get("id") == vihar_id), None)
    if match is None:
        return None

    # Attach participants when the caller is an admin (endpoint is admin-only;
    # volunteers get 403, which we silently ignore).
    try:
        p_resp = await _upstream.get(f"/vihars/{vihar_id}/participants", headers=headers)
        if p_resp.status_code == 200:
            match["participants"] = p_resp.json().get("participants", [])
    except Exception:
        pass
    return match


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
