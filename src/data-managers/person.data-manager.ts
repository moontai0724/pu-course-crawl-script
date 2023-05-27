import { Person } from "_types/schema";
import PersonParser from "../utils/person-parser";

export type RawPerson = Omit<Person, "uuid"> & {
  courses: number[];
};

const people: RawPerson[] = [];

export function getAll(): typeof people {
  if (people.length) return people;

  const elements = document.querySelectorAll("table tr td:nth-child(7)");

  let counter = 1;

  Array.from(elements).forEach((element, courseId) => {
    const parsedPeople = PersonParser.parseAll(element);

    parsedPeople.forEach(person => {
      const { link, name, description } = person.getData();

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
  });

  return people;
}

export function getByElement(element: HTMLElement | null) {
  if (!element) return null;
  const id = getIdFromElement(element as HTMLLinkElement);
  return getByDescriptionAsId(id);
}

export function getByName(name: string) {
  return people.find(teacher => teacher.name === name);
}

export function getByDescriptionAsId(descriptionAsId: string) {
  return people.find(teacher => teacher.description === descriptionAsId);
}

export function getIdFromElement(element: HTMLLinkElement): string {
  return element?.href.split("?").pop() || '"';
}

export function getInputs() {
  return people.map(({ courses, ...teacher }) => teacher);
}
