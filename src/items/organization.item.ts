import { Organization } from "_types/schema";

export type TOrganizationBasic = Omit<Organization, "id" | "parentId">;
export type TOrganization = TOrganizationBasic;

export default class OrganizationItem {
  basic: TOrganizationBasic;

  constructor(aElement: Element);
  constructor(rawData: TOrganization);
  constructor(input: Element & TOrganization) {
    if (input instanceof Element) {
      this.basic = this.parseBasic(input);
      this.setUUID(this.basic.uuid);
    } else {
      this.basic = input as TOrganizationBasic;
    }
  }

  public getData(): TOrganization {
    return this.basic;
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
  }

  private parseBasic(element: Element): TOrganizationBasic {
    const basic: TOrganizationBasic = {
      uuid: crypto.randomUUID(),
      name: element.textContent?.trim() ?? "",
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
