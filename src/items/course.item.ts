import { Course } from "../_types/schema";
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
import { load, Element, CheerioAPI } from "cheerio";
import * as crypto from "crypto";

export type TCourseBasic = Omit<
  Course,
  "id" | "dateRangeId" | "organizationId"
>;
export type TCourse = TCourseBasic & {
  internalValues: TCourseInternalValues;
};

export interface TCourseInternalValues {
  organizationId?: string | null;
  typeName?: string | null;
  personIds?: string[];
  placeIds?: string[];
  timeRangeIds?: number[];
  tagIds?: string[];
}

export default class CourseItem {
  basic: TCourseBasic;
  internalValues: TCourseInternalValues = {};

  constructor(trElement: Element);
  constructor(rawData: TCourse);
  constructor(input: Element & TCourse) {
    if (input.uuid) {
      const { internalValues, ...basic } = input as TCourse;
      this.basic = basic;
      this.internalValues = internalValues;
    } else {
      this.basic = this.parseBasic(load(input));
      this.setUUID(this.basic.uuid);
    }
  }

  public addPlace(placeId: string): void {
    this.internalValues.placeIds = this.internalValues.placeIds || [];
    this.internalValues.placeIds.push(placeId);
  }

  public addTimeRange(timeRangeId: number): void {
    this.internalValues.timeRangeIds = this.internalValues.timeRangeIds || [];
    this.internalValues.timeRangeIds.push(timeRangeId);
  }

  public addTag(tagId: string): void {
    this.internalValues.tagIds = this.internalValues.tagIds || [];
    this.internalValues.tagIds.push(tagId);
  }

  public addPerson(personId: string): void {
    this.internalValues.personIds = this.internalValues.personIds || [];
    this.internalValues.personIds.push(personId);
  }

  public getData(): TCourse {
    const internalValues: Record<string, unknown> = {};

    const data: TCourse = {
      ...this.basic,
      internalValues,
    };

    return data;
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
  }

  private parseBasic(element: CheerioAPI): TCourseBasic {
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

    this.internalValues.typeName = this.parseTypeName(element);
    this.internalValues.organizationId =
      this.parseOrganization(element)?.basic.uuid;
    this.internalValues.personIds = this.parsePerson(element).map(
      person => person.basic.uuid,
    );
    this.internalValues.placeIds = this.parsePlaces(element).map(
      place => place.basic.uuid,
    );
    this.internalValues.timeRangeIds = this.parseTimeRanges(element)
      .map(timeRange => timeRange.basic.id)
      .filter(Boolean) as number[];

    const type = this.parseType(element);
    if (type) this.addTag(type.basic.uuid);

    return course;
  }

  public getHash(): string {
    const identicalValues = [
      this.basic.code,
      this.basic.name,
      this.basic.credit,
      this.internalValues.organizationId,
      this.internalValues.timeRangeIds?.join(","),
      this.internalValues.placeIds?.join(","),
    ];

    return identicalValues.join(" ");
  }

  private parseCode($: CheerioAPI): string {
    const target = $("td:nth-child(1)");
    return target.text().trim() ?? "";
  }

  private parseOrganization($: CheerioAPI): OrganizationItem | null {
    const target = $("td:nth-child(2)");
    if (!target) return null;

    return OrganizationDataManager.add(new OrganizationItem(target));
  }

  private parseType($: CheerioAPI): TagItem | null {
    const name = this.parseTypeName($);
    if (!name) return null;
    return TagDataManager.add(new TagItem(name));
  }

  private parseTypeName($: CheerioAPI): string | null {
    const target = $("td:nth-child(3)");
    return target.text().trim() || null;
  }

  private parseName($: CheerioAPI): {
    chinese: string;
    english: string | null;
    link: string | null;
  } {
    const target = $("td:nth-child(4)");
    if (!target) {
      console.error("Cannot find title element in: ", $);
      throw new Error("Cannot find title element");
    }

    const linkElement = target?.find("a");
    if (!linkElement) {
      return {
        chinese: target.text().trim() ?? "",
        english: null,
        link: null,
      };
    }

    const chinese = linkElement.text().trim() ?? "";
    const english = target.children().last().text().trim() ?? null;
    const link = linkElement.attr("href") ?? null;

    return { chinese, english, link };
  }

  private parseCredit($: CheerioAPI): number {
    const target = $("td:nth-child(6)");
    return parseInt(target.text().trim() || "0", 10);
  }

  private parsePerson($: CheerioAPI): PersonItem[] {
    const target = $("td:nth-child(7)");
    return personParser.parseAll(target);
  }

  private parseTimeRanges($: CheerioAPI): TimeRangeItem[] {
    const target = $("td:nth-child(8)");
    return TimeDataManager.parse(target);
  }

  private parsePlaces($: CheerioAPI): PlaceItem[] {
    const target = $("td:nth-child(8)");
    return PlaceDataManager.parse(target);
  }

  private parseNote($: CheerioAPI): string | null {
    const target = $("td:nth-child(9)");
    return target.text().trim() || null;
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

    if (this.internalValues.organizationId)
      inputWithRelations.organization = {
        connect: { uuid: this.internalValues.organizationId },
      };

    if (this.internalValues.personIds?.length)
      inputWithRelations.hosts = {
        connect: this.internalValues.personIds.map(uuid => ({ uuid })),
      };

    if (this.internalValues.placeIds?.length)
      inputWithRelations.places = {
        connect: this.internalValues.placeIds.map(uuid => ({ uuid })),
      };

    if (this.internalValues.tagIds?.length)
      inputWithRelations.tags = {
        connect: this.internalValues.tagIds.map(uuid => ({ uuid })),
      };

    if (this.internalValues.timeRangeIds?.length)
      inputWithRelations.timeRanges = {
        connect: this.internalValues.timeRangeIds.map(id => ({ id })),
      };

    return inputWithRelations;
  }
}
