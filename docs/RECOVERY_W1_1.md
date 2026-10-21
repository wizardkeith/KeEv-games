# W1.1 free reopening support — provisional

This is a small prototype safety net, not final balance approval. It does not change the Bible, require payment, delete debt or erase history.

Eligibility is evaluated inside the same atomic core command as the grant: total stock across all ten valid Offerings must be zero and cash must be below the discounted cost of one cheapest Offering. Goods not currently displayed still count as sellable stock. A normal new shop is ineligible.

The target balance is the cost of five cheapest items, plus 48 hours of rent, plus ten trading hours of staff wages and operating costs. With the current provisional configuration: 5 × 10 + 48 × 20 + 10 × (30 + 10) = **1,410 normalized units**, displayed as ¥14,100. The grant is target minus current cash, including any negative balance. The current cheapest Offering is `off.pencil`. The player then explicitly purchases five pencils and displays them on any chosen shelf.

The eleven-day closed/empty scenario has cash −280 and historic rent 5,280. Its explicit grant is 1,690, leaving cash 1,410. Five pencils cost 50; one trading hour at the suggested price produces sales 125, COGS 50 and salary/rent/operations 60, an incremental net profit of 15. Earlier expenses remain exactly where they were. A daily report can still show a loss if earlier rent was incurred that day.

Every grant records command ID, simulation watermark, amount, cash before and after. The total is separate from sales, reports, eventSequence and tutorial/discovery unlock progress. For internally generated snapshots, cash = initial cash + support + cumulative net profit − current inventory book cost. Support never becomes regional net-profit progress.

There is no cooldown that could leave a returning player permanently trapped. A later episode may qualify again only after all stock is gone and cash again falls below a minimum purchase. Immediately retrying with the same ID is a no-op; a different ID is ineligible after the first grant because the new cash balance exceeds the threshold. IndexedDB revision CAS serializes concurrent tabs, including attempts with different IDs. A stale client must reload. Ordinary ledger limits still apply; no command IDs are silently pruned.

Rent continues to accrue. The 48-hour/ten-trading-hour buffer does not promise permanent solvency or income. The UI explains this before claiming, previews grant and resulting cash, and identifies the next purchase/display step. Both normal and sandbox retain independent support histories and rankingEligible=false.

Implementation: `src/core/recovery.ts`, `recover` command, v2 snapshot validation and storage transaction. Regression coverage includes eligibility boundaries, history conservation, actual sale after reopening, repeat episodes, same/different ID retry and concurrent IDB clients.
