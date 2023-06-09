import { Tag } from "../_types/schema";
import * as crypto from "crypto";

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
      uuid: crypto.randomUUID(),
      name: text,
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
