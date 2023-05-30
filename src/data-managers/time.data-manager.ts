import TimeRangeItem, { TTimeRange } from "../items/time-range.item";
import WeekdayTimePlaceParser from "../utils/weekday-time-place-parser";

const times: TimeRangeItem[] = [];

function load() {
  if (times.length) return;

  const data = sessionStorage.getItem("times");
  if (!data) return;

  const parsed = JSON.parse(data) as TTimeRange[];
  parsed.forEach((item, index) => {
    const id = item.id ?? index;
    times.push(new TimeRangeItem({ id, ...item }));
  });
}

function save() {
  const data = times.map(time => time.getData());
  sessionStorage.setItem("times", JSON.stringify(data));
}

export function parse(tdElement?: Element | null): TimeRangeItem[] {
  if (!tdElement) return [];

  const parsed: TimeRangeItem[] = [];

  const text = (tdElement as HTMLElement).innerText?.trim() || "";
  const wtps = WeekdayTimePlaceParser.parseAll(text);

  wtps.forEach(wtp => {
    const item = new TimeRangeItem(wtp);
    item.setId(times.length + 1);
    const time = add(item);
    parsed.push(time);
  });

  return parsed;
}

function find(time: TimeRangeItem) {
  return times.find(item => item.getHash() === time.getHash());
}

export function add(time: TimeRangeItem): TimeRangeItem {
  if (times.length === 0) load();
  const existing = find(time);
  if (existing && existing.basic.id) return existing;

  times.push(time);
  save();
  return time;
}

export function toInputData() {
  if (times.length === 0) load();
  return times.map(time => time.toInputData());
}
