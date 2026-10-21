# Snapshot v1 → v2 / simulation ts-w1-2

The existing database `next-stop-little-shop-w1`, object store `saves`, and keys `shop.w1.normal` / `shop.w1.sandbox` remain unchanged. No database reset, new Site, origin change or namespace replacement is required. Local and sandbox clocks retain their meanings.

Only schema 1 + simulation `ts-w1-1` + content `w1-provisional-1` is eligible for migration. Validate every field with explicit numeric types/ranges first; malformed legacy snapshots are rejected. On a clone, set schemaVersion=2, simulationVersion=`ts-w1-2`, and recovery={total:0,grants:[]}. Preserve identity/mark, all stable IDs, cash, stock, prices, book costs, purchases, reports, expenses, expense remainders, shelves, command IDs, watermark, last wall time, sale event sequence and earned tutorial/reveal progress. Legacy fractional demand alone resets once: v1 did not record the price provenance of this remainder. This prevents carrying old low-price demand across the version boundary. No money, inventory or report is retroactively recomputed.

Read validates/migrates in memory. The next successful atomic write persists v2 and advances revision by exactly one storage transaction. Failed commands/imports never replace the original record. Imports use the returned migrated snapshot, rather than merely checking it. Revision comparison uses the validated current record. A previous v1 client cannot validate v2, so it cannot continue economic writes; users should refresh old tabs. Concurrent current clients use the same revision CAS.

Unknown schema/simulation/content versions, schema 0, bad dates/references, coercible numeric strings, null/boolean/array numeric fields and unsafe numbers reject. Raw export remains available when stored data cannot be loaded. Never delete a damaged record automatically.

In simulation ts-w1-2, a real price change resets only that Offering's fractional demand; an identical-price command preserves it. Settlement never appends command IDs and remains possible at the ordinary-command limit of 100,000. No silent ledger pruning. The frozen C# proof was not updated and is not a second active/parity-tested economy.

Synthetic v1 fixtures for both modes, created from the retrieved W1 source before edits, are retained under `evidence/w1_1/baseline/`. They are not user runtime saves. Tests assert preservation and valid migration; old unknown-version tests now use v3 as the unknown future schema.
