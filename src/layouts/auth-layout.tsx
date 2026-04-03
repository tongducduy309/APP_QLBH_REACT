import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">APP_QLBH</p>
          <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight">
            Chuyển đổi Angular sang React với UI hiện đại từ shadcn và Ant Design.
          </h1>
        </div>
        <p className="max-w-md text-sm text-slate-400">
          Bản dựng này tập trung vào trải nghiệm vận hành bán hàng, quản lý hàng hóa, khách hàng và giao dịch.
        </p>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-10">
        <Outlet />
      </div>
    </div>
  );
}
