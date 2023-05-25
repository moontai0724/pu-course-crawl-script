import { Person } from "_types/schema";

export type RawPerson = Omit<Person, "uuid"> & {
  courses: number[];
};

const people: RawPerson[] = [];

export default {
  getAll,
  getByElement,
  getByName,
  getByDescriptionAsId,
  getIdFromElement,
};

export function getAll(): typeof people {
  if (people.length) return people;

  const elements = document.querySelectorAll("table tr td:nth-child(7)");

  let counter = 1;

  Array.from(elements).forEach((element, courseId) => {
    const linkElement = element.querySelector("a");
    const link = linkElement?.href.replace("../", "https://alcat.pu.edu.tw/");
    const name = element.textContent?.trim() ?? "";
    const description = link?.split("?").pop();

    const existingTeacher = getByDescriptionAsId(description ?? "");
    if (existingTeacher && existingTeacher.name === name) {
      existingTeacher.courses.push(courseId);
      return;
    }

    people.push({
      id: counter++,
      name,
      description: description ?? null,
      link: link ?? null,
      courses: [courseId],
    });
  });

  return people;
}

export function getByElement(element: HTMLElement | null) {
  if (!element) return null;
  const id = getIdFromElement(element as HTMLLinkElement);
  return getByDescriptionAsId(id);
}

export function getByName(name: string) {
  return getAll().find(teacher => teacher.name === name);
}

export function getByDescriptionAsId(descriptionAsId: string) {
  return getAll().find(teacher => teacher.description === descriptionAsId);
}

export function getIdFromElement(element: HTMLLinkElement): string {
  return element?.href.replace("../", "https://alcat.pu.edu.tw/");
}