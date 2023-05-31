import CourseItem, { TCourse } from "../items/course.item";
import * as FileSystem from "fs";
import * as Path from "path";

const courses: CourseItem[] = [];

export function loadFile() {
  if (courses.length) return;

  const path = Path.resolve(__dirname, "../cache/courses.json");
  if (!FileSystem.existsSync(path)) return;
  const data = FileSystem.readFileSync(path, "utf-8");

  const parsed = JSON.parse(data) as TCourse[];
  parsed.forEach(item => {
    add(new CourseItem(item), true);
  });
}

export function saveFile() {
  const data = courses.map(course => course.getData());
  const path = Path.resolve(__dirname, "../cache/courses.json");
  FileSystem.writeFileSync(path, JSON.stringify(data));
}

function find(course: CourseItem) {
  return courses.find(item => item.getHash() === course.getHash());
}

export function add(course: CourseItem, bypass = false): CourseItem {
  if (!bypass && courses.length === 0) loadFile();
  const existing = find(course);
  if (existing) {
    const persons = course.internalValues.personIds ?? [];
    persons.forEach(person => existing.addPerson(person));
    if (!bypass) saveFile();
    return existing;
  }

  courses.push(course);
  return course;
}

export function toInputData() {
  if (courses.length === 0) loadFile();
  return courses.map(course => course.toInputData());
}
