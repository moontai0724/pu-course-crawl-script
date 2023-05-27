import TimeRangeItem, { TTimeRange } from "../items/time-range.item";
import WeekdayTimePlaceParser from "../utils/weekday-time-place-parser";

const times: TimeRangeItem[] = [];

function load() {
  const data = sessionStorage.getItem("times");
  if (!data) return;

  const parsed = JSON.parse(data) as TTimeRange[];
  parsed.forEach(item => {
    times.push(new TimeRangeItem(item));
  });
}

function save() {
  const data = times.map(time => time.getData());
  sessionStorage.setItem("times", JSON.stringify(data));
}

export function parse(tdElement?: Element | null): TimeRangeItem[] {
  if (!tdElement) return [];

  const places: TimeRangeItem[] = [];

  const text = (tdElement as HTMLElement).innerText || "";
  const wtps = WeekdayTimePlaceParser.parseAll(text);

  wtps.forEach(wtp => {
    const place = new TimeRangeItem(wtp, tdElement);
    add(place);
  });

  return places;
}

export function findExisting(time: TimeRangeItem) {
  if (times.length === 0) load();
  return times.find(item => item.getHash() === time.getHash());
}

export function add(time: TimeRangeItem) {
  if (times.length === 0) load();
  const existing = findExisting(time);
  if (existing) return;

  times.push(time);
  save();
}

export function toInputData() {
  if (times.length === 0) load();
  return times.map(time => time.toInputData());
}
