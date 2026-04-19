# Coffee Pre-Order MVP

Практичный MVP для кофейни с одной общей очередью для:
- online-заказов гостей,
- офлайн-заказов с кассы,
- и простого монитора бариста.

Главное бизнес-правило проекта: подтверждённые online и offline заказы попадают в одну общую производственную очередь и обрабатываются строго по времени подтверждения.

## Стек

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- polling для обновления статусов
- Zustand для customer cart

## Что реализовано

- customer flow: `/menu` → `/cart` → `Confirm order` → `/order/[id]`
- cashier flow: `/cashier` с быстрым набором корзины и подтверждением офлайн-заказа
- barista flow: `/barista` с текущим заказом и следующими позициями
- единая очередь для online и offline заказов
- daily public order number: общий сквозной номер внутри бизнес-дня
- автоматический переход очереди:
  - первый активный заказ всегда виден как `Preparing`
  - после `Ready` следующий `Waiting` автоматически становится текущим
- cancellation rules:
  - customer может отменить только online-заказ в статусе `Waiting`
  - cashier может отменить offline-заказ со staff-side
- `orders ahead` на странице статуса заказа

## Структура проекта

```text
app/
  api/
    products/
    orders/
      online/
      offline/
      [lookup]/
        cancel/
    queue/
      ready/
  menu/
  cart/
  order/[lookup]/
  cashier/
  barista/
components/
  customer/
  cashier/
  barista/
  ui/
lib/
  orders.ts
  queue.ts
  products.ts
  cart.ts
  cart-store.ts
  prisma.ts
prisma/
  schema.prisma
  seed.ts
```

## Установка

Нужен Node.js 20+.

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env` из примера:

```bash
cp .env.example .env
```

3. Сгенерируйте Prisma Client и создайте SQLite-схему:

```bash
npm run prisma:generate
npm run db:push
```

4. Заполните базу тестовым меню:

```bash
npm run db:seed
```

## Запуск

Режим разработки:

```bash
npm run dev
```

Production-сборка:

```bash
npm run build
npm run start
```

По умолчанию приложение поднимется на [http://localhost:3000](http://localhost:3000).

## Основные маршруты

- `/` — redirect на `/menu`
- `/menu` — меню для гостя
- `/cart` — корзина гостя
- `/order/[id]` — страница статуса заказа
- `/cashier` — интерфейс кассира
- `/barista` — монитор очереди для бариста

API-маршруты:

- `GET /api/products`
- `POST /api/orders/online`
- `POST /api/orders/offline`
- `GET /api/orders/[id]`
- `POST /api/orders/[id]/cancel`
- `GET /api/queue`
- `POST /api/queue/ready`

## Тестовые данные

В seed включены:

- Espresso
- Americano
- Cappuccino
- Latte
- Flat White
- Tea
- Croissant
- Cookie

Цены хранятся в minor units, чтобы не терять точность при расчётах.

## Коротко об архитектуре

### 1. Единая очередь

Вся логика очереди централизована в [`lib/queue.ts`](./lib/queue.ts):

- активные статусы: `WAITING` и `PREPARING`
- очередь сортируется по `confirmedAt`, затем по `createdAt`, затем по `id`
- первый активный заказ считается текущим и показывается как `PREPARING`
- остальные активные заказы показываются как `WAITING`

Функция `ensureQueueState()` вызывается после ключевых мутаций:

- создания online-заказа
- создания offline-заказа
- отмены
- перевода текущего заказа в `Ready`

Это гарантирует, что очередь автоматически сдвигается без дублирования логики по страницам.

### 2. Публичный номер заказа

Модель `Order` хранит:

- технический `id`
- публичный `publicOrderNumber`
- `businessDay`

Публичный номер:

- общий и для online, и для offline
- сбрасывается каждый бизнес-день
- уникален в паре `businessDay + publicOrderNumber`

### 3. Страница статуса заказа

Страница `/order/[id]` использует внутренний `id` как lookup для URL, но пользователю и сотрудникам показывается именно публичный номер заказа.

На странице доступны:

- public order number
- visible status
- `orders ahead`
- состав заказа
- отмена заказа, если он ещё в `Waiting`

Обновление идёт через polling.

### 4. Почему без лишней сложности

В проекте намеренно нет:

- auth для клиентов
- реальной оплаты
- websocket-слоя
- частичных возвратов
- многофилиальности
- сложной админки

Это оставляет MVP маленьким, но при этом сохраняет чистые точки расширения:

- online confirmation можно позже заменить на событие `payment succeeded`
- staff protection можно добавить поверх `/cashier` и `/barista`
- SQLite можно заменить на Postgres без слома продуктовой логики

## Важные допущения MVP

- customer order route использует технический `id`, чтобы не открывать чужие заказы по простому перебору публичных номеров
- SQLite подходит для локального MVP и демонстрации процесса
- очередь считается общей для всех подтверждённых активных заказов независимо от источника

## Полезный сценарий ручной проверки

1. Откройте `/cashier` и создайте офлайн-заказ.
2. Откройте `/menu`, добавьте товары и подтвердите online-заказ.
3. Перейдите в `/barista` и убедитесь, что заказы стоят в одной очереди по порядку подтверждения.
4. Нажмите `Mark current order as Ready` и проверьте, что следующий заказ автоматически стал `Preparing`.
5. Для online-заказа в `Waiting` откройте `/order/[id]` и проверьте отмену.

## Дальнейшие расширения

Если потребуется следующий шаг после MVP, логичнее всего добавлять в таком порядке:

1. реальную оплату и замену `Confirm order` на событие успешной оплаты
2. лёгкую staff-auth защиту
3. push-обновления вместо polling
4. unavailable item flow
