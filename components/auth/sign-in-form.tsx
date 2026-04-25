"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SignInFormProps = {
  nextPath: string;
};

export function SignInForm({ nextPath }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось войти.");
      }

      router.push(nextPath);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Не удалось войти.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="surface mx-auto w-full max-w-md p-6 md:p-8">
      <div>
        <p className="label-muted">Demo account</p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-900">
          Войти в аккаунт
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Это легкий demo-login. Он нужен, чтобы у каждого тестового пользователя
          были свои заказы и свой `userId`.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900"
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
            className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900"
            placeholder="Минимум 6 символов"
            autoComplete="current-password"
            required
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-full bg-stone-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:bg-stone-400"
      >
        {isSubmitting ? "Входим…" : "Войти"}
      </button>

      <p className="mt-4 text-sm text-stone-600">
        Нет аккаунта?{" "}
        <Link href={`/sign-up?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-stone-900">
          Создать
        </Link>
      </p>
    </form>
  );
}
