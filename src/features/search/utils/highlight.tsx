import { removeVietnameseTones } from "@/utils/string";
import { Fragment } from "react";

export function highlightText(text: string, keyword: string) {
  if (!text) return text;
  if (!keyword.trim()) return text;

  const normalizedText = removeVietnameseTones(text).toLowerCase();
  const normalizedKeyword = removeVietnameseTones(keyword).toLowerCase().trim();

  if (!normalizedKeyword) return text;

  const ranges: Array<{ start: number; end: number }> = [];
  let startIndex = 0;

  while (startIndex < normalizedText.length) {
    const matchIndex = normalizedText.indexOf(normalizedKeyword, startIndex);
    if (matchIndex === -1) break;

    ranges.push({
      start: matchIndex,
      end: matchIndex + normalizedKeyword.length,
    });

    startIndex = matchIndex + normalizedKeyword.length;
  }

  if (!ranges.length) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  ranges.forEach((range, index) => {
    if (range.start > lastIndex) {
      parts.push(
        <Fragment key={`text-${index}-${lastIndex}`}>
          {text.slice(lastIndex, range.start)}
        </Fragment>
      );
    }

    parts.push(
      <mark
        key={`mark-${index}-${range.start}`}
        className="rounded bg-yellow-200 px-1 text-slate-900"
      >
        {text.slice(range.start, range.end)}
      </mark>
    );

    lastIndex = range.end;
  });

  if (lastIndex < text.length) {
    parts.push(
      <Fragment key={`text-end-${lastIndex}`}>
        {text.slice(lastIndex)}
      </Fragment>
    );
  }

  return <>{parts}</>;
}