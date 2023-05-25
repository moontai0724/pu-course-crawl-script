import { Organization } from "_types/schema";

export type RawOrganization = Omit<Organization, "id" | "uuid"> & {
  courses: number[];
};

const organizations: RawOrganization[] = [];

export default {
  getAll,
  getByName,
};

export function getAll(): typeof organizations {
  if (organizations.length) return organizations;

  const elements = document.querySelectorAll("table tr td:nth-child(2)");
  Array.from(elements).forEach((element, id) => {
    const name = element.textContent?.trim() ?? "";

    const existingOrganization = getByName(name);
    if (existingOrganization) {
      existingOrganization.courses.push(id);
      return;
    }

    organizations.push({
      name,
      description: "",
      courses: [id],
      parentId: null,
    });
  });

  return organizations;
}

export function getByName(name: string) {
  return getAll().find(organization => organization.name === name);
}
