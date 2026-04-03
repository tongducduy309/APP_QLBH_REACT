import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryProvider } from "@/app/providers/query-provider";
import { router } from "@/app/router";

export function AppProvider() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryProvider>
  );
}
