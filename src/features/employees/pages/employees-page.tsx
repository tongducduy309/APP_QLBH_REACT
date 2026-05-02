import { PageShell } from "@/components/layout/page-shell";
import { EmployeeTable } from "../components/employee-table";
import { EmployeeDialog } from "../components/employee-dialog";
import { useEmployeePage } from "../hooks/useEmployeePage";
import { usePermission } from "@/app/hooks/usePermission";
import { Card} from "antd";
import { Button } from "@/components/ui/button";
import {
  PrinterOutlined,
  TeamOutlined,
  DollarOutlined,
  UserAddOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { printPayrollPdf } from "@/features/payroll/utils/payroll-pdf";
import { getPayroll } from "@/services/payroll-api";

import { PayrollSettingDialog } from "@/features/payroll/components/payroll-setting-dialog";
import { useState } from "react";

export function EmployeesPage() {
  const employee = useEmployeePage();
  const { hasRole } = usePermission();

  const [settingOpen, setSettingOpen] = useState(false);

  const canViewSalary = hasRole(["ADMIN", "STORE_MANAGER"]);
  const canAddEmployee = hasRole(["ADMIN", "STORE_MANAGER"]);
  const canSettingSalary = hasRole(["ADMIN", "STORE_MANAGER"]);

  const employees = Array.isArray(employee.paginatedEmployees)
    ? employee.paginatedEmployees
    : [];

  const totalEmployees = employees.length;

  const totalBaseSalary = employees.reduce(
    (sum, item) => sum + Number(item.baseSalary || 0),
    0
  );

  const averageBaseSalary =
    totalEmployees > 0 ? totalBaseSalary / totalEmployees : 0;

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value || 0) + " đ";

  const handlePrintPayroll = async () => {
    try {
      const now = new Date();

      const salaryDate = now.toISOString().slice(0, 10);


      const payrollData = await getPayroll(salaryDate);

      printPayrollPdf(payrollData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageShell>
      <div className="mb-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <TeamOutlined className="text-lg text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-500">Tổng nhân viên</p>
                <p className="text-lg font-semibold text-blue-700">
                  {totalEmployees}
                </p>
              </div>
            </div>
          </Card>

          {canViewSalary && (
            <>
              <Card className="bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <DollarOutlined className="text-lg text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-500">Tổng lương</p>
                    <p className="text-lg font-semibold text-green-700">
                      {formatMoney(totalBaseSalary)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                    <UserAddOutlined className="text-lg text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-500">Lương trung bình</p>
                    <p className="text-lg font-semibold text-orange-700">
                      {formatMoney(averageBaseSalary)}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

       
          <div className="flex justify-end gap-2">
            {canSettingSalary && (
              <Button
              variant="outline"
                onClick={() => setSettingOpen(true)}
              >
                <SettingOutlined /> Cài đặt lương
              </Button>
            )}
            
            {
              canViewSalary && (
                <Button
                  onClick={handlePrintPayroll}
                  disabled={employees.length === 0}
                >
                  <PrinterOutlined /> In bảng lương
                </Button>
              )
            }
          </div>
      
      </div>

      <EmployeeTable
        items={employees}
        searchValue={employee.keyword}
        onSearchChange={employee.setKeyword}
        page={employee.page}
        pageSize={employee.pageSize}
        total={employee.total}
        onPageChange={employee.setPage}
        onCreate={employee.openCreateDialog}
        onViewDetail={employee.openDetail}
        canViewSalary={canViewSalary}
        canAddEmployee={canAddEmployee}
      />

      <EmployeeDialog
        open={employee.isDialogOpen}
        value={employee.form}
        loading={employee.isSubmitting}
        onClose={() => {
          employee.setIsDialogOpen(false);
          employee.resetForm();
        }}
        onChange={employee.setForm}
        onSubmit={employee.handleSubmit}
      />

      <PayrollSettingDialog
  open={settingOpen}
  onClose={() => setSettingOpen(false)}
/>
    </PageShell>
  );
}