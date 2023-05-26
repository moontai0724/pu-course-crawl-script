export default { parse };

export function parse(tdElement?: Element | null): TPersonBasic {
  const linkElement = tdElement?.querySelector("a");
  const link = linkElement?.href.replace("../", "https://alcat.pu.edu.tw/");
  const name = tdElement?.textContent?.trim() ?? "";
  const description = link?.split("?").pop();

  return {
    name,
    description: description ?? null,
    link: link ?? null,
  };
}

export interface TPersonBasic {
  name: string;
  description: string | null;
  link: string | null;
}
