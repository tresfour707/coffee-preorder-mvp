"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { BackLink } from "@/components/customer/back-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { cn } from "@/lib/cn";
import type { ViewerSummary } from "@/lib/types";

type PaymentMethodsClientProps = {
  viewer: ViewerSummary;
};

type DemoCard = {
  id: string;
  last4: string;
};

const logoSources = {
  mir: "https://commons.wikimedia.org/wiki/Special:FilePath/Mir-logo.SVG.svg",
  sbp: "https://commons.wikimedia.org/wiki/Special:FilePath/Faster%20Payment%20System%20Russia%20logo.svg",
  sber: "https://commons.wikimedia.org/wiki/Special:FilePath/Sberbank%20Logo%202020.svg",
  tbank: "https://commons.wikimedia.org/wiki/Special:FilePath/T-Bank%20RU%20logo.svg",
  vtb: "https://commons.wikimedia.org/wiki/Special:FilePath/VTB%20Logo%202018.svg",
  alfa: "https://commons.wikimedia.org/wiki/Special:FilePath/Alfa%20Bank%20RU%20logo.svg",
};

const initialCards: DemoCard[] = [
  { id: "mir-4829", last4: "4829" },
  { id: "mir-7364", last4: "7364" },
  { id: "mir-1958", last4: "1958" },
];

const banks = [
  { id: "sber", name: "Сбербанк", logo: logoSources.sber },
  { id: "tbank", name: "Т-Банк", logo: logoSources.tbank },
  { id: "vtb", name: "Банк ВТБ", logo: logoSources.vtb },
  { id: "alfa", name: "АЛЬФА-БАНК", logo: logoSources.alfa },
];

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-stone-300"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
    >
      <path d="M6.5 6.5 17.5 17.5" />
      <path d="m17.5 6.5-11 11" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function LogoFrame({
  src,
  alt,
  compact = false,
}: {
  src: string;
  alt: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[12px] border border-stone-200/80 bg-white shadow-[0_4px_12px_rgba(31,23,18,0.035)]",
        compact ? "h-10 w-[58px]" : "h-11 w-[66px]",
      )}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-7 max-w-[50px] object-contain"
        loading="lazy"
      />
    </span>
  );
}

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-4 px-1">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-stone-400">
        {title}
      </h2>
      {action}
    </div>
  );
}

function CardRow({
  card,
  isEditing,
  onRemove,
}: {
  card: DemoCard;
  isEditing: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="flex min-h-[64px] items-center gap-4 border-b border-stone-200/60 px-4 py-3 last:border-b-0">
      <LogoFrame src={logoSources.mir} alt="МИР" compact />
      <span className="min-w-0 flex-1 text-[21px] font-medium leading-none tracking-tight text-stone-950">
        •••• {card.last4}
      </span>

      {isEditing ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Удалить карту"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ee6a61] text-white shadow-[0_8px_18px_rgba(190,59,53,0.14)] transition active:scale-[0.94]"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}

function BankPicker({
  onSelect,
  onClose,
}: {
  onSelect: () => void;
  onClose: () => void;
}) {
  return (
    <section className="mt-3 rounded-[24px] bg-white/58 px-4 py-4 shadow-[0_12px_26px_rgba(31,23,18,0.055)] backdrop-blur-[18px]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[21px] font-medium leading-none tracking-tight text-stone-950">
          Выбор банка
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть выбор банка"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0ece8] text-stone-500 transition active:scale-[0.94]"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="mt-4 space-y-1">
        {banks.map((bank) => (
          <button
            key={bank.id}
            type="button"
            onClick={onSelect}
            className="flex w-full items-center gap-4 rounded-[18px] px-1 py-3 text-left transition active:bg-white/70"
          >
            <LogoFrame src={bank.logo} alt={bank.name} compact />
            <span className="min-w-0 flex-1 text-[19px] font-medium leading-none tracking-tight text-stone-950">
              {bank.name}
            </span>
            <ChevronIcon />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 flex min-h-11 w-full items-center justify-center rounded-[18px] bg-[#eee9e3] px-5 py-3 text-[16px] font-semibold tracking-tight text-stone-950 transition active:scale-[0.98]"
      >
        Выбрать другой банк
      </button>
    </section>
  );
}

function AddCardForm({
  onAdd,
  onCancel,
}: {
  onAdd: (last4: string) => void;
  onCancel: () => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expires, setExpires] = useState("");
  const [cvv, setCvv] = useState("");

  function formatCardNumber(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpires(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function formatCvv(value: string) {
    return value.replace(/\D/g, "").slice(0, 3);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = cardNumber.replace(/\D/g, "");
    onAdd(digits.slice(-4).padStart(4, "0"));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-[24px] bg-white/58 px-4 py-4 shadow-[0_12px_26px_rgba(31,23,18,0.055)] backdrop-blur-[18px]"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[21px] font-medium leading-none tracking-tight text-stone-950">
          Новая карта
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Закрыть добавление карты"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0ece8] text-stone-500 transition active:scale-[0.94]"
        >
          <CloseIcon />
        </button>
      </div>

      <label className="mt-4 block rounded-[18px] bg-[#f6f1ec] px-4 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-400">
          Номер карты
        </span>
        <input
          value={cardNumber}
          onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          className="mt-2 w-full bg-transparent text-[19px] font-medium tracking-tight text-stone-950 outline-none placeholder:text-stone-300"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block rounded-[18px] bg-[#f6f1ec] px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-400">
            Действует до
          </span>
          <input
            value={expires}
            onChange={(event) => setExpires(formatExpires(event.target.value))}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="ММ/ГГ"
            className="mt-2 w-full bg-transparent text-[19px] font-medium tracking-tight text-stone-950 outline-none placeholder:text-stone-300"
          />
        </label>
        <label className="block rounded-[18px] bg-[#f6f1ec] px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-400">
            CVV/CVC
          </span>
          <input
            value={cvv}
            onChange={(event) => setCvv(formatCvv(event.target.value))}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="•••"
            className="mt-2 w-full bg-transparent text-[19px] font-medium tracking-tight text-stone-950 outline-none placeholder:text-stone-300"
          />
        </label>
      </div>

      <div className="mt-3 rounded-[18px] bg-[#f1ebe5] px-4 py-3 text-[13px] leading-5 text-stone-600">
        <p className="font-semibold text-stone-900">Мы гарантируем безопасность платежа.</p>
        <p className="mt-1">
          Все операции проходят на стороне банка, а ваши данные надежно зашифрованы.
        </p>
      </div>

      <button
        type="submit"
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-[#8f6f5c] px-6 py-3 text-[16px] font-semibold tracking-tight text-white shadow-[0_14px_30px_rgba(116,84,64,0.13)] transition active:scale-[0.98]"
      >
        Сохранить карту
      </button>
    </form>
  );
}

export function PaymentMethodsClient({ viewer }: PaymentMethodsClientProps) {
  const [cards, setCards] = useState<DemoCard[]>(initialCards);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showBanks, setShowBanks] = useState(false);

  const header = (
    <section className="relative flex min-h-10 items-center justify-center">
      <BackLink
        href="/menu?panel=account"
        className="absolute left-0 h-9 w-8 [&_svg]:!h-7 [&_svg]:!w-7"
      />
      <h1 className="text-[26px] font-medium leading-none tracking-tight text-stone-950">
        Способы оплаты
      </h1>
    </section>
  );

  function handleAddCard(last4: string) {
    const card = {
      id: `mir-${Date.now()}`,
      last4,
    };

    setCards((current) => [...current, card]);
    setShowAddCard(false);
  }

  return (
    <CustomerMobileShell
      viewer={viewer}
      className="pb-28 pt-0"
      contentClassName="mt-8"
      header={header}
    >
      <section>
        <SectionTitle title="СБП" />
        <button
          type="button"
          onClick={() => {
            setShowBanks((current) => !current);
            setShowAddCard(false);
          }}
          className="flex min-h-[64px] w-full items-center gap-4 rounded-[24px] bg-white/62 px-4 py-3 text-left shadow-[0_14px_30px_rgba(31,23,18,0.055)] backdrop-blur-[18px] transition active:scale-[0.99]"
        >
          <LogoFrame src={logoSources.sbp} alt="СБП" compact />
          <span className="min-w-0 flex-1 text-[20px] font-medium leading-none tracking-tight text-stone-950">
            Новый счет СБП
          </span>
          <ChevronIcon />
        </button>
        {showBanks ? (
          <BankPicker
            onSelect={() => setShowBanks(false)}
            onClose={() => setShowBanks(false)}
          />
        ) : null}
      </section>

      <section className="mt-7">
        <SectionTitle
          title="Сохраненные карты"
          action={
            cards.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsEditing((current) => !current)}
                className="text-[15px] font-semibold tracking-tight text-[#6b4a38]"
              >
                {isEditing ? "Готово" : "Изменить"}
              </button>
            ) : null
          }
        />

        <div className="overflow-hidden rounded-[24px] bg-white/62 shadow-[0_14px_30px_rgba(31,23,18,0.055)] backdrop-blur-[18px]">
          {cards.length > 0 ? (
            cards.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                isEditing={isEditing}
                onRemove={() =>
                  setCards((current) => current.filter((item) => item.id !== card.id))
                }
              />
            ))
          ) : (
            <p className="px-4 py-4 text-[15px] leading-5 text-stone-500">
              Пока нет сохраненных карт.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddCard((current) => !current);
            setShowBanks(false);
            setIsEditing(false);
          }}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#efe6dc] px-5 py-3 text-[16px] font-semibold tracking-tight text-[#6b4a38] shadow-[0_12px_26px_rgba(83,55,39,0.08)] transition active:scale-[0.98]"
        >
          <PlusIcon />
          Добавить карту
        </button>

        {showAddCard ? (
          <AddCardForm
            onAdd={handleAddCard}
            onCancel={() => setShowAddCard(false)}
          />
        ) : null}
      </section>
    </CustomerMobileShell>
  );
}
