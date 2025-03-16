import { Item } from "@/domain/models/Item";

export function transformToItems<T>(
  array: T[],
  nameKey: keyof T,
  codeKey?: keyof T
): Item[] {
  return array.map((item, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = String((item as any).id);
    const name = String(item[nameKey]);
    const code = codeKey && item[codeKey] ? String(item[codeKey]) : `CODE-${id}-${index + 1}`;

    return {
      id,
      name,
      code,
    };
  });
}