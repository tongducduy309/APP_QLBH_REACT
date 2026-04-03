import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatNumberInput, parseFormattedNumber } from "@/lib/number-format";
import { cn } from "@/lib/utils";

type NumberInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value: number;
  onValueChange: (value: number) => void;
};

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onValueChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      value ? formatNumberInput(value) : ""
    );

    React.useEffect(() => {
      setDisplayValue(value ? formatNumberInput(value) : "");
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;

      const sanitized = rawValue.replace(/[^\d.-]/g, "");
      const parsedValue = parseFormattedNumber(sanitized);

      setDisplayValue(sanitized ? formatNumberInput(sanitized) : "");
      onValueChange(parsedValue);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      props.onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setDisplayValue(value ? formatNumberInput(value) : "");
      props.onBlur?.(event);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(className)}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";