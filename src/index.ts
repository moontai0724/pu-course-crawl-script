import {
  Course,
  DateRange,
  Organization,
  Person,
  Place,
  Time,
  Type,
} from "./data-managers";

DateRange.getAll();
Organization.getAll();
Person.getAll();
Place.getAll();
Time.getAll();
Type.getAll();

Course.getAll();

console.log("courses data", Course.getInputs());
console.log("dateRanges data", DateRange.getInputs());
console.log("organizations data", Organization.getInputs());
console.log("persons data", Person.getInputs());
console.log("places data", Place.getInputs());
console.log("timeRanges data", Time.getInputs());
console.log("types data", Type.getInputs());
