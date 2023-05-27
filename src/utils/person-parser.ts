import { PersonDataManager } from "../data-managers";
import PersonItem, { TPerson } from "../items/person.item";

export default { parseAll };

export function parseAll(tdElement?: Element | null): PersonItem[] {
  const persons: PersonItem[] = [];

  const aElements = tdElement?.querySelectorAll("a");
  aElements?.forEach(aElement => {
    const person = new PersonItem(aElement);
    PersonDataManager.add(person);
    persons.push(person);
  });

  const textContent = tdElement?.textContent?.trim();
  if (!persons.length && textContent && textContent != "") {
    const person: TPerson = {
      uuid: crypto.randomUUID(),
      name: textContent,
      description: null,
      link: null,
      internalValues: {},
    };

    persons.push(new PersonItem(person));
  }

  return persons;
}
