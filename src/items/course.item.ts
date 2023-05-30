import { Course } from "_types/schema";
import weekdayTimePlaceParser from "../utils/weekday-time-place-parser";
import { WeekdayTimePlace } from "../utils/weekday-time-place-parser";
import personParser from "../utils/person-parser";
import PersonItem from "./person.item";
import OrganizationItem from "./organization.item";
import PlaceItem from "./place.item";
import {
  OrganizationDataManager,
  PlaceDataManager,
  TagDataManager,
  TimeDataManager,
} from "../data-managers";
import TimeRangeItem from "./time-range.item";
import TagItem from "./tag.item";

export type TCourseBasic = Omit<
  Course,
  "id" | "dateRangeId" | "organizationId"
>;
export type TCourse = TCourseBasic & {
  internalValues: TCourseInternalValues;
};

export interface TCourseInternalValues {
  organization?: OrganizationItem | null;
  typeName?: string | null;
  persons?: PersonItem[];
  weekTimePlaces?: WeekdayTimePlace[];
  places?: PlaceItem[];
  timeRanges?: TimeRangeItem[];
  tags?: TagItem[];
}

export default class CourseItem {
  basic: TCourseBasic;
  internalValues: TCourseInternalValues = {};

  constructor(trElement: Element);
  constructor(rawData: TCourse);
  constructor(input: Element & TCourse) {
    if (input instanceof Element) {
      this.basic = this.parseBasic(input);
      this.setUUID(this.basic.uuid);
    } else {
      const { internalValues, ...basic } = input as TCourse;
      this.basic = basic;
      this.internalValues = internalValues;
    }
  }

  public addPlace(place: PlaceItem): void {
    this.internalValues.places = this.internalValues.places || [];
    this.internalValues.places.push(place);
  }

  public addTimeRange(timeRange: TimeRangeItem): void {
    this.internalValues.timeRanges = this.internalValues.timeRanges || [];
    this.internalValues.timeRanges.push(timeRange);
  }

  public addTag(tag: TagItem): void {
    this.internalValues.tags = this.internalValues.tags || [];
    this.internalValues.tags.push(tag);
  }

  public addPerson(person: PersonItem): void {
    this.internalValues.persons = this.internalValues.persons || [];
    this.internalValues.persons.push(person);
  }

  public getData(): TCourse {
    const internalValues: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.internalValues)) {
      if (value instanceof Array) {
        internalValues[key] = value.map(({ element, ...item }) => item);
      } else if (value instanceof Object) {
        const { element, ...item } = value;
        internalValues[key] = item;
      } else {
        internalValues[key] = value;
      }
    }

    const data: TCourse = {
      ...this.basic,
      internalValues,
    };

    return data;
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
  }

  private parseBasic(element: Element): TCourseBasic {
    // eslint-disable-next-line prefer-const
    let course: TCourseBasic = {
      uuid: crypto.randomUUID(),
      code: this.parseCode(element),
      name: "",
      description: "",
      link: "",
      credit: this.parseCredit(element),
    };

    const { chinese, english, link } = this.parseName(element);
    const note = this.parseNote(element);
    course.name = chinese;
    course.description = [english, note].filter(Boolean).join("\n");
    course.link = link?.replace("../", "https://alcat.pu.edu.tw/") ?? null;

    this.internalValues.organization = this.parseOrganization(element);
    this.internalValues.typeName = this.parseTypeName(element);
    this.internalValues.persons = this.parsePerson(element);
    this.internalValues.weekTimePlaces = this.parseWeekTimePlaces(element);
    this.internalValues.places = this.parsePlaces(element);
    this.internalValues.timeRanges = this.parseTimeRanges(element);

    const type = this.parseType(element);
    if (type) this.addTag(type);

    return course;
  }

  public getHash(): string {
    const identicalValues = [
      this.basic.code,
      this.basic.name,
      this.basic.credit,
      this.internalValues.organization?.basic.uuid,
      this.internalValues.weekTimePlaces,
    ];

    return identicalValues.join(" ");
  }

  private parseCode(element: Element): string {
    const target = element.querySelector("td:nth-child(1)");
    return target?.textContent?.trim() ?? "";
  }

  private parseOrganization(element: Element): OrganizationItem | null {
    const target = element.querySelector("td:nth-child(2)");
    if (!target) return null;

    const organization = new OrganizationItem(target);
    OrganizationDataManager.add(organization);
    return organization;
  }

  private parseType(element: Element): TagItem | null {
    const name = this.parseTypeName(element);
    if (!name) return null;
    const tag = new TagItem(name);
    TagDataManager.add(tag);
    return tag;
  }

  private parseTypeName(element: Element): string | null {
    const target = element.querySelector("td:nth-child(3)");
    return target?.textContent?.trim() || null;
  }

  private parseName(element: Element): {
    chinese: string;
    english: string | null;
    link: string | null;
  } {
    const target = element.querySelector("td:nth-child(4)");
    if (!target) {
      console.error("Cannot find title element in: ", element);
      throw new Error("Cannot find title element");
    }

    const linkElement = target?.querySelector("a");
    if (!linkElement) {
      return {
        chinese: target?.textContent?.trim() ?? "",
        english: null,
        link: null,
      };
    }

    const chinese = linkElement.textContent?.trim() ?? "";
    const english =
      Array.from(target.childNodes).pop()?.textContent?.trim() ?? null;
    const link = linkElement.getAttribute("href") ?? null;

    return { chinese, english, link };
  }

  private parseCredit(element: Element): number {
    const target = element.querySelector("td:nth-child(6)");
    return parseInt(target?.textContent?.trim() || "0", 10);
  }

  public getPersonElements(element: Element): HTMLAnchorElement[] {
    const elements = element.querySelectorAll("td:nth-child(7) a");
    return Array.from(elements) as HTMLAnchorElement[];
  }

  private parsePerson(element: Element): PersonItem[] {
    const target = element.querySelector("td:nth-child(7)");
    return personParser.parseAll(target);
  }

  private parseTimeRanges(element: Element): TimeRangeItem[] {
    const target = element.querySelector("td:nth-child(8)");
    return TimeDataManager.parse(target);
  }

  private parseWeekTimePlaces(element: Element): WeekdayTimePlace[] {
    const target = element.querySelector("td:nth-child(8)");
    const text = (target as HTMLElement).innerText?.trim() || "";
    const weekTimePlaces = weekdayTimePlaceParser.parseAll(text);
    return weekTimePlaces;
  }

  private parsePlaces(element: Element): PlaceItem[] {
    const target = element.querySelector("td:nth-child(8)");
    return PlaceDataManager.parse(target);
  }

  private parseNote(element: Element): string | null {
    const target = element.querySelector("td:nth-child(9)");
    return target?.textContent?.trim() || null;
  }

  public toInputData() {
    const inputWithRelations: TCourseBasic & {
      [key: string]: any;
    } = {
      ...this.basic,
      organization: undefined,
      dateRange: {
        connect: { uuid: "1d2b127d-82a9-473f-bc87-d658fa00731a" },
      },
      hosts: undefined,
      places: undefined,
      tags: undefined,
      timeRanges: undefined,
    };

    if (this.internalValues.organization)
      inputWithRelations.organization = {
        connect: { uuid: this.internalValues.organization?.basic.uuid },
      };

    if (this.internalValues.persons?.length)
      inputWithRelations.hosts = {
        connect: this.internalValues.persons?.map(person => ({
          uuid: person.basic.uuid,
        })),
      };

    if (this.internalValues.places?.length)
      inputWithRelations.places = {
        connect: this.internalValues.places?.map(place => ({
          uuid: place.basic.uuid,
        })),
      };

    if (this.internalValues.tags?.length)
      inputWithRelations.tags = {
        connect: this.internalValues.tags?.map(tag => ({
          uuid: tag.basic.uuid,
        })),
      };

    if (this.internalValues.timeRanges?.length)
      inputWithRelations.timeRanges = {
        connect: this.internalValues.timeRanges?.map(timeRange => ({
          id: timeRange.basic.id,
        })),
      };

    return inputWithRelations;
  }
}
