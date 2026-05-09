import React from "react";

export const renderChangeLog = (content: string | null | undefined) => {
  if (!content) return "-";

  try {
    const getColor = (action: string) => {
      if (action.startsWith("+")) return "green";
      if (action.startsWith("-")) return "red";
      if (action.startsWith("~")) return "orange";
      return "black";
    };

    const parseFields = (text: string) => {
      if (!text?.trim()) return null;

      // 👉 không có --- → 1 dòng
      if (!text.includes("---")) {
        return <div className="pl-6">{text.trim()}</div>;
      }

      const parts = text.split("---");

      return (
        <>
          {/* dòng đầu */}
          {parts[0]?.trim() && (
            <div className="pl-6">{parts[0].trim()}</div>
          )}

          {/* các dòng sau */}
          {parts.slice(1)
            .filter((item) => item.trim() !== "")
            .map((item, index) => (
              <div key={index} className="pl-10">
                • {item.trim()}
              </div>
            ))}
        </>
      );
    };

    const parseVariant = (variant: string) => {
      const match = variant.match(/^(.*?)\^\^\^(.*)$/);

      if (match) {
        return {
          action: match[1].trim(),
          detail: match[2].trim(),
        };
      }

      return {
        action: "",
        detail: variant.trim(),
      };
    };

    const [title, body] = content.split(":///");

    if (!body) {
      return <div>{parseFields(content)}</div>;
    }

    const variants = body
      .split(/\/\/\//g)
      .filter((item) => item.trim() !== "");

    return (
      <div className="space-y-2">
        {/* Title */}
        <b>{title}</b>

        {variants.map((variant, index) => {
          const { action, detail } = parseVariant(variant);

          return (
            <div key={index}>
              {/* Action */}
              {action && (
                <div
                  className="pl-2 font-medium"
                  style={{ color: getColor(action) }}
                >
                  {index + 1}. {action}
                </div>
              )}

              {/* Fields */}
              <div>{parseFields(detail)}</div>
            </div>
          );
        })}
      </div>
    );
  } catch (e) {
    return content;
  }
};