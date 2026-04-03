import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg text-center">
        <CardHeader>
          <CardTitle>403 - Không có quyền truy cập</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
