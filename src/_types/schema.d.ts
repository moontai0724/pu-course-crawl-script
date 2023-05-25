/* eslint-disable */

/**
 * Model Organization
 *
 */
export type Organization = {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  parentId: number | null;
};

/**
 * Model Tag
 *
 */
export type Tag = {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
};

/**
 * Model Place
 *
 */
export type Place = {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  parentId: number | null;
};

/**
 * Model Person
 *
 */
export type Person = {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  link: string | null;
};

/**
 * Model DateRange
 *
 */
export type DateRange = {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
};

/**
 * Model TimeRange
 *
 */
export type TimeRange = {
  id: number;
  weekday: Weekday;
  startTime: Date;
  endTime: Date;
};

/**
 * Model Course
 *
 */
export type Course = {
  id: number;
  uuid: string;
  code: string | null;
  name: string;
  description: string | null;
  link: string | null;
  credit: number;
  organizationId: number;
  dateRangeId: number;
};

/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const Weekday: {
  MONDAY: "MONDAY";
  TUESDAY: "TUESDAY";
  WEDNESDAY: "WEDNESDAY";
  THURSDAY: "THURSDAY";
  FRIDAY: "FRIDAY";
  SATURDAY: "SATURDAY";
  SUNDAY: "SUNDAY";
};

export type Weekday = (typeof Weekday)[keyof typeof Weekday];
