import { TimeRange } from "_types/schema";
import { WeekdayTimePlace } from "../utils/weekday-time-place-parser";

export type TTimeRangeBasic = Omit<
  TimeRange,
  "id" | "startTime" | "endTime"
> & {
  id?: number;
  startTime: string;
  endTime: string;
};

export interface TTimeRangeInfo {
  id: number;
  hash: string;
}

export type TTimeRange = TTimeRangeBasic;

export default class TimeRangeItem {
  element: Element | null = null;
  basic: TTimeRangeBasic;

  constructor(rawData: TTimeRange);
  constructor(wtp: WeekdayTimePlace, element?: Element);
  constructor(input: TTimeRange & WeekdayTimePlace, element?: Element) {
    if (input.time) {
      this.element = element as Element;
      this.basic = this.parseBasic(input as WeekdayTimePlace);
    } else {
      this.basic = input as TTimeRangeBasic;
    }
  }

  public getData(): TTimeRange {
    return this.basic;
  }

  public setId(id: number) {
    this.basic.id = id;
    this.updateToElement(id);
  }

  public parseAllFromElement(): TTimeRangeInfo[] {
    if (!this.element) return [];

    const timeRangeInfos = this.element?.getAttribute("data-time-ranges");
    const timeRangeInfosParsed = JSON.parse(timeRangeInfos || "[]");

    return timeRangeInfosParsed;
  }

  public updateToElement(id: number): void {
    const existing = this.parseAllFromElement();
    let existingIndex = existing.findIndex(
      info => info.hash === this.getHash(),
    );

    if (existingIndex < 0) existingIndex = existing.length;

    existing[existingIndex] = { id, hash: this.getHash() };
    this.saveToElement(existing);
  }

  public saveToElement(data: TTimeRangeInfo[]): void {
    if (!this.element) return;

    this.element.setAttribute("data-time-ranges", JSON.stringify(data));
  }

  private parseBasic(wtp: WeekdayTimePlace): TTimeRangeBasic {
    const basic: TTimeRangeBasic = {
      weekday: wtp.weekday,
      startTime: wtp.time.start,
      endTime: wtp.time.end,
    };

    return basic;
  }

  public getHash(): string {
    const identicalValues = {
      weekday: this.basic.weekday,
      startTime: this.basic.startTime,
      endTime: this.basic.endTime,
    };

    return `${identicalValues.weekday} ${identicalValues.startTime}-${identicalValues.endTime}`;
  }

  public toInputData() {
    return this.basic;
  }
}
