import { Organization } from "_types/schema";

export type TOrganizationBasic = Omit<Organization, "id" | "parentId">;
export type TOrganization = TOrganizationBasic;

export default class OrganizationItem {
  element: Element | null = null;
  basic: TOrganizationBasic;

  constructor(aElement: Element);
  constructor(rawData: TOrganization);
  constructor(input: Element & TOrganization) {
    if (input instanceof Element) {
      this.element = input;
      this.basic = this.parseBasic();
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
    this.element?.setAttribute("data-uuid", uuid);
  }

  private parseBasic(): TOrganizationBasic {
    const basic: TOrganizationBasic = {
      uuid: "",
      name: "",
      description: null,
    };

    const existingUUID = this.element?.getAttribute("data-uuid");
    basic.uuid = existingUUID || crypto.randomUUID();
    basic.name = this.element?.textContent?.trim() ?? "";

    return basic;
  }

  public getHash(): string {
    const identicalValues = {
      name: this.basic.name,
    };

    return JSON.stringify(identicalValues);
  }

  public toInputData() {
    return this.basic;
  }
}
