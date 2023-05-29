import TimeRangeItem, { TTimeRange } from "../items/time-range.item";
import WeekdayTimePlaceParser from "../utils/weekday-time-place-parser";

const times: TimeRangeItem[] = [];

function load() {
  const data: TTimeRange[] = GM_getValue("times", []);

  data.forEach((item, index) => {
    const id = item.id ?? index;
    times.push(new TimeRangeItem({ id, ...item }));
  });
}

function save() {
  const data = times.map(time => time.getData());
  GM_setValue("times", data);
}

export function parse(tdElement?: Element | null): TimeRangeItem[] {
  if (!tdElement) return [];

  const parsed: TimeRangeItem[] = [];

  const text = (tdElement as HTMLElement).innerText?.trim() || "";
  const wtps = WeekdayTimePlaceParser.parseAll(text);

  wtps.forEach(wtp => {
    const item = new TimeRangeItem(wtp, tdElement);
    item.setId(times.length + 1);
    add(item);
    parsed.push(item);
  });

  return parsed;
}

export function findExisting(time: TimeRangeItem) {
  if (times.length === 0) load();
  return times.find(item => item.getHash() === time.getHash());
}

export function add(time: TimeRangeItem) {
  if (times.length === 0) load();
  const existing = findExisting(time);
  if (existing && existing.basic.id) {
    time.setId(existing.basic.id);
    return;
  }

  times.push(time);
  save();
}

export function toInputData() {
  if (times.length === 0) load();
  return times.map(time => time.toInputData());
}
