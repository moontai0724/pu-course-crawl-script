import { Cheerio, Element } from "cheerio";
import PlaceItem, { TPlace } from "../items/place.item";
import weekdayTimePlaceParser from "../utils/weekday-time-place-parser";
import * as FileSystem from "fs";
import * as Path from "path";

const places: PlaceItem[] = [];

export function loadFile() {
  if (places.length) return;

  const path = Path.resolve(__dirname, "../cache/places.json");
  if (!FileSystem.existsSync(path)) return;
  const data = FileSystem.readFileSync(path, "utf-8");

  const parsed = JSON.parse(data) as TPlace[];
  parsed.forEach(item => {
    add(new PlaceItem(item), true);
  });
}

export function saveFile() {
  const data = places.map(place => place.getData());
  const path = Path.resolve(__dirname, "../cache/places.json");
  FileSystem.writeFileSync(path, JSON.stringify(data));
}

export function parse(tdElement?: Cheerio<Element> | null): PlaceItem[] {
  if (!tdElement) return [];

  const places: PlaceItem[] = [];

  const text = tdElement.html() || "";
  const placeTexts = weekdayTimePlaceParser.getPlaces(text);

  placeTexts.forEach(placeText => {
    const place = add(new PlaceItem(placeText));
    places.push(place);
  });

  return places;
}

function find(place: PlaceItem) {
  return places.find(item => item.getHash() === place.getHash());
}

export function add(place: PlaceItem, bypass = false): PlaceItem {
  if (!bypass && places.length === 0) loadFile();
  const existing = find(place);
  if (existing) return existing;

  places.push(place);
  if (!bypass) saveFile();
  return place;
}

export function getByUUID(uuid: string) {
  return places.find(place => place.basic.uuid === uuid);
}

export function toInputData() {
  return places.map(place => place.toInputData());
}
