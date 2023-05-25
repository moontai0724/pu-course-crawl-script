import { Organization } from "_types/schema";

export type RawOrganization = Omit<Organization, "uuid"> & {
  courses: number[];
};

const organizations: RawOrganization[] = [];

export default {
  getAll,
  getByName,
  getByElement,
};

export function getAll(): typeof organizations {
  if (organizations.length) return organizations;

  const elements = document.querySelectorAll("table tr td:nth-child(2)");

  let counter = 1;

  Array.from(elements).forEach((element, courseId) => {
    const name = element.textContent?.trim() ?? "";

    const existingOrganization = getByName(name);
    if (existingOrganization) {
      existingOrganization.courses.push(courseId);
      return;
    }

    organizations.push({
      id: counter++,
      name,
      description: "",
      courses: [courseId],
      parentId: null,
    });
  });

  return organizations;
}

export function getByElement(element: Element) {
  const name = element.textContent?.trim() ?? "";
  return getByName(name);
}

export function getByName(name: string) {
  return getAll().find(organization => organization.name === name);
}
