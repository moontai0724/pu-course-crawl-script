import { TimeRange } from "../_types/schema";
import WeekdayTimePlaceParser, {
  WeekdayTimePlace,
} from "../utils/weekday-time-place-parser";

export type RawTime = Omit<TimeRange, "id" | "startTime" | "endTime"> & {
  startTime: string;
  endTime: string;
  courses: number[];
};

const times: RawTime[] = [];

export function getAll(): typeof times {
  if (times.length) return times;

  const elements = document.querySelectorAll("table tr td:nth-child(8)");
  Array.from(elements).forEach((element, id) => {
    const text = element.textContent?.trim() ?? "";
    const weekdayTimePlaces = WeekdayTimePlaceParser.parseAll(text);

    weekdayTimePlaces.forEach(wtp => {
      const existing = getOne(wtp);
      if (existing) {
        if (!existing.courses.includes(id)) existing.courses.push(id);
        return;
      }

      times.push({
        weekday: wtp.weekday,
        startTime: wtp.time.start,
        endTime: wtp.time.end,
        courses: [id],
      });
    });
  });

  return times;
}

export function getOne(item: WeekdayTimePlace) {
  return (
    times.find(
      time =>
        time.weekday === item.weekday &&
        time.startTime === item.time.start &&
        time.endTime === item.time.end,
    ) ?? null
  );
}
