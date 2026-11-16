"""Preview original/yearly Vihar numbering from a JSON export. Never accesses a database."""
import argparse
import json
import re
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

CUTOFF = date(2026, 8, 1)


def parse_vihar_date(value):
    for pattern in ("%d/%m/%y", "%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(str(value), pattern).date()
        except ValueError:
            pass
    raise ValueError(f"Invalid Vihar date: {value!r}")


def positive_number(value):
    if isinstance(value, bool) or not isinstance(value, (str, int)):
        return None
    text = str(value).strip()
    return int(text) if re.fullmatch(r"[0-9]+", text) and int(text) > 0 else None


def build_plan(records, *, legacy_route_numbers=False):
    """Preserve original numbers; restart yearly numbers from August 2026.

    Existing records are ordered by Vihar date, then original number.
    Missing originals after the cutoff require a confirmed legacy export.
    """
    if not isinstance(records, list):
        raise ValueError("Input must be a JSON array of Vihar records")
    plan = {"cutoff": CUTOFF.isoformat(), "records": len(records), "changes": [], "errors": []}
    prepared = []
    seen_ids = set()
    seen_originals = set()
    for record in records:
        if not isinstance(record, dict):
            plan["errors"].append("Every Vihar must be an object")
            continue
        identifier = record.get("id")
        if not isinstance(identifier, str) or not identifier or identifier in seen_ids:
            plan["errors"].append(f"Missing or duplicate Vihar id: {identifier!r}")
            continue
        seen_ids.add(identifier)
        try:
            vihar_date = parse_vihar_date(record.get("vihar_date"))
        except ValueError as error:
            plan["errors"].append(f"{identifier}: {error}")
            continue
        original = record.get("total_no")
        if original in (None, ""):
            if vihar_date >= CUTOFF and not legacy_route_numbers:
                plan["errors"].append(
                    f"{identifier}: missing original number after August 1, 2026; "
                    "restore it from historical data, or use --legacy-route-numbers "
                    "only if route_no still contains the original continuous number"
                )
                continue
            original = record.get("route_no")
        numeric_original = positive_number(original)
        if numeric_original is None or numeric_original in seen_originals:
            plan["errors"].append(f"{identifier}: invalid or duplicate original number")
            continue
        seen_originals.add(numeric_original)
        prepared.append((vihar_date, numeric_original, identifier, record, str(original).strip()))
    # An ambiguous export must never produce an applicable set of changes.
    if plan["errors"]:
        return plan
    seasons = defaultdict(int)
    for vihar_date, _, identifier, record, original in sorted(prepared):
        after = {"total_no": original, "route_no": record.get("route_no")}
        season_year = vihar_date.year if vihar_date.month >= 8 else vihar_date.year - 1
        if vihar_date >= CUTOFF:
            seasons[season_year] += 1
            after["route_no"] = str(seasons[season_year])
        before = {key: record[key] for key in ("route_no", "total_no") if key in record}
        if before != after:
            plan["changes"].append({
                "id": identifier,
                "vihar_date": record["vihar_date"],
                "season": f"{season_year}-{str(season_year + 1)[-2:]}",
                "before": before,
                "after": after,
            })
    return plan


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Complete JSON export of all Vihars")
    parser.add_argument("--output", required=True, type=Path, help="New JSON preview file")
    parser.add_argument("--legacy-route-numbers", action="store_true",
                        help="Confirm missing total_no can be recovered from the original route_no")
    args = parser.parse_args()
    records = json.loads(args.input.read_text(encoding="utf-8-sig"))
    plan = build_plan(records, legacy_route_numbers=args.legacy_route_numbers)
    # Exclusive creation prevents overwriting the input or an earlier reviewed plan.
    with args.output.open("x", encoding="utf-8") as output:
        json.dump(plan, output, ensure_ascii=False, indent=2)
        output.write("\n")
    print(f"Preview: {len(plan['changes'])} changes, {len(plan['errors'])} errors. No database was changed.")
    return 1 if plan["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
