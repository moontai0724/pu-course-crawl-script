import { Person } from "_types/schema";

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

  constructor(aElement: HTMLAnchorElement);
  constructor(rawData: TPerson);
  constructor(input: HTMLAnchorElement & TPerson) {
    if (input instanceof HTMLAnchorElement) {
      this.basic = this.parseBasic(input);
      this.setUUID(this.basic.uuid);
    } else {
      const { internalValues, ...basic } = input as TPerson;
      this.basic = basic;
      this.intervalValues = internalValues;
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

  private parseBasic(element: HTMLAnchorElement): TPersonBasic {
    // eslint-disable-next-line prefer-const
    let course: TPersonBasic = {
      uuid: crypto.randomUUID(),
      name: element.textContent?.trim() ?? "",
      description: null,
      link: element.href?.replace("../", "https://alcat.pu.edu.tw/"),
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
