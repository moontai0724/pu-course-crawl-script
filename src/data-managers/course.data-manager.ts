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

export function getAll(): typeof courses {
  if (courses.length) return courses;

  const elements = document.querySelectorAll("table tr");
  Array.from(elements)
    .slice(1)
    .forEach(element => {
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
      const { chinese: chineseName, english: englishName } =
        getName(titleElement);
      const description = [englishName, noteElement.textContent?.trim()]
        .filter(Boolean)
        .join("\n");

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
        name: chineseName,
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

function getName(titleElement: HTMLElement): {
  chinese: string;
  english: string;
} {
  const link = titleElement.querySelector("a");
  if (!link) {
    return {
      chinese: titleElement.textContent?.trim() ?? "",
      english: "",
    };
  }

  const chinese = link.textContent?.trim() ?? "";
  const english =
    Array.from(titleElement.childNodes).pop()?.textContent?.trim() ?? "";

  return { chinese, english };
}

export function getInputs() {
  return courses.map(course => {
    const { relations, organizationId, dateRangeId, ...courseInput } = course;

    const inputWithRelations = {
      ...courseInput,
      organization: {
        connect: { id: organizationId },
      },
      dateRange: {
        connect: { id: dateRangeId },
      },
      hosts: {
        connect: relations.personIds.map(id => ({ id })),
      },
      places: {
        connect: relations.placeIds.map(id => ({ id })),
      },
      tags: {
        connect: relations.tagIds.map(id => ({ id })),
      },
      timeRanges: {
        connect: relations.timeRangeIds.map(id => ({ id })),
      },
    };

    return inputWithRelations;
  });
}
