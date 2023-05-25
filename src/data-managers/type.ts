import { Tag } from "_types/schema";

export type RawTag = Omit<Tag, "id" | "uuid"> & {
  courses: number[];
};

const tags: RawTag[] = [];

export default {
  getAll,
  getByName,
};

export function getAll(): typeof tags {
  if (tags.length) return tags;

  const elements = document.querySelectorAll("table tr td:nth-child(3)");
  Array.from(elements).forEach((element, id) => {
    const name = element.textContent?.trim() ?? "";

    const existingTag = getByName(name);
    if (existingTag) {
      existingTag.courses.push(id);
      return;
    }

    tags.push({
      name,
      description: null,
      courses: [id],
    });
  });

  return tags;
}

export function getByName(name: string) {
  return getAll().find(tag => tag.name === name);
}
