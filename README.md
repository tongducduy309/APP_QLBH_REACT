# APP_QLBH React

Bản React hoá từ repo Angular `APP_QLBH`.

## Công nghệ
- React 19
- Vite 7
- TypeScript 5
- Node.js **24.14.0**
- Tailwind CSS
- shadcn/ui style components
- Ant Design
- Zustand
- TanStack Query
- React Hook Form + Zod

## Chức năng đã dựng
- Đăng nhập
- Dashboard
- Quản lý bán hàng
- Quản lý hàng hóa
- Quản lý khách hàng
- Lịch sử giao dịch
- Báo cáo thuế
- Bảng báo giá
- Thống kê
- Phiếu nhập
- Quét mã vạch
- Cài đặt
- Protected routes
- Responsive layout

## Chạy dự án
```bash
nvm use 24.14.0
npm install
npm run dev
```

Mặc định Vite chạy tại `http://localhost:3000`.

## Tài khoản demo
- User: `admin`
- Password: `123456`

## Cấu trúc
```txt
src/
  app/
  components/
  features/
  layouts/
  lib/
  routes/
  styles/
```

## Ghi chú
- Dự án này tập trung vào việc **chuyển kiến trúc Angular sang React** và dựng sẵn UI/flow để bạn có thể chạy ngay.
- `src/lib/axios.ts` đã sẵn sàng để nối backend thật.
- Dữ liệu hiện dùng mock ở `src/lib/mock-data.ts` để dự án chạy độc lập.


## BUILD

```bash
npm run dist:win             
