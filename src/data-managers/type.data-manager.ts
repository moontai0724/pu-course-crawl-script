import TypeItem, { TType } from "../items/type.item";

const types: TypeItem[] = [];

(function () {
  const data = sessionStorage.getItem("types");
  if (!data) return;

  const parsed = JSON.parse(data) as TType[];
  parsed.forEach(item => {
    types.push(new TypeItem(item));
  });
})();

function save() {
  const data = types.map(tag => tag.getData());
  sessionStorage.setItem("types", JSON.stringify(data));
}

export function find(tag: TypeItem): TypeItem | undefined {
  const hash = tag.getHash();
  const existingTag = types.find(item => item.getHash() === hash);

  return existingTag;
}

export function add(tag: TypeItem) {
  const existing = find(tag);
  if (existing) {
    tag.setUUID(existing.basic.uuid);
    return;
  }

  types.push(tag);
  save();
}

export function getByUUID(uuid: string) {
  return types.find(tag => tag.basic.uuid === uuid);
}

export function toInputData() {
  return types.map(item => item.toInputData());
}
