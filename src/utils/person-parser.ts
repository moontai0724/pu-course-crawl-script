import { PersonDataManager } from "../data-managers";
import PersonItem, { TPerson } from "../items/person.item";

export default { parseAll };

export function parseAll(tdElement?: Element | null): PersonItem[] {
  const persons: PersonItem[] = [];

  const aElements = tdElement?.querySelectorAll("a");
  aElements?.forEach(aElement => {
    const person = PersonDataManager.add(new PersonItem(aElement));
    persons.push(person);
  });

  const textContent = tdElement?.textContent?.trim();
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
