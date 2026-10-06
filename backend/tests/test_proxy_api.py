"""Backend proxy + push companion tests for Naranpura Vihar Seva.

The companion backend TRANSPARENTLY proxies all /api/* data endpoints to the
production API (https://viharsevagroup.vercel.app/api). Only /api/health,
/api/register-push, /api/push/notify are served locally.
"""
import os
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

TEST_PHONE = "9000000007"
TEST_PASSWORD = "1111"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_token(session):
    resp = session.post(f"{API}/auth/login", json={"phone": TEST_PHONE, "password": TEST_PASSWORD}, timeout=30)
    assert resp.status_code == 200, f"login failed: {resp.status_code} {resp.text[:200]}"
    data = resp.json()
    assert "access_token" in data and data["access_token"], "missing access_token"
    assert "user" in data and data["user"].get("phone") == TEST_PHONE
    return data["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# ----- Health -----
class TestHealth:
    def test_health_ok(self, session):
        r = session.get(f"{API}/health", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d.get("status") == "healthy"
        assert d.get("service") == "vihar-seva-companion"
        assert "upstream" in d


# ----- Auth proxy -----
class TestAuth:
    def test_login_success(self, auth_token):
        assert isinstance(auth_token, str) and len(auth_token) > 20

    def test_login_bad_password(self, session):
        r = session.post(f"{API}/auth/login", json={"phone": TEST_PHONE, "password": "9999"}, timeout=20)
        assert r.status_code in (400, 401, 403), f"got {r.status_code}: {r.text[:200]}"


# ----- Vihars list / detail / my-vihars -----
class TestVihars:
    def test_list_vihars(self, session, auth_headers):
        r = session.get(f"{API}/vihars", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text[:200]
        data = r.json()
        assert isinstance(data, list), f"expected list, got {type(data)}"
        assert len(data) > 100, f"expected many vihars, got {len(data)}"
        v0 = data[0]
        assert "id" in v0
        pytest.vihar_sample_id = v0["id"]

    def test_get_vihar_detail(self, session, auth_headers):
        vid = getattr(pytest, "vihar_sample_id", None)
        if not vid:
            pytest.skip("no vihar id captured")
        r = session.get(f"{API}/vihars/{vid}", headers=auth_headers, timeout=20)
        assert r.status_code == 200, r.text[:200]
        d = r.json()
        assert d.get("id") == vid
        # user_status should be present (either None/"in"/"out")
        assert "user_status" in d, f"missing user_status, keys={list(d.keys())}"

    def test_my_vihars(self, session, auth_headers):
        r = session.get(f"{API}/vihars/user/my-vihars", headers=auth_headers, timeout=20)
        assert r.status_code == 200, r.text[:200]
        data = r.json()
        assert isinstance(data, list)


# ----- Participation idempotency -----
class TestParticipate:
    def test_participate_in_then_out(self, session, auth_headers):
        # pick a vihar to participate in
        r = session.get(f"{API}/vihars", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        vihars = r.json()
        assert vihars
        vid = vihars[0]["id"]

        # IN
        r1 = session.post(f"{API}/vihars/{vid}/participate",
                          headers=auth_headers,
                          json={"vihar_id": vid, "status": "in"}, timeout=20)
        assert r1.status_code in (200, 201), r1.text[:200]

        # IN again (idempotent — should not error / duplicate)
        r2 = session.post(f"{API}/vihars/{vid}/participate",
                          headers=auth_headers,
                          json={"vihar_id": vid, "status": "in"}, timeout=20)
        assert r2.status_code in (200, 201), r2.text[:200]

        # Verify shows up in my-vihars
        rmy = session.get(f"{API}/vihars/user/my-vihars", headers=auth_headers, timeout=20)
        assert rmy.status_code == 200
        ids = [v.get("id") for v in rmy.json()]
        assert vid in ids, "vihar not in my-vihars after opting in"

        # OUT
        r3 = session.post(f"{API}/vihars/{vid}/participate",
                          headers=auth_headers,
                          json={"vihar_id": vid, "status": "out"}, timeout=20)
        assert r3.status_code in (200, 201), r3.text[:200]


# ----- Reports -----
class TestReports:
    def test_summary_yearly(self, session, auth_headers):
        r = session.get(f"{API}/reports/summary?period=yearly", headers=auth_headers, timeout=20)
        assert r.status_code == 200, r.text[:200]
        d = r.json()
        assert isinstance(d, dict)
        # should have some aggregate totals
        assert len(d.keys()) > 0


# ----- Local-only routes must not be proxied -----
class TestLocalRoutes:
    def test_push_notify_rejects_bad(self, session):
        # Just confirm it's reachable (needs proper body; may return 422)
        r = session.post(f"{API}/push/notify", json={}, timeout=10)
        assert r.status_code in (401, 422, 500), r.status_code
