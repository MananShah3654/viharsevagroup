# Original and yearly Vihar numbers

- `total_no` is the original continuous number across all years.
- `route_no` is the yearly number, reset every August 1. The 2026–27 year runs August 1, 2026 through July 31, 2027.
- The original MongoDB backend in the sibling `viharsevagroup-main` checkout already generates these two fields. This branch's `server.py` forwards data requests to that API.
- New Vihars receive the highest yearly number in their date's season plus one and the highest original number across all years plus one. Backdated inserts use the next available number; they do not renumber saved Vihars.
- The app shows original/yearly columns in cards, lists, detail screens, and the admin form. Missing original numbers display a dash instead of incorrectly reusing the yearly number.

## Existing records

Historical data needs a separate migration if it lacks `total_no` or still has continuous numbers in `route_no` after August 1, 2026. Finish that migration before relying on the lifetime counter for new records: the deployed backend may still compute it only from `total_no`. The local original backend has also been updated to use legacy `route_no` values when `total_no` is absent, preserve assigned original numbers on edits, and paginate by numeric original number. These backend changes need deployment to affect the live API. A copy of the changes is saved in `patches/original-numbering.patch`.

`numbering_migration.py` only reads a local JSON export and writes a preview. It never connects to or updates a database. Use a complete export, including all seasons, so original-number duplicates are detected and yearly sequences start with the first Vihar.

```powershell
python backend/numbering_migration.py vihars-export.json --output numbering-preview.json
```

If the original continuous number is still stored in `route_no`, explicitly confirm that when producing the plan:

```powershell
python backend/numbering_migration.py vihars-export.json --output numbering-preview.json --legacy-route-numbers
```

The preview preserves original numbers, assigns yearly numbers in Vihar-date order (original number breaks same-day ties), and restarts at each August 1 from 2026 onward. It leaves earlier yearly numbers unchanged. Invalid dates, missing originals after the cutoff, duplicate ids, or duplicate originals block the whole plan. Review and back up the live data before applying a plan through the original database backend; this script has no apply mode.

Local checks:

```powershell
python -m unittest discover -s backend/tests -p test_numbering_migration.py
```
