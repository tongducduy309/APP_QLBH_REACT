import { Link } from "react-router-dom";
import { Result } from "antd";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
      
   

      {/* Nội dung */}
      <Result
        status="404"
        title={<span className="text-4xl font-bold text-black">404</span>}
        subTitle={
          <span className="text-gray-500 text-base">
            Trang bạn đang tìm không tồn tại hoặc đã bị thay đổi.
            <br />
            Có thể đường dẫn đã sai hoặc đã được cập nhật.
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