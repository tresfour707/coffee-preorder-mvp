type QuantityControlProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
}: QuantityControlProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50">
      <button
        type="button"
        onClick={onDecrement}
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
      >
        -
      </button>
      <span className="min-w-10 text-center text-sm font-semibold text-stone-900">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
      >
        +
      </button>
    </div>
  );
}
