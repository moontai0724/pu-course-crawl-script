import {
  Course,
  DateRange,
  Organization,
  Person,
  Place,
  Time,
  Type,
} from "./data-managers";

const rDateRange = DateRange.getAll();
const rOrganization = Organization.getAll();
const rPerson = Person.getAll();
const rPlace = Place.getAll();
const rTime = Time.getAll();
const rType = Type.getAll();
const rCourse = Course.getAll();

GM_registerMenuCommand(
  "Downlaod All",
  function () {
    const oDateRange = DateRange.getInputs();
    const oOrganization = Organization.getInputs();
    const oPerson = Person.getInputs();
    const oPlace = Place.getInputs();
    const oTime = Time.getInputs();
    const oType = Type.getInputs();
    const oCourse = Course.getInputs();

    console.log("DateRange data", rDateRange, oDateRange);
    console.log("Organization data", rOrganization, oOrganization);
    console.log("Person data", rPerson, oPerson);
    console.log("Place data", rPlace, oPlace);
    console.log("Time data", rTime, oTime);
    console.log("Type data", rType, oType);
    console.log("Course data", rCourse, oCourse);

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
