import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "@/app/router/guards";
import { MainLayout } from "@/layouts/main-layout";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { LoginPage } from "@/features/auth/pages/login-page";
import { SalesPage } from "@/features/sales/pages/sales-page";
import { InventoryPage } from "@/features/inventory/pages/inventory-page";
import { CustomersPage } from "@/features/customers/pages/customers-page";
import { TransactionsPage } from "@/features/transactions/pages/transactions-page";
import { QuoteReportPage } from "@/features/reports/pages/quote-report-page";
import { StatisticsPage } from "@/features/statistics/pages/statistics-page";
import { BarcodePage } from "@/features/barcode/pages/barcode-page";
import { PurchaseReceiptsPage } from "@/features/purchase-receipts/pages/purchase-receipts-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";
import { ForbiddenPage } from "@/features/errors/pages/forbidden-page";
import { NotFoundPage } from "@/features/errors/pages/not-found-page";
import { OrderDetailPage } from "@/features/transactions/pages/OrderDetailPage";
import { OrderEditPage } from "@/features/transactions/pages/EditOrderPage";
import { ProductDetailPage } from "@/features/inventory/pages/product-detail-page";
import { CustomerDetailPage } from "@/features/customers/pages/customer-detail-page";
import { PurchaseReceiptDetailPage } from "@/features/purchase-receipts/pages/purchase-receipt-detail-page";

export const router = createBrowserRouter([
  
  {
    element: <GuestRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/sales", element: <SalesPage /> },
          { path: "/inventory", element: <InventoryPage /> },
          { path: "/inventory/:id", element: <ProductDetailPage /> },
          { path: "/customers", element: <CustomersPage /> },
          { path: "/customers/:id", element: <CustomerDetailPage /> },
          { path: "/transactions", element: <TransactionsPage /> },
          { path: "/transactions/:id", element: <OrderDetailPage /> },
          { path: "/transactions/edit/:id", element: <OrderEditPage /> },
          // { path: "/reports/tax", element: <TaxReportPage /> },
          { path: "/reports/quotes", element: <QuoteReportPage /> },
          { path: "/statistics", element: <StatisticsPage /> },
          { path: "/barcode", element: <BarcodePage /> },
          { path: "/purchase-receipts", element: <PurchaseReceiptsPage /> },
          { path: "/purchase-receipts/:id", element: <PurchaseReceiptDetailPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/sales" replace />,
  },
  { path: "/forbidden", element: <ForbiddenPage /> },
  { path: "*", element: <NotFoundPage /> },
]);