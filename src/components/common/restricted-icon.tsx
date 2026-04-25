import { EyeOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  message?: string;
  className?: string;
};

export function RestrictedIcon({
  message = "Bạn không có quyền truy cập chức năng này",
  className = "",
}: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-not-allowed">
          <EyeOff className={`w-4 h-4 ${className}`} />
        </span>
      </TooltipTrigger>

      <TooltipContent>
        <p className="text-sm">{message}</p>
      </TooltipContent>
    </Tooltip>
  );
}