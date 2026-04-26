"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SignUpFormProps = {
  nextPath: string;
};

export function SignUpForm({ nextPath }: SignUpFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось создать аккаунт.");
      }

      router.push(nextPath);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось создать аккаунт.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="customer-soft-card-strong mx-auto w-full px-5 py-6"
    >
      <div>
        <p className="kicker text-stone-400">Demo account</p>
        <h2 className="mt-3 text-[30px] font-semibold leading-[0.98] tracking-tight text-stone-900">
          Создать аккаунт
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Аккаунт нужен для demo, чтобы корзина и история заказов были привязаны к
          конкретному пользователю и не пересекались между собой.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Имя</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field-input"
            placeholder="Например, Анна"
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-input"
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field-input"
            placeholder="Минимум 6 символов"
            autoComplete="new-password"
            required
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-[24px] bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary mt-6 w-full disabled:cursor-wait disabled:bg-stone-400"
      >
        {isSubmitting ? "Создаём…" : "Создать аккаунт"}
      </button>

      <p className="mt-4 text-sm text-stone-600">
        Уже есть аккаунт?{" "}
        <Link
          href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
          className="font-semibold text-stone-900 underline decoration-stone-300 underline-offset-4"
        >
          Войти
        </Link>
      </p>
    </form>
  );
}
