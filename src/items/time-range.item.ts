import { TimeRange } from "_types/schema";
import { WeekdayTimePlace } from "../utils/weekday-time-place-parser";

export type TTimeRangeBasic = Omit<
  TimeRange,
  "id" | "startTime" | "endTime"
> & {
  startTime: string;
  endTime: string;
};

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

  public getTimeRangeHashs(): string[] {
    const rawExistingUUIDs = this.element?.getAttribute("data-times");
    const existingUUIDs = JSON.parse(rawExistingUUIDs || "[]");

    return existingUUIDs;
  }

  public setHash(): void {
    const existings = this.getTimeRangeHashs();
    const existingIndex = existings.findIndex(time => time === this.getHash());

    if (existingIndex < 0) {
      existings.push(this.getHash());
      this.element?.setAttribute("data-times", JSON.stringify(existings));
    }

    existings[existingIndex] = this.getHash();
    this.element?.setAttribute("data-times", JSON.stringify(existings));
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

    return JSON.stringify(identicalValues);
  }

  public toInputData() {
    return this.basic;
  }
}
