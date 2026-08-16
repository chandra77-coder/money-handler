const applySpendAmountChange = (currentTotal, oldAmount, newAmount) =>
  currentTotal - (newAmount - oldAmount);

const assertEqual = (actual, expected, label) => {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
  console.log(`PASS: ${label}`);
};

// New spend entries deduct their full amount.
assertEqual(applySpendAmountChange(1000, 0, 200), 800, "new spend deducts full amount");

// Increasing an existing spend deducts only the increase.
assertEqual(applySpendAmountChange(800, 200, 300), 700, "spend increase applies only the delta");

// Decreasing an existing spend restores only the decrease.
assertEqual(applySpendAmountChange(800, 200, 100), 900, "spend decrease restores only the delta");

// Re-saving the same amount does not change the balance.
assertEqual(applySpendAmountChange(800, 200, 200), 800, "same-amount edit is neutral");

console.log("All spend delta regression tests passed.");
