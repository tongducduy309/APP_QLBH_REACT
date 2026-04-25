import { navigationItems } from "@/routes/navigation";

export const routeRoleMap = navigationItems.reduce((acc, item) => {
  acc[item.path] = item.roles || [];
  return acc;
}, {} as Record<string, string[]>);