import { DateRange } from "../_types/schema";

const dateRanges: Omit<DateRange, "id">[] = [
  {
    uuid: "1d2b127d-82a9-473f-bc87-d658fa00731a",
    name: "112-1",
    description: null,
    startDate: new Date("2023-09-11"),
    endDate: new Date("2024-01-15"),
  },
];

export function getInputs() {
  return dateRanges;
}
