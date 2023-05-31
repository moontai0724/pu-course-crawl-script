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
import * as Path from "path";
import * as FileSystem from "fs";
import { GenericFormData } from "axios";

function download() {
  const oDateRange = DateRangeDataManager.toInputData();
  const oOrganization = OrganizationDataManager.toInputData();
  const oPerson = PersonDataManager.toInputData();
  const oPlace = PlaceDataManager.toInputData();
  const oTime = TimeDataManager.toInputData();
  const oTag = TagDataManager.toInputData();
  const oCourse = CourseDataManager.toInputData();

  console.log("courses amount:", oCourse.length);
  console.log("dateRanges amount:", oDateRange.length);
  console.log("organizations amount:", oOrganization.length);
  console.log("persons amount:", oPerson.length);
  console.log("places amount:", oPlace.length);
  console.log("timeRanges amount:", oTime.length);
  console.log("tags amount:", oTag.length);

  const folder = Path.join(__dirname, "./output");
  if (!FileSystem.existsSync(folder)) FileSystem.mkdirSync(folder);

  FileSystem.writeFileSync(
    Path.join(__dirname, "./output/courses.json"),
    JSON.stringify(oCourse),
  );
  FileSystem.writeFileSync(
    Path.join(__dirname, "./output/dateRanges.json"),
    JSON.stringify(oDateRange),
  );
  FileSystem.writeFileSync(
    Path.join(__dirname, "./output/organizations.json"),
    JSON.stringify(oOrganization),
  );
  FileSystem.writeFileSync(
    Path.join(__dirname, "./output/persons.json"),
    JSON.stringify(oPerson),
  );
  FileSystem.writeFileSync(
    Path.join(__dirname, "./output/places.json"),
    JSON.stringify(oPlace),
  );
  FileSystem.writeFileSync(
    Path.join(__dirname, "./output/timeRanges.json"),
    JSON.stringify(oTime),
  );
  FileSystem.writeFileSync(
    Path.join(__dirname, "./output/tags.json"),
    JSON.stringify(oTag),
  );
}

async function fetch(body: GenericFormData): Promise<cheerio.CheerioAPI> {
  const html = await axios
    .post(
      "https://alcat.pu.edu.tw/2011courseAbstract/main.php?type=mutinew&lang=zh",
      body,
    )
    .then(res => res.data);
  return cheerio.load(html);
}

function parse($: cheerio.CheerioAPI): void {
  const selectedTagElement = $("select[name=classattri] option[selected]");
  const text = selectedTagElement.text();
  const tag = text ? new TagItem(text) : null;
  if (tag) TagDataManager.add(tag);

  const courseElements = $("table tr");
  courseElements
    .toArray()
    .slice(1)
    .forEach(courseElement => {
      const course = new CourseItem(courseElement);
      if (tag) course.addTag(tag.basic.uuid);
      CourseDataManager.add(course);
      console.log("Processing course: ", course);
    });
}

async function main() {
  console.time("Total Execution Time");
  const path = Path.join(__dirname, "./cache");
  if (!FileSystem.existsSync(path)) FileSystem.mkdirSync(path);

  for (let i = 1; i <= 18; i++) {
    console.log("Processing tag: ", i);

    const body = {
      ls_yearsem: "1121",
      selectno: "",
      weekday: "",
      section: "",
      cus_select: "",
      classattri: i.toString(),
      subjname: "",
      teaname: "%",
      opunit: "",
      opclass: "",
      lessonlang: "",
      search: "搜尋",
      click_ok: "Y",
    };

    const allCoursesHtml = await fetch(toFormData(body));
    parse(allCoursesHtml);
  }

  [
    DateRangeDataManager,
    OrganizationDataManager,
    PersonDataManager,
    PlaceDataManager,
    TimeDataManager,
    TagDataManager,
    CourseDataManager,
  ].forEach(manager => manager.saveFile());

  download();
  console.timeEnd("Total Execution Time");
}

main();
