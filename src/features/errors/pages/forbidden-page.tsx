import { Link } from "react-router-dom";
import { Result } from "antd";
import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
      

      {/* Nội dung */}
      <Result
        status="403"
        title={<span className="text-4xl font-bold text-black">403</span>}
        subTitle={
          <span className="text-gray-500 text-base">
            Bạn không có quyền truy cập vào khu vực này.
            <br />
            Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.
          </span>
        }
      />

      {/* Action */}
      <div className="mt-6 flex gap-3">
        <Button asChild className="px-6 bg-black text-white hover:bg-black/90">
          <Link to="/">Về trang chính</Link>
        </Button>

        <Button
          variant="outline"
          className="border-gray-300 text-black hover:bg-gray-100"
          onClick={() => window.history.back()}
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
}