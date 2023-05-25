import { Place } from "../_types/schema";
import WeekdayTimePlaceParser from "../utils/weekday-time-place-parser";

export type RawPlace = Omit<Place, "id" | "uuid"> & {
  courses: number[];
};

const places: RawPlace[] = [];

export default {
  getAll,
  getByName,
};

export function getAll(): typeof places {
  if (places.length) return places;

  const elements = document.querySelectorAll("table tr td:nth-child(8)");
  const allPlaces = Array.from(elements).map(element => {
    const text = element.textContent?.trim() ?? "";
    return WeekdayTimePlaceParser.getPlaces(text);
  });

  allPlaces.forEach((placeOfDay, id) => {
    placeOfDay.forEach(placeOfClass => {
      const existingPlace = getByName(placeOfClass);
      if (existingPlace) {
        existingPlace.courses.push(id);
        return;
      }

      places.push({
        name: placeOfClass,
        description: null,
        parentId: null,
        courses: [id],
      });
    });
  });

  return places;
}

export function getByName(name: string) {
  return getAll().find(place => place.name === name);
}
