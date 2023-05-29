import OrganizationItem, { TOrganization } from "../items/organization.item";

const organizations: OrganizationItem[] = [];

function load() {
  const data: TOrganization[] = GM_getValue("organizations", []);

  data.forEach(item => {
    organizations.push(new OrganizationItem(item));
  });
}

function save() {
  const data = organizations.map(organization => organization.getData());
  GM_setValue("organizations", data);
}

export function find(
  organization: OrganizationItem,
): OrganizationItem | undefined {
  if (organizations.length === 0) load();
  const hash = organization.getHash();
  const existingOrganization = organizations.find(
    item => item.getHash() === hash,
  );

  return existingOrganization;
}

export function add(organization: OrganizationItem) {
  if (organizations.length === 0) load();
  const existing = find(organization);
  if (existing) {
    organization.setUUID(existing.basic.uuid);
    return;
  }

  organizations.push(organization);
  save();
}

export function getByUUID(uuid: string) {
  if (organizations.length === 0) load();
  return organizations.find(organization => organization.basic.uuid === uuid);
}

export function toInputData() {
  if (organizations.length === 0) load();
  return organizations.map(item => item.toInputData());
}
