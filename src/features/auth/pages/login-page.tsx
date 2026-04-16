import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/store/auth-store";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tài khoản"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  // const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // const from = (location.state as { from?: string } | null)?.from || "/";


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      await login(values);
      toast.success("Đăng nhập thành công");
      navigate("/sales");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-slate-900 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900" />
          <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 text-white">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Hệ thống quản lý bán hàng
              </div>

              <h1 className="max-w-xl text-4xl font-bold leading-tight">
                Đăng nhập để truy cập hệ thống quản lý cửa hàng tôn thép
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Theo dõi đơn hàng, khách hàng, tồn kho và hoạt động bán hàng trên
                một giao diện hiện đại, trực quan và dễ sử dụng.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm font-medium text-white">Quản lý tập trung</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Đồng bộ quy trình bán hàng, in hóa đơn, theo dõi công nợ và quản
                  lý danh mục sản phẩm.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm font-medium text-white">Nhanh và bảo mật</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Xác thực tài khoản an toàn, thao tác nhanh, phù hợp cho môi
                  trường làm việc thực tế tại cửa hàng.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <Card className="w-full max-w-md border-0 bg-white shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                  <LockKeyhole className="h-5 w-5" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Đăng nhập
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Nhập thông tin tài khoản để tiếp tục vào hệ thống.
                </p>
              </div>

              <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-slate-700"
                  >
                    Tài khoản
                  </label>

                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="username"
                      placeholder="Nhập tài khoản"
                      autoComplete="username"
                      className="h-11 rounded-xl border-slate-200 pl-10 shadow-sm focus-visible:ring-1"
                      {...form.register("username")}
                    />
                  </div>

                  {form.formState.errors.username?.message ? (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.username.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Mật khẩu
                  </label>

                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      className="h-11 rounded-xl border-slate-200 pl-10 pr-11 shadow-sm focus-visible:ring-1"
                      {...form.register("password")}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {form.formState.errors.password?.message ? (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      Đăng nhập
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}