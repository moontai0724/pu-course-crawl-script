import CourseItem from "./items/course.item";
import {
  CourseDataManager,
  DateRangeDataManager,
  OrganizationDataManager,
  PersonDataManager,
  PlaceDataManager,
  TimeDataManager,
  TagDataManager,
} from "./data-managers";
import TagItem from "./items/tag.item";
import axios, { toFormData } from "axios";
import * as cheerio from "cheerio";

function download() {
  const oDateRange = DateRangeDataManager.getInputs();
  const oOrganization = OrganizationDataManager.toInputData();
  const oPerson = PersonDataManager.toInputData();
  const oPlace = PlaceDataManager.toInputData();
  const oTime = TimeDataManager.toInputData();
  const oTag = TagDataManager.toInputData();
  const oCourse = CourseDataManager.toInputData();

  console.log("courses.json", oCourse.length);
  console.log("dateRanges.json", oDateRange.length);
  console.log("organizations.json", oOrganization.length);
  console.log("persons.json", oPerson.length);
  console.log("places.json", oPlace.length);
  console.log("timeRanges.json", oTime.length);
  console.log("tags.json", oTag.length);
}

const body = toFormData({
  ls_yearsem: "1121",
  selectno: undefined,
  weekday: undefined,
  section: undefined,
  cus_select: undefined,
  classattri: "1",
  subjname: undefined,
  teaname: "%",
  opunit: undefined,
  opclass: undefined,
  lessonlang: undefined,
  search: "搜尋",
  click_ok: "Y",
});

async function main() {
  const html = await axios
    .post(
      "https://alcat.pu.edu.tw/2011courseAbstract/main.php?type=mutinew&lang=zh",
      body,
    )
    .then(res => res.data);
  const $ = cheerio.load(html);

  const selectedTagElement = $("select[name=classattri] option[selected]");
  const text = selectedTagElement.text();
  const tag = text ? new TagItem(text) : null;
  if (tag) TagDataManager.add(tag);

  const courseElements = $("table tr");
  Array.from(courseElements)
    .slice(1)
    .forEach(courseElement => {
      const course = new CourseItem(courseElement);
      if (tag) course.addTag(tag.basic.uuid);
      CourseDataManager.add(course);
    });

  download();
}

main();
