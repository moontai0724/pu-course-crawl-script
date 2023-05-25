import { DateRange } from "_types/schema";

const dateRanges: Omit<DateRange, "uuid">[] = [
  {
    id: 1,
    name: "112-1",
    description: null,
    startDate: new Date("2023-09-11"),
    endDate: new Date("2024-01-15"),
  },
];

export function getAll() {
  return dateRanges;
}

export function getOne(id: number) {
  return getAll().find(dateRange => dateRange.id === id);
}

export function getInputs() {
  return dateRanges;
}
