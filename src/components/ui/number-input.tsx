import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function parseNumberInput(value: string) {
  // đổi dấu . thành rỗng và , thành .
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatNumberInput(value: number | string) {
  if (value === "" || value === null || value === undefined) return "";

  const text = String(value).replace(/\./g, "").replace(",", ".");

  if (text.endsWith(",")) {
    const intPart = text.slice(0, -1);
    return `${Number(intPart || 0).toLocaleString("vi-VN")},`;
  }

  const [integerPart, decimalPart] = text.split(".");
  const formattedInteger = Number(integerPart || 0).toLocaleString("vi-VN");

  return decimalPart !== undefined
    ? `${formattedInteger},${decimalPart}`
    : formattedInteger;
}

type NumberInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "min" | "max" | "step"
> & {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  showControls?: boolean;
  integerOnly?: boolean;
  textAlign?: "left" | "center" | "right";
};

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onValueChange,
      className,
      addonBefore,
      addonAfter,
      min,
      max,
      step = 1,
      showControls = false,
      integerOnly = false,
      textAlign = "left",
      disabled,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      value ? formatNumberInput(value) : ""
    );

    const clampValue = React.useCallback(
      (next: number) => {
        let result = Number.isNaN(next) ? 0 : next;

        if (integerOnly) {
          result = Math.trunc(result);
        }

        if (typeof min === "number" && result < min) return min;
        if (typeof max === "number" && result > max) return max;

        return result;
      },
      [min, max, integerOnly]
    );

    React.useEffect(() => {
      setDisplayValue(value ? formatNumberInput(value) : "");
    }, [value]);

    const updateValue = (next: number) => {
      const clamped = clampValue(next);
      onValueChange(clamped);
      setDisplayValue(clamped ? formatNumberInput(clamped) : "");
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const cursor = input.selectionStart ?? 0;
      const rawValue = input.value;

      let sanitized = rawValue.replace(/,/g, "");

      sanitized = integerOnly
        ? sanitized.replace(/[^\d-]/g, "")
        : sanitized.replace(/[^\d.-]/g, "");

      const minusCount = (sanitized.match(/-/g) || []).length;
      if (minusCount > 1 || (sanitized.includes("-") && !sanitized.startsWith("-"))) {
        sanitized = sanitized.replace(/-/g, "");
      }

      if (!integerOnly) {
        const parts = sanitized.split(".");
        if (parts.length > 2) {
          sanitized = `${parts[0]}.${parts.slice(1).join("")}`;
        }
      }

      if (sanitized === "" || sanitized === "-" || sanitized === ".") {
        setDisplayValue(sanitized);
        onValueChange(0);
        return;
      }

      const parsedValue = parseNumberInput(sanitized);
      const nextValue = clampValue(parsedValue);

      const formatted = formatNumberInput(sanitized);

      setDisplayValue(formatted);
      onValueChange(nextValue);

      requestAnimationFrame(() => {
        const rawBeforeCursor = rawValue
          .slice(0, cursor)
          .replace(/\./g, "")
          .replace(/,/g, "");

        let newCursor = 0;
        let rawCount = 0;

        while (newCursor < formatted.length && rawCount < rawBeforeCursor.length) {
          if (formatted[newCursor] !== "." && formatted[newCursor] !== ",") {
            rawCount++;
          }
          newCursor++;
        }

        input.setSelectionRange(newCursor, newCursor);
      });
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const nextValue = clampValue(parseNumberInput(displayValue));
      setDisplayValue(nextValue ? formatNumberInput(nextValue) : "");
      onValueChange(nextValue);
      props.onBlur?.(event);
    };

    const handleDecrease = () => {
      updateValue(Number(value || 0) - step);
    };

    const handleIncrease = () => {
      updateValue(Number(value || 0) + step);
    };

    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };

    return (
      <div
        className={cn(
          "group flex w-full items-stretch overflow-hidden rounded-md border bg-background",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {addonBefore && (
          <div className="flex h-10 items-center whitespace-nowrap bg-muted px-3 text-sm text-muted-foreground">
            {addonBefore}
          </div>
        )}

        {showControls && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={
              disabled ||
              (typeof min === "number" && Number(value || 0) <= min)
            }
            onClick={handleDecrease}
            className="h-10 w-9 rounded-none border-0 bg-transparent opacity-40 transition-opacity hover:bg-muted/50 group-hover:opacity-100"
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}

        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode={integerOnly ? "numeric" : "decimal"}
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "h-10 flex-1 rounded-none border-0 bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            alignClass[textAlign],
            className
          )}
        />

        {showControls && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={
              disabled ||
              (typeof max === "number" && Number(value || 0) >= max)
            }
            onClick={handleIncrease}
            className="h-10 w-9 rounded-none border-0 bg-transparent opacity-40 transition-opacity hover:bg-muted/50 group-hover:opacity-100"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {addonAfter && (
          <div className="flex h-10 items-center whitespace-nowrap bg-muted px-3 text-sm text-muted-foreground">
            {addonAfter}
          </div>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";