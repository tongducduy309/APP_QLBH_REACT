import { Input } from "@/components/ui/input";
import { CircleCheck, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ValidatedInputStatus = "valid" | "invalid" | "neutral";

type Props = React.ComponentProps<typeof Input> & {
  validateStatus?: ValidatedInputStatus;
  errorMessage?: string;
  loading?: boolean;
};

export default function ValidatedInput({
  validateStatus = "neutral",
  className,
  errorMessage,
  loading = false,
  ...props
}: Props) {
  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          {...props}
          className={cn("pr-10", className)}
        />

        {(loading || validateStatus !== "neutral") && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : validateStatus === "valid" ? (
              <CircleCheck className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {!loading && validateStatus === "invalid" && errorMessage && (
        <p className="pl-2 text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}