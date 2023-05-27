import CourseItem, { TCourse } from "../items/course.item";

const courses: CourseItem[] = [];

(function () {
  const data = sessionStorage.getItem("courses");
  if (!data) return;

  const parsed = JSON.parse(data) as TCourse[];
  parsed.forEach(item => {
    courses.push(new CourseItem(item));
  });
})();

function save() {
  const data = courses.map(course => course.getData());
  sessionStorage.setItem("courses", JSON.stringify(data));
}

export function findExisting(course: CourseItem) {
  return courses.find(item => item.getHash() === course.getHash());
}

export function add(course: CourseItem) {
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
  return courses.map(course => course.toInputData());
}
