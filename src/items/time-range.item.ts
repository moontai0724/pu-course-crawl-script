import { TimeRange } from "../_types/schema";
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
  basic: TTimeRangeBasic;

  constructor(rawData: TTimeRange);
  constructor(wtp: WeekdayTimePlace);
  constructor(input: TTimeRange & WeekdayTimePlace) {
    if (input.time) {
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
