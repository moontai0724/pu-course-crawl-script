import { Organization, Type, Time, Place, Person } from ".";
import { Course } from "../_types/schema";

type RawCourse = Omit<Course, "id" | "uuid"> & {
  relations: {
    timeRangeIds: number[];
    placeIds: number[];
    tagIds: number[];
    personIds: number[];
  };
};

const courses: RawCourse[] = [];

export default {
  getAll,
};

export function getAll(): typeof courses {
  if (courses.length) return courses;

  const elements = document.querySelectorAll("table tr");
  Array.from(elements)
    .slice(1)
    .forEach((element, id) => {
      const [
        codeElement,
        organizationElement,
        typeElement,
        titleElement,
        semesterElement,
        creditElement,
        personElement,
        timeAndPlaceElement,
        noteElement,
      ] = Array.from(element.querySelectorAll("td"));

      const code = codeElement.textContent?.trim() ?? "";
      const [name, englishName] =
        titleElement.textContent?.trim().split("\n") ?? "";
      const description =
        englishName + "\n" + noteElement.textContent?.trim() ?? "";
      const linkElement = titleElement.querySelector("a");
      const link = linkElement?.href.replace("../", "https://alcat.pu.edu.tw/");
      const credit = parseInt(creditElement.textContent?.trim() ?? "0", 10);

      const organization = Organization.getByElement(organizationElement);
      const type = Type.getByElement(typeElement);
      const timeRanges = Time.getByElement(timeAndPlaceElement);
      const places = Place.getByElement(timeAndPlaceElement);
      const host = Person.getByElement(personElement.querySelector("a"));

      const course: RawCourse = {
        code,
        name,
        description,
        link: link ?? null,
        credit,
        organizationId: organization?.id ?? null,
        dateRangeId: 1,
        relations: {
          timeRangeIds: [],
          placeIds: [],
          tagIds: [],
          personIds: [],
        },
      };

      if (type) course.relations.tagIds.push(type.id);
      if (host) course.relations.personIds.push(host.id);
      if (timeRanges.length) {
        const timeRangeIds = timeRanges
          .map(time => time?.id)
          .filter(Boolean) as number[];
        course.relations.timeRangeIds.push(...timeRangeIds);
      }
      if (places.length) {
        const placeIds = places
          .map(place => place?.id)
          .filter(Boolean) as number[];
        course.relations.placeIds.push(...placeIds);
      }

      courses.push(course);
    });

  return courses;
}
