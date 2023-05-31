import { Organization } from "../_types/schema";
import { Cheerio } from "cheerio";
import { Element } from "cheerio";
import * as crypto from "crypto";

export type TOrganizationBasic = Omit<Organization, "id" | "parentId">;
export type TOrganization = TOrganizationBasic;

export default class OrganizationItem {
  basic: TOrganizationBasic;

  constructor(aElement: Cheerio<Element>);
  constructor(rawData: TOrganization);
  constructor(input: Cheerio<Element> & TOrganization) {
    if (input.uuid) {
      this.basic = input as TOrganizationBasic;
    } else {
      this.basic = this.parseBasic(input);
      this.setUUID(this.basic.uuid);
    }
  }

  public getData(): TOrganization {
    return this.basic;
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
  }

  private parseBasic(element: Cheerio<Element>): TOrganizationBasic {
    const basic: TOrganizationBasic = {
      uuid: crypto.randomUUID(),
      name: element.text().trim() ?? "",
      description: null,
    };

    return basic;
  }

  public getHash(): string {
    return this.basic.name;
  }

  public toInputData() {
    return this.basic;
  }
}
