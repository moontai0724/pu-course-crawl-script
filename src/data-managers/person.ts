import { Person } from "_types/schema";

export type RawPerson = Omit<Person, "id" | "uuid"> & {
  courses: number[];
};

const people: RawPerson[] = [];

export default {
  getAll,
  getByName,
  getByDescriptionAsId,
};

export function getAll(): typeof people {
  if (people.length) return people;

  const elements = document.querySelectorAll("table tr td:nth-child(7)");
  Array.from(elements).forEach((element, id) => {
    const linkElement = element.querySelector("a");
    const link = linkElement?.href.replace("../", "https://alcat.pu.edu.tw/");
    const name = element.textContent?.trim() ?? "";
    const description = link?.split("?").pop();

    const existingTeacher = getByDescriptionAsId(description ?? "");
    if (existingTeacher && existingTeacher.name === name) {
      existingTeacher.courses.push(id);
      return;
    }

    people.push({
      name,
      description: description ?? null,
      link: link ?? null,
      courses: [id],
    });
  });

  return people;
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
