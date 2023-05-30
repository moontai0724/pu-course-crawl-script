import OrganizationItem, { TOrganization } from "../items/organization.item";

const organizations: OrganizationItem[] = [];

function load() {
  if (organizations.length) return;

  const data = sessionStorage.getItem("organizations");
  if (!data) return;

  const parsed = JSON.parse(data) as TOrganization[];
  parsed.forEach(item => {
    add(new OrganizationItem(item), true);
  });
}

function save() {
  const data = organizations.map(organization => organization.getData());
  sessionStorage.removeItem("organizations");
  sessionStorage.setItem("organizations", JSON.stringify(data));
}

function find(organization: OrganizationItem): OrganizationItem | undefined {
  const hash = organization.getHash();
  const existingOrganization = organizations.find(
    item => item.getHash() === hash,
  );

  return existingOrganization;
}

export function add(
  organization: OrganizationItem,
  bypass = false,
): OrganizationItem {
  if (!bypass && organizations.length === 0) load();
  const existing = find(organization);
  if (existing) {
    organization.setUUID(existing.basic.uuid);
    return existing;
  }

  organizations.push(organization);
  save();
  return organization;
}

export function getByUUID(uuid: string) {
  if (organizations.length === 0) load();
  return organizations.find(organization => organization.basic.uuid === uuid);
}

export function toInputData() {
  if (organizations.length === 0) load();
  return organizations.map(item => item.toInputData());
}
