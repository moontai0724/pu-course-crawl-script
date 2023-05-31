import { Cheerio, Element } from "cheerio";
import TimeRangeItem, { TTimeRange } from "../items/time-range.item";
import WeekdayTimePlaceParser from "../utils/weekday-time-place-parser";
import * as FileSystem from "fs";
import * as Path from "path";

const times: TimeRangeItem[] = [];

function loadCache() {
  if (times.length) return;

  const path = Path.resolve(__dirname, "./cache/times.json");
  const data = FileSystem.readFileSync(path, "utf-8");
  if (!data) return;

  const parsed = JSON.parse(data) as TTimeRange[];
  parsed.forEach((item, index) => {
    const id = item.id ?? index;
    times.push(new TimeRangeItem({ id, ...item }));
  });
}

function saveCache() {
  const data = times.map(time => time.getData());
  const path = Path.resolve(__dirname, "./cache/times.json");
  FileSystem.writeFileSync(path, JSON.stringify(data));
}

export function parse(tdElement?: Cheerio<Element> | null): TimeRangeItem[] {
  if (!tdElement) return [];

  const parsed: TimeRangeItem[] = [];

  const text = tdElement.text().trim() || "";
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
  if (times.length === 0) loadCache();
  const existing = find(time);
  if (existing && existing.basic.id) return existing;

  times.push(time);
  saveCache();
  return time;
}

export function toInputData() {
  if (times.length === 0) loadCache();
  return times.map(time => time.toInputData());
}
