import TypeItem, { TType } from "../items/type.item";

const tags: TypeItem[] = [];

(function () {
  const data = sessionStorage.getItem("types");
  if (!data) return;

  const parsed = JSON.parse(data) as TType[];
  parsed.forEach(item => {
    tags.push(new TypeItem(item));
  });
})();

function save() {
  const data = tags.map(tag => tag.getData());
  sessionStorage.setItem("types", JSON.stringify(data));
}

export function find(tag: TypeItem): TypeItem | undefined {
  const hash = tag.getHash();
  const existingTag = tags.find(item => item.getHash() === hash);

  return existingTag;
}

export function add(tag: TypeItem) {
  const existing = find(tag);
  if (existing) {
    tag.setUUID(existing.basic.uuid);
    return;
  }

  tags.push(tag);
  save();
}

export function getByUUID(uuid: string) {
  return tags.find(tag => tag.basic.uuid === uuid);
}

export function toInputData() {
  return tags.map(item => item.toInputData());
}
