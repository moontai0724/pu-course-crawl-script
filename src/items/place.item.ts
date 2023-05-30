import { Place } from "_types/schema";

export type TPlaceBasic = Omit<Place, "id" | "parentId">;
export type TPlace = TPlaceBasic;

export interface TPlaceUUID {
  uuid: string;
  name: string;
}

export default class PlaceItem {
  basic: TPlaceBasic;

  constructor(rawData: TPlace);
  constructor(text: string);
  constructor(input: TPlace & string) {
    if (typeof input === "string") {
      this.basic = this.parseBasic(input);
      this.setUUID(this.basic.uuid);
    } else {
      this.basic = input as TPlaceBasic;
    }
  }

  public getData(): TPlace {
    return this.basic;
  }

  public setUUID(uuid: string): void {
    this.basic.uuid = uuid;
  }

  private parseBasic(text: string): TPlaceBasic {
    const basic: TPlaceBasic = {
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
