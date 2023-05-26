import { Course } from "_types/schema";
import weekdayTimePlaceParser from "../utils/weekday-time-place-parser";
import { WeekdayTimePlace } from "../utils/weekday-time-place-parser";
import personParser, { TPersonBasic } from "../utils/person-parser";

export type TCourseBasic = Omit<Course, "id" | "organizationId">;
export interface TCourseRelations {
  organizationUUID: string | null;
  dateRangeUUID: string | null;
  timeRangeUUIDs: string[];
  placeUUIDs: string[];
  tagUUIDs: string[];
  personUUIDs: string[];
}
export type TCourse = TCourseBasic & {
  relations: TCourseRelations;
  internalValues: TCourseInternalValues;
};

export interface TCourseInternalValues {
  organizationName?: string | null;
  typeName?: string | null;
  persons?: TPersonBasic[];
  weekTimePlaces?: WeekdayTimePlace[];
}

export default class CourseItem {
  element: Element | null = null;
  basic: TCourseBasic;
  relations: TCourseRelations;
  internalValues: TCourseInternalValues = {};

  constructor(trElement: Element) {
    this.element = trElement;
    this.basic = this.parseBasic();
    this.relations = this.parseRelations();
    this.setUUID(this.basic.uuid);
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
    this.element?.setAttribute("data-uuid", uuid);
  }

  private parseBasic(): TCourseBasic {
    // eslint-disable-next-line prefer-const
    let course = {} as Partial<TCourse>;

    course.uuid = crypto.randomUUID();
    course.code = this.parseCode();
    this.internalValues.organizationName = this.parseOrganizationName();
    this.internalValues.typeName = this.parseTypeName();
    const { chinese, english, link } = this.parseName();
    const note = this.parseNote();
    course.name = chinese;
    course.description = [english, note].filter(Boolean).join("\n");
    course.link = link;
    course.credit = this.parseCredit();
    this.internalValues.persons = [this.parsePerson()];
    this.internalValues.weekTimePlaces = this.parseWeekTimePlaces();

    return course as TCourse;
  }

  public getHash(): string {
    const identicalValues = {
      code: this.basic.code,
      name: this.basic.name,
      credit: this.basic.credit,
      organizationName: this.internalValues.organizationName,
      weekTimePlaces: this.internalValues.weekTimePlaces,
    };

    return JSON.stringify(identicalValues);
  }

  private parseCode(): string {
    const element = this.element?.querySelector("td:nth-child(1)");
    return element?.textContent?.trim() ?? "";
  }

  private parseOrganizationUUID(): string | null {
    const element = this.element?.querySelector("td:nth-child(2)");
    return element?.getAttribute("data-uuid") || null;
  }

  private parseOrganizationName(): string | null {
    const element = this.element?.querySelector("td:nth-child(2)");
    return element?.textContent?.trim() || null;
  }

  private parseTypeUUID(): string | null {
    const element = this.element?.querySelector("td:nth-child(3)");
    return element?.getAttribute("data-uuid") || null;
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

  private parsePersonUUID(): string {
    const element = this.element?.querySelector("td:nth-child(7)");
    return element?.getAttribute("data-uuid") ?? "";
  }

  private parsePerson(): TPersonBasic {
    const element = this.element?.querySelector("td:nth-child(7)");
    return personParser.parse(element);
  }

  private parseWeekTimePlaces(): WeekdayTimePlace[] {
    const element = this.element?.querySelector("td:nth-child(8)");
    const text = (element as HTMLElement).innerText?.trim() || "";
    const weekTimePlaces = weekdayTimePlaceParser.parseAll(text);
    return weekTimePlaces;
  }

  private parseTimeRangeUUIDs(): string[] {
    const element = this.element?.querySelector("td:nth-child(8)");
    const uuids = element?.getAttribute("data-uuids-timeRange") || "";
    return uuids.split(",");
  }

  private parsePlaceUUIDs(): string[] {
    const element = this.element?.querySelector("td:nth-child(8)");
    const uuids = element?.getAttribute("data-uuids-place") || "";
    return uuids.split(",");
  }

  private parseNote(): string | null {
    const element = this.element?.querySelector("td:nth-child(9)");
    return element?.textContent?.trim() || null;
  }

  public parseRelations(): TCourseRelations {
    const relations: TCourseRelations = {
      organizationUUID: this.parseOrganizationUUID(),
      dateRangeUUID: null,
      timeRangeUUIDs: this.parseTimeRangeUUIDs(),
      placeUUIDs: this.parsePlaceUUIDs(),
      tagUUIDs: [],
      personUUIDs: [],
    };

    const type = this.parseTypeUUID();
    if (type) relations.tagUUIDs.push(type);

    const host = this.parsePersonUUID();
    if (host) relations.personUUIDs.push(host);

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
        connect: this.relations.personUUIDs.map(id => ({ id })),
      },
      places: {
        connect: this.relations.placeUUIDs.map(id => ({ id })),
      },
      tags: {
        connect: this.relations.tagUUIDs.map(id => ({ id })),
      },
      timeRanges: {
        connect: this.relations.timeRangeUUIDs.map(id => ({ id })),
      },
    };

    return inputWithRelations;
  }
}
