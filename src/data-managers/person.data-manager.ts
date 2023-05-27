import PersonItem, { TPerson } from "../items/person.item";

const people: PersonItem[] = [];

(function () {
  const data = sessionStorage.getItem("people");
  if (!data) return;

  const parsed = JSON.parse(data) as TPerson[];
  parsed.forEach(item => {
    people.push(new PersonItem(item));
  });
})();

function save() {
  const data = people.map(person => person.getData());
  sessionStorage.setItem("people", JSON.stringify(data));
}

export function findExisting(person: PersonItem) {
  return people.find(item => item.getHash() === person.getHash());
}

export function add(person: PersonItem) {
  const existing = findExisting(person);
  if (existing) return;

  people.push(person);
  save();
}

export function getByUUID(uuid: string) {
  return people.find(person => person.basic.uuid === uuid);
}

export function toInputData() {
  return people.map(person => person.toInputData());
}
