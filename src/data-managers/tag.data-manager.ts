import TagItem, { TTag } from "../items/tag.item";

const tags: TagItem[] = [];

function load() {
  if (tags.length) return;

  const data = sessionStorage.getItem("tags");
  if (!data) return;

  const parsed = JSON.parse(data) as TTag[];
  parsed.forEach(item => {
    tags.push(new TagItem(item));
  });
}

function save() {
  const data = tags.map(tag => tag.getData());
  sessionStorage.setItem("tags", JSON.stringify(data));
}

export function find(tag: TagItem): TagItem | undefined {
  if (tags.length === 0) load();
  const hash = tag.getHash();
  const existingTag = tags.find(item => item.getHash() === hash);

  return existingTag;
}

export function add(tag: TagItem) {
  if (tags.length === 0) load();
  const existing = find(tag);
  if (existing) {
    tag.setUUID(existing.basic.uuid);
    return;
  }

  tags.push(tag);
  save();
}

export function getByUUID(uuid: string) {
  if (tags.length === 0) load();
  return tags.find(tag => tag.basic.uuid === uuid);
}

export function toInputData() {
  if (tags.length === 0) load();
  return tags.map(item => item.toInputData());
}
