import CourseItem, { TCourse } from "../items/course.item";

const courses: CourseItem[] = [];

function load() {
  if (courses.length) return;

  const data = sessionStorage.getItem("courses");
  if (!data) return;

  const parsed = JSON.parse(data) as TCourse[];
  parsed.forEach(item => {
    add(new CourseItem(item), true);
  });
}

function save() {
  const data = courses.map(course => course.getData());
  sessionStorage.setItem("courses", JSON.stringify(data));
}

function find(course: CourseItem) {
  return courses.find(item => item.getHash() === course.getHash());
}

export function add(course: CourseItem, bypass = false): CourseItem {
  if (!bypass && courses.length === 0) load();
  const existing = find(course);
  if (existing) {
    const persons = course.internalValues.personIds ?? [];
    persons.forEach(person => existing.addPerson(person));
    if (!bypass) save();
    return existing;
  }

  courses.push(course);
  save();
  return course;
}

export function toInputData() {
  if (courses.length === 0) load();
  return courses.map(course => course.toInputData());
}
