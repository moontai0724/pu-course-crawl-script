import { TimeRange } from "../_types/schema";
import WeekdayTimePlaceParser, {
  WeekdayTimePlace,
} from "../utils/weekday-time-place-parser";

export type RawTime = Omit<TimeRange, "startTime" | "endTime"> & {
  startTime: string;
  endTime: string;
  courses: number[];
};

export default {
  getAll,
  getByElement,
  getOne,
};

const times: RawTime[] = [];

export function getAll(): typeof times {
  if (times.length) return times;

  const elements = document.querySelectorAll("table tr td:nth-child(8)");

  let counter = 1;

  Array.from(elements).forEach((element, courseId) => {
    const text = element.textContent?.trim() ?? "";
    const weekdayTimePlaces = WeekdayTimePlaceParser.parseAll(text);

    weekdayTimePlaces.forEach(wtp => {
      const existing = getOne(wtp);
      if (existing) {
        if (!existing.courses.includes(courseId))
          existing.courses.push(courseId);
        return;
      }

      times.push({
        id: counter++,
        weekday: wtp.weekday,
        startTime: wtp.time.start,
        endTime: wtp.time.end,
        courses: [courseId],
      });
    });
  });

  return times;
}

export function getByElement(element: Element) {
  const text = element.textContent?.trim() ?? "";
  const weekdayTimePlaces = WeekdayTimePlaceParser.parseAll(text);
  return weekdayTimePlaces.map(wtp => getOne(wtp));
}

export function getOne(item: RawTime): RawTime | null;
export function getOne(item: WeekdayTimePlace): RawTime | null;
export function getOne(
  item: Partial<WeekdayTimePlace & RawTime>,
): RawTime | null {
  return (
    times.find(
      time =>
        time.weekday === item.weekday &&
        time.startTime === (item.startTime || item.time?.start) &&
        time.endTime === (item.endTime || item.time?.end),
    ) ?? null
  );
}
