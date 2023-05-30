import PlaceItem, { TPlace } from "../items/place.item";
import weekdayTimePlaceParser from "../utils/weekday-time-place-parser";

const places: PlaceItem[] = [];

function load() {
  if (places.length) return;

  const data = sessionStorage.getItem("places");
  if (!data) return;

  const parsed = JSON.parse(data) as TPlace[];
  parsed.forEach(item => {
    add(new PlaceItem(item), true);
  });
}

function save() {
  const data = places.map(place => place.getData());
  sessionStorage.removeItem("places");
  sessionStorage.setItem("places", JSON.stringify(data));
}

export function parse(tdElement?: Element | null): PlaceItem[] {
  if (!tdElement) return [];

  const places: PlaceItem[] = [];

  const text = (tdElement as HTMLElement).innerText || "";
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
  if (!bypass && places.length === 0) load();
  const existing = find(place);
  if (existing) return existing;

  places.push(place);
  save();
  return place;
}

export function getByUUID(uuid: string) {
  return places.find(place => place.basic.uuid === uuid);
}

export function toInputData() {
  return places.map(place => place.toInputData());
}
