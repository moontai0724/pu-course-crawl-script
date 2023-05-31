import { Cheerio, Element } from "cheerio";
import { PersonDataManager } from "../data-managers";
import PersonItem, { TPerson } from "../items/person.item";
import { load } from "cheerio";
import * as crypto from "crypto";

export default { parseAll };

export function parseAll(tdElement?: Cheerio<Element> | null): PersonItem[] {
  const persons: PersonItem[] = [];

  const aElements = tdElement?.find("a");
  aElements?.toArray().forEach(aElement => {
    const person = PersonDataManager.add(new PersonItem(aElement));
    persons.push(person);
  });

  const textContent = tdElement?.text().trim();
  if (!persons.length && textContent && textContent != "") {
    const rawPerson: TPerson = {
      uuid: crypto.randomUUID(),
      name: textContent,
      description: null,
      link: null,
      internalValues: {},
    };

    const person = PersonDataManager.add(new PersonItem(rawPerson));
    persons.push(person);
  }

  return persons;
}
