import { Weekday } from "../_types/schema";

export interface WeekdayTimePlace {
  weekday: Weekday;
  time: TimePeriod;
  place: string;
}

export interface TimePeriod {
  start: string;
  end: string;
}

export default { parseAll, parseDay, parseTimeAndPlace, getPlaces };

export function parseAll(input: string): WeekdayTimePlace[] {
  const days = input.split("\n");

  return days.map(parseDay).flat();
}

export function parseDay(input: string): WeekdayTimePlace[] {
  const chineseWeekday = input.substring(0, 1);

  const timeAndPlaces = input.substring(1).trim().split(";");
  const timePlaces = timeAndPlaces.map(parseTimeAndPlace).flat();

  return timePlaces.map(timePlace => ({
    weekday: WeekdayMap[chineseWeekday as keyof typeof WeekdayMap],
    ...timePlace,
  }));
}

enum WeekdayMap {
  "一" = "MONDAY",
  "二" = "TUESDAY",
  "三" = "WEDNESDAY",
  "四" = "THURSDAY",
  "五" = "FRIDAY",
  "六" = "SATURDAY",
  "七" = "SUNDAY",
}

export function parseTimeAndPlace(
  input: string,
): Omit<WeekdayTimePlace, "weekday">[] {
  const [rawTimes, place] = input.split("：");
  const times = rawTimes.split("、");

  return times
    .map(time => ({
      time: convertTime(time.trim()),
      place,
    }))
    .filter(({ time }) => time !== null) as Omit<WeekdayTimePlace, "weekday">[];
}

function convertTime(time: string): TimePeriod | null {
  if (!time) return null;

  if (time === "午")
    return {
      start: "12:10",
      end: "13:00",
    };

  const index = parseInt(time, 10) - 1;
  const times = [
    ["08:10", "09:00"],
    ["09:10", "10:00"],
    ["10:10", "11:00"],
    ["11:10", "12:00"],
    ["13:10", "14:00"],
    ["14:10", "15:00"],
    ["15:10", "16:00"],
    ["16:10", "17:00"],
    ["17:10", "18:00"],
    ["18:10", "19:00"],
    ["19:10", "20:00"],
    ["20:10", "21:00"],
    ["21:10", "22:00"],
    ["22:10", "23:00"],
  ];
  const [start, end] = times[index];

  return { start, end };
}

export function getPlaces(input: string): string[] {
  const weekdayTimePlaces = parseAll(input);
  const places = weekdayTimePlaces
    .map(wtp => wtp.place)
    .filter((place, index, places) => places.indexOf(place) === index);

  return places;
}
