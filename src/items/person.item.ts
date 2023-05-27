import { Person } from "_types/schema";

export type TPersonBasic = Omit<Person, "id">;
export type TPerson = TPersonBasic & {
  internalValues: TPersonInternalValues;
};

export interface TPersonInternalValues {
  personId?: string | null;
}

export default class PersonItem {
  element: HTMLAnchorElement | null = null;
  basic: TPersonBasic;
  intervalValues: TPersonInternalValues = {};

  constructor(aElement: HTMLAnchorElement);
  constructor(rawData: TPerson);
  constructor(input: HTMLAnchorElement & TPerson) {
    if (input instanceof HTMLAnchorElement) {
      this.element = input;
      this.basic = this.parseBasic();
      this.setUUID(this.basic.uuid);
    } else {
      this.basic = input as TPersonBasic;
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
    this.element?.setAttribute("data-uuid", uuid);
  }

  private parseBasic(): TPersonBasic {
    // eslint-disable-next-line prefer-const
    let course = {} as Partial<TPersonBasic>;

    const existingUUID = this.element?.getAttribute("data-uuid");
    course.uuid = existingUUID || crypto.randomUUID();

    const link = this.element?.href?.replace("../", "https://alcat.pu.edu.tw/");
    const name = this.element?.textContent?.trim() ?? "";
    course.name = name;
    course.description = null;
    course.link = link;
    this.intervalValues.personId = link?.split("?").pop();

    return course as TPersonBasic;
  }

  public getHash(): string {
    const identicalValues = {
      name: this.basic.name,
      link: this.basic.link,
    };

    return JSON.stringify(identicalValues);
  }

  public toInputData() {
    return this.basic;
  }
}