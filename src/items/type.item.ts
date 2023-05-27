import { Tag } from "_types/schema";

export type TTypeBasic = Omit<Tag, "id">;
export type TType = TTypeBasic;

export default class TypeItem {
  element: Element | null = null;
  basic: TTypeBasic;

  constructor(aElement: Element);
  constructor(rawData: TType);
  constructor(input: Element & TType) {
    if (input instanceof Element) {
      this.element = input;
      this.basic = this.parseBasic();
      this.setUUID(this.basic.uuid);
    } else {
      this.basic = input as TTypeBasic;
    }
  }

  public getData(): TType {
    return this.basic;
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
    this.element?.setAttribute("data-uuid", uuid);
  }

  private parseBasic(): TTypeBasic {
    const basic: TTypeBasic = {
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
