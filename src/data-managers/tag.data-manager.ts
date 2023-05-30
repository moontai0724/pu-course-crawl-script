import TagItem, { TTag } from "../items/tag.item";

const tags: TagItem[] = [];

function load() {
  if (tags.length) return;

  const data = sessionStorage.getItem("tags");
  if (!data) return;

  const parsed = JSON.parse(data) as TTag[];
  parsed.forEach(item => {
    add(new TagItem(item), true);
  });
}

function save() {
  const data = tags.map(tag => tag.getData());
  sessionStorage.setItem("tags", JSON.stringify(data));
}

function find(tag: TagItem): TagItem | undefined {
  return tags.find(item => item.getHash() === tag.getHash());
}

export function add(tag: TagItem, bypass = false): TagItem {
  if (!bypass && tags.length === 0) load();
  const existing = find(tag);
  if (existing) {
    tag.setUUID(existing.basic.uuid);
    return existing;
  }

  tags.push(tag);
  if (!bypass) save();
  return tag;
}

export function getByUUID(uuid: string) {
  if (tags.length === 0) load();
  return tags.find(tag => tag.basic.uuid === uuid);
}

export function toInputData() {
  if (tags.length === 0) load();
  return tags.map(item => item.toInputData());
}
