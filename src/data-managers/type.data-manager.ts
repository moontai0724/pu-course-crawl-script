import { Tag } from "_types/schema";

export type RawTag = Omit<Tag, "uuid"> & {
  courses: number[];
};

const tags: RawTag[] = [];

export default {
  getAll,
  getByElement,
  getByName,
};

export function getAll(): typeof tags {
  if (tags.length) return tags;

  const elements = document.querySelectorAll("table tr td:nth-child(3)");

  let counter = 1;

  Array.from(elements).forEach((element, courseId) => {
    const name = element.textContent?.trim() ?? "";

    const existingTag = getByName(name);
    if (existingTag) {
      existingTag.courses.push(courseId);
      return;
    }

    tags.push({
      id: counter++,
      name,
      description: null,
      courses: [courseId],
    });
  });

  return tags;
}

export function getByElement(element: Element) {
  const name = element.textContent?.trim() ?? "";
  return getByName(name);
}

export function getByName(name: string) {
  return tags.find(tag => tag.name === name);
}
