import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg text-center">
        <CardHeader>
          <CardTitle>404 - Không tìm thấy trang</CardTitle>
          <CardDescription>Route này chưa tồn tại hoặc đã bị thay đổi khi migrate sang React.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Quay lại dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
