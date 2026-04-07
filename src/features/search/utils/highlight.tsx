import { Fragment } from "react";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightText(text: string, keyword: string) {
  if (!text) return text;
  if (!keyword.trim()) return text;

  const normalizedKeyword = keyword.trim();
  const regex = new RegExp(`(${escapeRegExp(normalizedKeyword)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch =
          part.toLowerCase() === normalizedKeyword.toLowerCase();

        if (isMatch) {
          return (
            <mark
              key={`${part}-${index}`}
              className="rounded bg-yellow-200 px-1 text-slate-900"
            >
              {part}
            </mark>
          );
        }

        return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
      })}
    </>
  );
}