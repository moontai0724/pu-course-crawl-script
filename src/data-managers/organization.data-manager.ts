import OrganizationItem, { TOrganization } from "../items/organization.item";

const organizations: OrganizationItem[] = [];

(function () {
  const data = sessionStorage.getItem("organizations");
  if (!data) return;

  const parsed = JSON.parse(data) as TOrganization[];
  parsed.forEach(item => {
    organizations.push(new OrganizationItem(item));
  });
})();

function save() {
  const data = organizations.map(organization => organization.getData());
  sessionStorage.setItem("organizations", JSON.stringify(data));
}

export function find(
  organization: OrganizationItem,
): OrganizationItem | undefined {
  const hash = organization.getHash();
  const existingOrganization = organizations.find(
    item => item.getHash() === hash,
  );

  return existingOrganization;
}

export function add(organization: OrganizationItem) {
  const existing = find(organization);
  if (existing) {
    organization.setUUID(existing.basic.uuid);
    return;
  }

  organizations.push(organization);
  save();
}

export function getByUUID(uuid: string) {
  return organizations.find(organization => organization.basic.uuid === uuid);
}

export function toInputData() {
  return organizations.map(item => item.toInputData());
}
