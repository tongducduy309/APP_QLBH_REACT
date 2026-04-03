import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string } | null)?.from || "/";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "123456",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      await login(values);
      toast.success("Đăng nhập thành công");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl">Đăng nhập hệ thống</CardTitle>
        <CardDescription>Dùng tài khoản demo để trải nghiệm nhanh giao diện đã chuyển sang React.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tài khoản</label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" {...form.register("username")} />
            </div>
            <p className="text-sm text-red-500">{form.formState.errors.username?.message}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" className="pl-9" {...form.register("password")} />
            </div>
            <p className="text-sm text-red-500">{form.formState.errors.password?.message}</p>
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Đăng nhập
          </Button>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-muted-foreground">
            Demo: <strong>admin / 123456</strong>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
