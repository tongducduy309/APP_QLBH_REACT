import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function parseNumberInput(value: string): number {
  if (!value || value === "-" || value === "," || value === "-,") return 0;

  const normalized = value
    .replace(/\./g, "") // remove thousand separator
    .replace(",", "."); // decimal separator

  const parsed = Number(normalized);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatNumberInput(value: string | number): string {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  // Nếu là number từ JS: 4.4 => 4,4
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "";

    const [integerPart, decimalPart] = String(value).split(".");

    const formattedInteger = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );

    return decimalPart !== undefined
      ? `${formattedInteger},${decimalPart}`
      : formattedInteger;
  }

  // Nếu là string user đang nhập: 4,4 giữ nguyên dấu ,
  const raw = value;

  const isNegative = raw.startsWith("-");

  const clean = raw
    .replace(/-/g, "")
    .replace(/\./g, "");

  const endsWithComma = clean.endsWith(",");

  const [integerRaw, decimalRaw] = clean.split(",");

  const formattedInteger = (integerRaw || "0").replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "."
  );

  const sign = isNegative ? "-" : "";

  if (endsWithComma) return `${sign}${formattedInteger},`;

  if (decimalRaw !== undefined) {
    return `${sign}${formattedInteger},${decimalRaw}`;
  }

  return `${sign}${formattedInteger}`;
}

type HandleChangeOptions = {
  integerOnly?: boolean;
};

export function handleNumberInputChange(
  rawValue: string,
  options?: HandleChangeOptions,
) {
  const integerOnly = options?.integerOnly ?? false;

  let sanitized = rawValue;

  // chỉ cho phép:
  // số
  // dấu .
  // dấu ,
  // dấu -
  sanitized = integerOnly
    ? sanitized.replace(/[^\d-]/g, "")
    : sanitized.replace(/[^\d.,-]/g, "");

  // chỉ cho phép 1 dấu ,
  if (!integerOnly) {
    const parts = sanitized.split(",");

    if (parts.length > 2) {
      sanitized = `${parts[0]},${parts
        .slice(1)
        .join("")}`;
    }
  }

  // chỉ cho phép dấu - ở đầu
  if (sanitized.includes("-")) {
    sanitized =
      (sanitized.startsWith("-") ? "-" : "") +
      sanitized.replace(/-/g, "");
  }

  // trạng thái nhập đặc biệt
  if (
    sanitized === "" ||
    sanitized === "-" ||
    sanitized === ","
  ) {
    return {
      displayValue: sanitized,
      numberValue: null,
    };
  }

  const numberValue =
    parseNumberInput(sanitized);

  return {
    displayValue: formatNumberInput(
      sanitized,
    ),
    numberValue,
  };
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
  setDisplayValue(value !== null && value !== undefined ? formatNumberInput(value) : "");
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

  let sanitized = rawValue;

  sanitized = integerOnly
    ? sanitized.replace(/[^\d-]/g, "")
    : sanitized.replace(/[^\d.,-]/g, "");

  const isNegative = sanitized.startsWith("-");
  sanitized = sanitized.replace(/-/g, "");
  if (isNegative) sanitized = `-${sanitized}`;

  if (integerOnly) {
    sanitized = sanitized.replace(/\./g, "").replace(/,/g, "");
  } else {
    const parts = sanitized.split(",");
    if (parts.length > 2) {
      sanitized = `${parts[0]},${parts.slice(1).join("")}`;
    }
  }

  if (
    sanitized === "" ||
    sanitized === "-" ||
    sanitized === "," ||
    sanitized === "-,"
  ) {
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
    const rawBeforeCursor = rawValue.slice(0, cursor).replace(/\./g, "");

    let newCursor = 0;
    let rawCount = 0;

    while (newCursor < formatted.length && rawCount < rawBeforeCursor.length) {
      if (formatted[newCursor] !== ".") {
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