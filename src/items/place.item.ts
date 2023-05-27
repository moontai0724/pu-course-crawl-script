import { Place } from "_types/schema";

export type TPlaceBasic = Omit<Place, "id" | "parentId">;
export type TPlace = TPlaceBasic;

export interface TPlaceUUID {
  uuid: string;
  name: string;
}

export default class PlaceItem {
  element: Element | null = null;
  basic: TPlaceBasic;

  constructor(rawData: TPlace);
  constructor(text: string, element?: Element);
  constructor(input: TPlace & string, element?: Element) {
    if (typeof input === "string") {
      this.element = element as Element;
      this.basic = this.parseBasic(input);
      this.setUUID(this.basic.uuid);
    } else {
      this.basic = input as TPlaceBasic;
    }
  }

  public getData(): TPlace {
    return this.basic;
  }

  public getPlaceUUIDs(): TPlaceUUID[] {
    const rawExistingUUIDs = this.element?.getAttribute("data-places");
    const existingUUIDs = JSON.parse(rawExistingUUIDs || "[]");

    return existingUUIDs;
  }

  private getPlaceUUID(name: string): TPlaceUUID | null {
    const existingUUIDs = this.getPlaceUUIDs();
    const existingUUID = existingUUIDs.find(uuid => uuid.name === name);

    return existingUUID || null;
  }

  public setUUID(uuid: string): void {
    const existingUUIDs = this.getPlaceUUIDs();
    const existingUUIDIndex = existingUUIDs.findIndex(
      uuid => uuid.name === this.basic.name,
    );

    if (existingUUIDIndex < 0) {
      existingUUIDs.push({ uuid, name: this.basic.name });
      this.element?.setAttribute("data-places", JSON.stringify(existingUUIDs));
    }

    existingUUIDs[existingUUIDIndex] = { uuid, name: this.basic.name };
    this.basic.uuid = uuid;
    this.element?.setAttribute("data-places", JSON.stringify(existingUUIDs));
  }

  private parseBasic(text: string): TPlaceBasic {
    const basic: TPlaceBasic = {
      uuid: "",
      name: text,
      description: null,
    };

    basic.name = text;
    const existingUUID = this.getPlaceUUID(text);
    basic.uuid = existingUUID?.uuid || crypto.randomUUID();

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
