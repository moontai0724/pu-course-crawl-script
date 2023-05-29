import PlaceItem, { TPlace } from "../items/place.item";
import weekdayTimePlaceParser from "../utils/weekday-time-place-parser";

const places: PlaceItem[] = [];

(function () {
  const data: TPlace[] = GM_getValue("places", []);

  data.forEach(item => {
    add(new PlaceItem(item));
  });
})();

function save() {
  const data = places.map(place => place.getData());
  GM_setValue("places", data);
}

export function parse(tdElement?: Element | null): PlaceItem[] {
  if (!tdElement) return [];

  const places: PlaceItem[] = [];

  const text = (tdElement as HTMLElement).innerText || "";
  const placeTexts = weekdayTimePlaceParser.getPlaces(text);

  placeTexts.forEach(placeText => {
    const place = new PlaceItem(placeText, tdElement);
    add(place);
    places.push(place);
  });

  return places;
}

export function findExisting(place: PlaceItem) {
  return places.find(item => item.getHash() === place.getHash());
}

export function add(place: PlaceItem) {
  const existing = findExisting(place);
  if (existing) {
    place.setUUID(existing.basic.uuid);
    return;
  }

  places.push(place);
  save();
}

export function getByUUID(uuid: string) {
  return places.find(place => place.basic.uuid === uuid);
}

export function toInputData() {
  return places.map(place => place.toInputData());
}
