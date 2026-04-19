const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 2,
});

export function formatMoney(amountInMinorUnits: number) {
  return moneyFormatter.format(amountInMinorUnits / 100);
}
