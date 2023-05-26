import CourseItem from "./items/course.item";
import {
  CourseDataManager,
  DateRangeDataManager,
  OrganizationDataManager,
  PersonDataManager,
  PlaceDataManager,
  TimeDataManager,
  TypeDataManager,
} from "./data-managers";

const courseElements = document.querySelectorAll("table tr");
Array.from(courseElements)
  .slice(1)
  .forEach(courseElement => {
    const course = new CourseItem(courseElement);
    CourseDataManager.add(course);
  });

const rDateRange = DateRangeDataManager.getAll();
const rOrganization = OrganizationDataManager.getAll();
const rPerson = PersonDataManager.getAll();
const rPlace = PlaceDataManager.getAll();
const rTime = TimeDataManager.getAll();
const rType = TypeDataManager.getAll();

GM_registerMenuCommand(
  "Downlaod All",
  function () {
    const oDateRange = DateRangeDataManager.getInputs();
    const oOrganization = OrganizationDataManager.getInputs();
    const oPerson = PersonDataManager.getInputs();
    const oPlace = PlaceDataManager.getInputs();
    const oTime = TimeDataManager.getInputs();
    const oType = TypeDataManager.getInputs();
    const oCourse = CourseDataManager.toInputData();

    console.log("DateRange data", oDateRange);
    console.log("Organization data", oOrganization);
    console.log("Person data", oPerson);
    console.log("Place data", oPlace);
    console.log("Time data", oTime);
    console.log("Type data", oType);
    console.log("Course data", oCourse);

    download("courses.json", JSON.stringify(oCourse));
    download("dateRanges.json", JSON.stringify(oDateRange));
    download("organizations.json", JSON.stringify(oOrganization));
    download("persons.json", JSON.stringify(oPerson));
    download("places.json", JSON.stringify(oPlace));
    download("timeRanges.json", JSON.stringify(oTime));
    download("types.json", JSON.stringify(oType));
  },
  "a",
);

function download(filename: string, text: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:application/json;charset=utf-8," + encodeURIComponent(text),
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
