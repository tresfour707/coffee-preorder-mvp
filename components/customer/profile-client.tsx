"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { BackLink } from "@/components/customer/back-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { cn } from "@/lib/cn";
import type { ViewerSummary } from "@/lib/types";

type ProfileClientProps = {
  viewer: ViewerSummary;
};

type ProfileFormState = {
  name: string;
  birthDate: string;
  gender: string;
  email: string;
  phone: string;
};

function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatBirthDate(value: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(" г.", "");
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "email" | "tel" | "text";
  autoComplete?: string;
}) {
  return (
    <label className="block px-1 py-3">
      <span className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-stone-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder="-"
        className="mt-3 w-full bg-transparent text-[21px] font-normal leading-tight tracking-tight text-stone-950 outline-none placeholder:text-stone-300"
      />
    </label>
  );
}

function BirthDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <label className="relative block px-1 py-3">
      <span className="flex items-end justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-stone-400">
            Дата рождения
          </span>
          <span
            className={cn(
              "mt-3 block text-[21px] font-normal leading-tight tracking-tight",
              value ? "text-stone-950" : "text-stone-300",
            )}
          >
            {formatBirthDate(value)}
          </span>
        </span>
        <ChevronIcon />
      </span>

      <input
        type="date"
        value={value}
        max={today}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        aria-label="Дата рождения"
      />
    </label>
  );
}

function GenderControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const options = [
    { value: "MALE", label: "Мужской" },
    { value: "FEMALE", label: "Женский" },
  ];

  return (
    <section className="px-1 py-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-stone-400">
        Пол
      </p>
      <div className="mt-3 grid grid-cols-2 rounded-[15px] bg-[#e9e5e0] p-1">
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "min-h-9 rounded-[12px] text-[16px] font-medium tracking-tight transition active:scale-[0.98]",
                isActive
                  ? "bg-[#c9c7c5] text-white shadow-[0_8px_18px_rgba(65,60,55,0.09)]"
                  : "text-stone-700",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ProfileClient({ viewer }: ProfileClientProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileFormState>({
    name: viewer.name,
    birthDate: toDateInputValue(viewer.birthDate),
    gender: viewer.gender ?? "",
    email: viewer.email,
    phone: viewer.phone ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const header = (
    <section className="relative flex min-h-10 items-center justify-center">
      <BackLink
        href="/menu?panel=account"
        className="absolute left-0 h-9 w-8 [&_svg]:!h-7 [&_svg]:!w-7"
      />
      <h1 className="text-[26px] font-medium leading-none tracking-tight text-stone-950">
        Личные данные
      </h1>
    </section>
  );

  function updateField<Key extends keyof ProfileFormState>(
    key: Key,
    value: ProfileFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          birthDate: form.birthDate || null,
          gender: form.gender || null,
          email: form.email,
          phone: form.phone || null,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Не удалось сохранить изменения.");
      }

      setSuccess("Изменения сохранены");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось сохранить изменения.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <CustomerMobileShell
      viewer={viewer}
      className="pb-28 pt-0"
      contentClassName="mt-8"
      header={header}
    >
      <form onSubmit={handleSubmit} className="space-y-5 px-5">
        <ProfileField
          label="Имя"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          autoComplete="name"
        />

        <BirthDateField
          value={form.birthDate}
          onChange={(value) => updateField("birthDate", value)}
        />

        <GenderControl
          value={form.gender}
          onChange={(value) => updateField("gender", value)}
        />

        <ProfileField
          label="Эл. почта"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          type="email"
          inputMode="email"
          autoComplete="email"
        />

        <ProfileField
          label="Телефон"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
          inputMode="tel"
          autoComplete="tel"
        />

        {error ? (
          <p className="rounded-[22px] bg-[#fff0ed] px-5 py-4 text-center text-sm font-semibold text-[#b8493f]">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-[22px] bg-[#eef4ea] px-5 py-4 text-center text-sm font-semibold text-[#54764d]">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-2 flex min-h-12 w-full items-center justify-center rounded-full bg-[#6b4a38] px-6 py-3 text-[16px] font-semibold tracking-tight text-white shadow-[0_16px_36px_rgba(83,55,39,0.14)] transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-65"
        >
          {isSaving ? "Сохраняем" : "Сохранить изменения"}
        </button>
      </form>
    </CustomerMobileShell>
  );
}
