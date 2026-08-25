import { Entry } from './types';

export function dayKey(value: Date | string = new Date()) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function entriesForDay(entries: Entry[], day: string) {
  return entries.filter((entry) => dayKey(entry.createdAt) === day);
}

export function caloriesForDay(entries: Entry[], day: string) {
  return entriesForDay(entries, day).reduce((total, entry) => total + entry.calories, 0);
}

export function timeLabel(iso: string) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}

export function dateLabel(day: string) {
  const date = new Date(`${day}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}
