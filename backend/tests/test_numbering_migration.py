import unittest
from copy import deepcopy

from backend.numbering_migration import build_plan


def vihar(identifier, day, original, yearly):
    return {"id": identifier, "vihar_date": day, "total_no": original, "route_no": yearly}


class NumberingMigrationTests(unittest.TestCase):
    def test_august_boundary_and_future_years_preserve_original_numbers(self):
        records = [
            vihar("d", "01/08/27", "503", "503"),
            vihar("b", "01/08/2026", "501", "501"),
            vihar("a", "31/07/26", "500", "500"),
            vihar("c", "2027-07-31", "502", "502"),
        ]
        saved = deepcopy(records)
        plan = build_plan(records)
        self.assertEqual(plan["errors"], [])
        result = {change["id"]: change["after"] for change in plan["changes"]}
        self.assertNotIn("a", result)
        self.assertEqual(result["b"], {"total_no": "501", "route_no": "1"})
        self.assertEqual(result["c"], {"total_no": "502", "route_no": "2"})
        self.assertEqual(result["d"], {"total_no": "503", "route_no": "1"})
        self.assertEqual(records, saved)

    def test_legacy_originals_require_explicit_confirmation_after_cutoff(self):
        records = [{"id": "a", "vihar_date": "01/08/26", "route_no": "501"}]
        self.assertTrue(build_plan(records)["errors"])
        plan = build_plan(records, legacy_route_numbers=True)
        self.assertEqual(plan["errors"], [])
        self.assertEqual(plan["changes"][0]["after"], {"total_no": "501", "route_no": "1"})

    def test_historical_legacy_original_is_preserved_exactly(self):
        plan = build_plan([{"id": "a", "vihar_date": "31/07/26", "route_no": "00500"}])
        self.assertEqual(plan["changes"][0]["after"], {"total_no": "00500", "route_no": "00500"})

    def test_duplicate_originals_are_rejected_without_partial_plan(self):
        plan = build_plan([vihar("a", "01/08/26", "501", "1"), vihar("b", "02/08/26", "0501", "2")])
        self.assertTrue(plan["errors"])
        self.assertEqual(plan["changes"], [])

    def test_invalid_dates_and_ids_are_rejected(self):
        for records in ([vihar("a", "31/02/26", "1", "1")],
                        [vihar("a", "01/08/26", "1", "1"), vihar("a", "02/08/26", "2", "2")]):
            with self.subTest(records=records):
                self.assertTrue(build_plan(records)["errors"])
                self.assertEqual(build_plan(records)["changes"], [])

    def test_plan_is_idempotent_and_orders_same_day_by_original(self):
        records = [vihar("b", "01/08/26", "502", "502"), vihar("a", "01/08/26", "501", "501")]
        plan = build_plan(records)
        changes = {change["id"]: change["after"] for change in plan["changes"]}
        self.assertEqual(changes["a"]["route_no"], "1")
        self.assertEqual(changes["b"]["route_no"], "2")
        migrated = [{**record, **changes[record["id"]]} for record in records]
        self.assertEqual(build_plan(migrated)["changes"], [])


if __name__ == "__main__":
    unittest.main()
