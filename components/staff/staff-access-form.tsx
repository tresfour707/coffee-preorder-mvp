"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type StaffAccessFormProps = {
  nextPath: string;
};

export function StaffAccessForm({ nextPath }: StaffAccessFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/staff/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось открыть staff-режим.");
      }

      router.push(nextPath);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось открыть staff-режим.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface mx-auto w-full max-w-md p-6 md:p-8">
      <div>
        <p className="kicker">Staff access</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
          Открыть staff-экраны
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-600 md:text-base">
          Это лёгкая защита для demo-доступа к экранам бариста и офлайн-приёма заказа.
          По умолчанию используйте код{" "}
          <span className="font-semibold text-stone-900">demo123</span>.
        </p>
      </div>

      <label className="mt-6 block">
        <span className="text-sm font-medium text-stone-700">Demo code</span>
        <input
          type="password"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="field-input"
          placeholder="Введите код доступа"
          required
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary mt-6 w-full disabled:cursor-wait disabled:bg-stone-400"
      >
        {isSubmitting ? "Открываем…" : "Открыть доступ"}
      </button>
    </form>
  );
}
