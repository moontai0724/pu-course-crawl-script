import { Place } from "../_types/schema";
import weekdayTimePlaceParser from "../utils/weekday-time-place-parser";
import WeekdayTimePlaceParser from "../utils/weekday-time-place-parser";

export type RawPlace = Omit<Place, "uuid"> & {
  courses: number[];
};

const places: RawPlace[] = [];

export default {
  getAll,
  getByElement,
  getByName,
};

export function getAll(): typeof places {
  if (places.length) return places;

  const elements = document.querySelectorAll("table tr td:nth-child(8)");
  const allPlaces = Array.from(elements).map(element => {
    const text = element.textContent?.trim() ?? "";
    return WeekdayTimePlaceParser.getPlaces(text);
  });

  let counter = 1;

  allPlaces.forEach((placeOfDay, courseId) => {
    placeOfDay.forEach(placeOfClass => {
      const existingPlace = getByName(placeOfClass);
      if (existingPlace) {
        existingPlace.courses.push(courseId);
        return;
      }

      places.push({
        id: counter++,
        name: placeOfClass,
        description: null,
        parentId: null,
        courses: [courseId],
      });
    });
  });

  return places;
}

export function getByElement(element: Element) {
  const text = element.textContent?.trim() ?? "";
  const wtp = weekdayTimePlaceParser.parseAll(text);
  const place = wtp.map(wtp => wtp.place);
  return place.map(place => getByName(place));
}

export function getByName(name: string) {
  return places.find(place => place.name === name);
}
