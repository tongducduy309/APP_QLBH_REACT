import { PropsWithChildren } from "react";

export function PageShell({ children }: PropsWithChildren) {
  return <div className="space-y-6 p-4 lg:p-6 ">{children}</div>;
}
