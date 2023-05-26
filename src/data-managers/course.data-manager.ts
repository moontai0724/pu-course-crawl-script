import CourseItem from "../items/course.item";

const courses: CourseItem[] = [];

export function findExisting(course: CourseItem) {
  return courses.find(item => item.getHash() === course.getHash());
}

export function add(course: CourseItem) {
  const existing = findExisting(course);
  if (existing) {
    console.error("Course already exists", course, existing);

    throw new Error("Course already exists");
  }

  courses.push(course);
}

export function toInputData() {
  return courses.map(course => course.toInputData());
}
