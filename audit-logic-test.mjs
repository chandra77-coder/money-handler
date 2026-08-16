import assert from "node:assert/strict";
import { advanceRecurringDate, applySpendAmountChange, createId, getLast6Months, smartSearch, toAmount } from "./src/utils/dataHelpers.js";
import { todayStr } from "./src/utils/formatters.js";

assert.equal(toAmount("1250.50"), 1250.5);
assert.equal(toAmount("not-a-number"), 0);
assert.equal(applySpendAmountChange(1000, 250, 400), 850);
assert.equal(applySpendAmountChange(1000, 250, 250), 1000);
assert.equal(applySpendAmountChange(1000, 0, 250), 750);
assert.deepEqual(smartSearch([{ amount: 600 }, { amount: 100 }], ">500", ["amount"]), [{ amount: 600 }]);
assert.deepEqual(smartSearch([{ amount: 600 }, { amount: 100 }], "<500", ["amount"]), [{ amount: 100 }]);
assert.notEqual(createId(), createId());
assert.equal(todayStr(new Date(2026, 0, 2)), "2026-01-02");
const months = getLast6Months([{ type: "income", amount: "100", date: todayStr() }]);
assert.equal(months.at(-1).income, 100);
assert.equal(months.at(-1).isCurrentMonth, true);
assert.equal(advanceRecurringDate("2026-01-31", "monthly"), "2026-02-28");
assert.equal(advanceRecurringDate("2026-01-02", "weekly"), "2026-01-09");
console.log("Audit logic tests passed.");
