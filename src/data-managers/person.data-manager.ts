import PersonItem, { TPerson } from "../items/person.item";
import * as FileSystem from "fs";
import * as Path from "path";

const people: PersonItem[] = [];

function load() {
  if (people.length) return;

  const path = Path.resolve(__dirname, "./cache/people.json");
  const data = FileSystem.readFileSync(path, "utf-8");
  if (!data) return;

  const parsed = JSON.parse(data) as TPerson[];
  parsed.forEach(item => {
    add(new PersonItem(item), true);
  });
}

function save() {
  const data = people.map(person => person.getData());
  const path = Path.resolve(__dirname, "./cache/people.json");
  FileSystem.writeFileSync(path, JSON.stringify(data));
}

function find(person: PersonItem) {
  return people.find(item => item.getHash() === person.getHash());
}

export function add(person: PersonItem, bypass = false): PersonItem {
  if (!bypass && people.length === 0) load();
  const existing = find(person);
  if (existing) return existing;

  people.push(person);
  if (!bypass) save();
  return person;
}

export function getByUUID(uuid: string) {
  if (people.length === 0) load();
  return people.find(person => person.basic.uuid === uuid);
}

export function toInputData() {
  if (people.length === 0) load();
  return people.map(person => person.toInputData());
}
