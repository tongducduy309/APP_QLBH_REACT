import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, readOnly, disabled, title, ...props }, ref) => {
  const tooltipText =
    title ??
    (readOnly
      ? "Chỉ đọc"
      : disabled
      ? "Không cho phép chỉnh sửa"
      : undefined);

  const inputElement = (
    <input
      type={type}
      ref={ref}
      readOnly={readOnly}
      disabled={disabled}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring",
        readOnly && "cursor-not-allowed opacity-80",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    />
  );

  // nếu không có tooltip thì return thẳng
  if (!tooltipText) return inputElement;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span để tránh lỗi khi disabled */}
          <span className="w-full">{inputElement}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

Input.displayName = "Input";