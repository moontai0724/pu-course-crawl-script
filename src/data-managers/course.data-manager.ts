import CourseItem, { TCourse } from "../items/course.item";

const courses: CourseItem[] = [];

function load() {
  const data: TCourse[] = GM_getValue("courses", []);

  data.forEach(item => {
    courses.push(new CourseItem(item));
  });
}

function save() {
  const data = courses.map(course => course.getData());
  GM_setValue("courses", data);
}

export function findExisting(course: CourseItem) {
  return courses.find(item => item.getHash() === course.getHash());
}

export function add(course: CourseItem) {
  if (courses.length === 0) load();
  const existing = findExisting(course);
  if (existing) {
    const persons = course.getPersonElements();
    if (!persons.length) return;
    persons.forEach(person => existing.addPersonByElement(person));
    save();
    return;
  }

  courses.push(course);
  save();
}

export function toInputData() {
  if (courses.length === 0) load();
  return courses.map(course => course.toInputData());
}
