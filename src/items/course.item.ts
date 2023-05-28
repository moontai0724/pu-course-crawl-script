import { Course } from "_types/schema";
import weekdayTimePlaceParser from "../utils/weekday-time-place-parser";
import { WeekdayTimePlace } from "../utils/weekday-time-place-parser";
import personParser from "../utils/person-parser";
import PersonItem, { TPerson } from "./person.item";
import OrganizationItem, { TOrganization } from "./organization.item";
import PlaceItem, { TPlace } from "./place.item";
import {
  OrganizationDataManager,
  PlaceDataManager,
  TagDataManager,
  TimeDataManager,
} from "../data-managers";
import TimeRangeItem, { TTimeRange } from "./time-range.item";
import TagItem, { TTag } from "./tag.item";

export type TCourseBasic = Omit<Course, "id" | "organizationId">;
export interface TCourseRelations {
  organizationUUID: string | null;
  dateRangeUUID: string | null;
  timeRangeIds: number[];
  placeUUIDs: string[];
  tagUUIDs: string[];
  personUUIDs: string[];
}
export type TCourse = TCourseBasic & {
  relations: TCourseRelations;
  internalValues: TCourseInternalValues;
};

export interface TCourseInternalValues {
  organization?: OrganizationItem | TOrganization | null;
  typeName?: string | null;
  persons?: (PersonItem | TPerson)[];
  weekTimePlaces?: WeekdayTimePlace[];
  places?: (PlaceItem | TPlace)[];
  timeRanges?: (TimeRangeItem | TTimeRange)[];
  tags?: (TagItem | TTag)[];
}

export default class CourseItem {
  element: Element | null = null;
  basic: TCourseBasic;
  relations: TCourseRelations = {
    organizationUUID: null,
    dateRangeUUID: "1d2b127d-82a9-473f-bc87-d658fa00731a",
    timeRangeIds: [],
    placeUUIDs: [],
    tagUUIDs: [],
    personUUIDs: [],
  };
  internalValues: TCourseInternalValues = {};

  constructor(trElement: Element);
  constructor(rawData: TCourse);
  constructor(input: Element & TCourse) {
    if (input instanceof Element) {
      this.element = input;
      this.basic = this.parseBasic();
      this.relations = this.parseRelations();
      this.setUUID(this.basic.uuid);
    } else {
      const { relations, internalValues, ...basic } = input as TCourse;
      this.basic = basic;
      this.relations = relations;
      this.internalValues = internalValues;
    }
  }

  public addPlace(place: PlaceItem): void {
    this.relations.placeUUIDs.push(place.basic.uuid);
    this.internalValues.places = this.internalValues.places || [];
    this.internalValues.places.push(place);
  }

  public addTimeRange(timeRange: TimeRangeItem): void {
    this.relations.timeRangeIds = this.relations.timeRangeIds || [];
    if (timeRange.basic.id)
      this.relations.timeRangeIds.push(timeRange.basic.id);
    this.internalValues.timeRanges = this.internalValues.timeRanges || [];
    this.internalValues.timeRanges.push(timeRange);
  }

  public addTag(tag: TagItem): void {
    this.relations.tagUUIDs = this.relations.tagUUIDs || [];
    this.relations.tagUUIDs.push(tag.basic.uuid);
    this.internalValues.tags = this.internalValues.tags || [];
    this.internalValues.tags.push(tag);
  }

  public addPersonByElement(personElement: HTMLAnchorElement): void {
    const person = new PersonItem(personElement);
    this.internalValues.persons = this.internalValues.persons || [];
    this.internalValues.persons.push(person);
    this.relations.personUUIDs.push(person.basic.uuid);
    const personContainer = this.element?.querySelector("td:nth-child(7)");
    const element = person.element;
    if (!personContainer || !element) return;
    personContainer.appendChild(element);
  }

  public getData(): TCourse {
    const data: TCourse = {
      ...this.basic,
      relations: this.relations,
      internalValues: this.internalValues,
    };

    return data;
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
    this.element?.setAttribute("data-uuid", uuid);
  }

  private parseBasic(): TCourseBasic {
    // eslint-disable-next-line prefer-const
    let course = {} as Partial<TCourse>;

    const existingUUID = this.element?.getAttribute("data-uuid");
    course.uuid = existingUUID || crypto.randomUUID();
    course.code = this.parseCode();
    this.internalValues.organization = this.parseOrganization();
    this.internalValues.typeName = this.parseTypeName();
    const { chinese, english, link } = this.parseName();
    const note = this.parseNote();
    course.name = chinese;
    course.description = [english, note].filter(Boolean).join("\n");
    course.link = link;
    course.credit = this.parseCredit();
    this.internalValues.persons = this.parsePerson();
    this.internalValues.weekTimePlaces = this.parseWeekTimePlaces();
    this.internalValues.places = this.parsePlaces();
    this.internalValues.timeRanges = this.parseTimeRanges();
    const type = this.parseType();
    if (type) this.addTag(type);

    return course as TCourse;
  }

  public getHash(): string {
    const identicalValues = {
      code: this.basic.code,
      name: this.basic.name,
      credit: this.basic.credit,
      organization: this.relations.organizationUUID,
      weekTimePlaces: this.internalValues.weekTimePlaces,
    };

    return JSON.stringify(identicalValues);
  }

  private parseCode(): string {
    const element = this.element?.querySelector("td:nth-child(1)");
    return element?.textContent?.trim() ?? "";
  }

  private parseOrganization(): OrganizationItem | null {
    const element = this.element?.querySelector("td:nth-child(2)");
    if (!element) return null;

    const organization = new OrganizationItem(element);
    OrganizationDataManager.add(organization);
    return organization;
  }

  private parseOrganizationUUID(): string | null {
    const organization = this.parseOrganization();
    return organization?.basic.uuid || null;
  }

  private parseType(): TagItem | null {
    const name = this.parseTypeName();
    if (!name) return null;
    const tag = new TagItem(name);
    TagDataManager.add(tag);
    return tag;
  }

  private parseTypeName(): string | null {
    const element = this.element?.querySelector("td:nth-child(3)");
    return element?.textContent?.trim() || null;
  }

  private parseName(): {
    chinese: string;
    english: string | null;
    link: string | null;
  } {
    const element = this.element?.querySelector("td:nth-child(4)");
    if (!element) {
      console.error("Cannot find title element in: ", this.element);
      throw new Error("Cannot find title element");
    }

    const linkElement = element?.querySelector("a");
    if (!linkElement) {
      return {
        chinese: element?.textContent?.trim() ?? "",
        english: null,
        link: null,
      };
    }

    const chinese = linkElement.textContent?.trim() ?? "";
    const english =
      Array.from(element.childNodes).pop()?.textContent?.trim() ?? null;
    const link = linkElement.getAttribute("href") ?? null;

    return { chinese, english, link };
  }

  private parseCredit(): number {
    const element = this.element?.querySelector("td:nth-child(6)");
    return parseInt(element?.textContent?.trim() || "0", 10);
  }

  public getPersonElements(): HTMLAnchorElement[] {
    if (!this.element) throw new Error("Cannot find element");

    const elements = this.element.querySelectorAll("td:nth-child(7) a");
    return Array.from(elements) as HTMLAnchorElement[];
  }

  private parsePersonUUIDs(): string[] {
    return this.parsePerson().map(person => person.basic.uuid);
  }

  private parsePerson(): PersonItem[] {
    const element = this.element?.querySelector("td:nth-child(7)");
    return personParser.parseAll(element);
  }

  private parseTimeRanges(): TimeRangeItem[] {
    const element = this.element?.querySelector("td:nth-child(8)");
    return TimeDataManager.parse(element);
  }

  private parseWeekTimePlaces(): WeekdayTimePlace[] {
    const element = this.element?.querySelector("td:nth-child(8)");
    const text = (element as HTMLElement).innerText?.trim() || "";
    const weekTimePlaces = weekdayTimePlaceParser.parseAll(text);
    return weekTimePlaces;
  }

  private parseTimeRangeIds(): number[] {
    const timeRanges = this.parseTimeRanges();
    return timeRanges
      .map(timeRange => timeRange.basic.id)
      .filter(Boolean) as number[];
  }

  private parsePlaces(): PlaceItem[] {
    const element = this.element?.querySelector("td:nth-child(8)");
    return PlaceDataManager.parse(element);
  }

  private parsePlaceUUIDs(): string[] {
    const places = this.parsePlaces();
    const uuids = places.map(place => place.basic.uuid);
    return uuids;
  }

  private parseNote(): string | null {
    const element = this.element?.querySelector("td:nth-child(9)");
    return element?.textContent?.trim() || null;
  }

  public parseRelations(): TCourseRelations {
    const relations: TCourseRelations = {
      organizationUUID: this.parseOrganizationUUID(),
      dateRangeUUID: "1d2b127d-82a9-473f-bc87-d658fa00731a",
      timeRangeIds: this.parseTimeRangeIds(),
      placeUUIDs: this.parsePlaceUUIDs(),
      tagUUIDs: [],
      personUUIDs: [],
    };

    const type = this.parseType();
    if (type) relations.tagUUIDs.push(type.basic.uuid);

    const host = this.parsePersonUUIDs();
    if (host) relations.personUUIDs.push(...host);

    return relations;
  }

  public reloadRelations(): void {
    this.relations = this.parseRelations();
  }

  public toInputData() {
    const inputWithRelations = {
      ...this.basic,
      organization: {
        connect: { uuid: this.relations.organizationUUID },
      },
      dateRange: {
        connect: { uuid: this.relations.dateRangeUUID },
      },
      hosts: {
        connect: this.relations.personUUIDs.map(uuid => ({ uuid })),
      },
      places: {
        connect: this.relations.placeUUIDs.map(uuid => ({ uuid })),
      },
      tags: {
        connect: this.relations.tagUUIDs.map(uuid => ({ uuid })),
      },
      timeRanges: {
        connect: this.relations.timeRangeIds.map(id => ({ id })),
      },
    };

    return inputWithRelations;
  }
}
