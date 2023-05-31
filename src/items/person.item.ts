import { Person } from "../_types/schema";
import { load } from "cheerio";
import { Cheerio, Element } from "cheerio";
import * as crypto from "crypto";

export type TPersonBasic = Omit<Person, "id">;
export type TPerson = TPersonBasic & {
  internalValues: TPersonInternalValues;
};

export interface TPersonInternalValues {
  personId?: string | null;
}

export default class PersonItem {
  basic: TPersonBasic;
  intervalValues: TPersonInternalValues = {};

  constructor(aElement: Element);
  constructor(rawData: TPerson);
  constructor(input: Element & TPerson) {
    if (input.uuid) {
      const { internalValues, ...basic } = input as TPerson;
      this.basic = basic;
      this.intervalValues = internalValues;
    } else {
      this.basic = this.parseBasic(load(input).fn);
      this.setUUID(this.basic.uuid);
    }
  }

  public getData(): TPerson {
    const data: TPerson = {
      ...this.basic,
      internalValues: this.intervalValues,
    };

    return data;
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
    // this.element?.setAttribute("data-uuid", uuid);
  }

  private parseBasic(element: Cheerio<Element>): TPersonBasic {
    // eslint-disable-next-line prefer-const
    let course: TPersonBasic = {
      uuid: crypto.randomUUID(),
      name: element.text().trim() ?? "",
      description: null,
      link:
        element.attr("href")?.replace("../", "https://alcat.pu.edu.tw/") ||
        null,
    };

    this.intervalValues.personId = course.link?.split("?").pop();

    return course;
  }

  public getHash(): string {
    return `${this.basic.name} ${this.basic.link}`;
  }

  public toInputData() {
    return this.basic;
  }
}
