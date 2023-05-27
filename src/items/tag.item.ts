import { Tag } from "_types/schema";

export type TTagBasic = Omit<Tag, "id">;
export type TTag = TTagBasic;

export default class TagItem {
  basic: TTagBasic;

  constructor(text: string);
  constructor(rawData: TTag);
  constructor(input: string & TTag) {
    if (typeof input === "string") {
      this.basic = this.parseBasic(input);
      this.setUUID(this.basic.uuid);
    } else {
      this.basic = input as TTagBasic;
    }
  }

  public getData(): TTag {
    return this.basic;
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
  }

  private parseBasic(text: string): TTagBasic {
    const basic: TTagBasic = {
      uuid: "",
      name: text,
      description: null,
    };

    basic.uuid = crypto.randomUUID();

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
