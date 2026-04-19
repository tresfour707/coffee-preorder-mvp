import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-grid flex min-h-screen items-center justify-center">
      <div className="surface max-w-md p-8 text-center">
        <p className="label-muted">Not Found</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">
          Страница не найдена
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Возможно, заказ уже был удалён из истории маршрута или ссылка введена
          неверно.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Вернуться в меню
        </Link>
      </div>
    </main>
  );
}
