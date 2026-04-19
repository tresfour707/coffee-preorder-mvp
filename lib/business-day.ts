import { BUSINESS_TIME_ZONE } from "@/lib/constants";

const businessDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const shortDateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: BUSINESS_TIME_ZONE,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: BUSINESS_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export function getBusinessDay(date = new Date()) {
  return businessDayFormatter.format(date);
}

export function formatDateTime(date: string | Date) {
  return shortDateTimeFormatter.format(new Date(date));
}

export function formatTime(date: string | Date) {
  return timeFormatter.format(new Date(date));
}
