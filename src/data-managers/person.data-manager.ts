import PersonItem, { TPerson } from "../items/person.item";

const people: PersonItem[] = [];

function load() {
  const data: TPerson[] = GM_getValue("people", []);

  data.forEach(item => {
    people.push(new PersonItem(item));
  });
}

function save() {
  const data = people.map(person => person.getData());
  GM_setValue("people", data);
}

export function findExisting(person: PersonItem) {
  if (people.length === 0) load();
  return people.find(item => item.getHash() === person.getHash());
}

export function add(person: PersonItem) {
  if (people.length === 0) load();
  const existing = findExisting(person);
  if (existing) return;

  people.push(person);
  save();
}

export function getByUUID(uuid: string) {
  if (people.length === 0) load();
  return people.find(person => person.basic.uuid === uuid);
}

export function toInputData() {
  if (people.length === 0) load();
  return people.map(person => person.toInputData());
}
