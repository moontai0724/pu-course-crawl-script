import OrganizationItem, { TOrganization } from "../items/organization.item";
import * as FileSystem from "fs";
import * as Path from "path";

const organizations: OrganizationItem[] = [];

export function loadFile() {
  if (organizations.length) return;

  const path = Path.resolve(__dirname, "../cache/organizations.json");
  if (!FileSystem.existsSync(path)) return;
  const data = FileSystem.readFileSync(path, "utf-8");

  const parsed = JSON.parse(data) as TOrganization[];
  parsed.forEach(item => {
    add(new OrganizationItem(item), true);
  });
}

export function saveFile() {
  const data = organizations.map(organization => organization.getData());
  const path = Path.resolve(__dirname, "../cache/organizations.json");
  FileSystem.writeFileSync(path, JSON.stringify(data));
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
  if (!bypass && organizations.length === 0) loadFile();
  const existing = find(organization);
  if (existing) {
    organization.setUUID(existing.basic.uuid);
    return existing;
  }

  organizations.push(organization);
  if (!bypass) saveFile();
  return organization;
}

export function getByUUID(uuid: string) {
  if (organizations.length === 0) loadFile();
  return organizations.find(organization => organization.basic.uuid === uuid);
}

export function toInputData() {
  if (organizations.length === 0) loadFile();
  return organizations.map(item => item.toInputData());
}
