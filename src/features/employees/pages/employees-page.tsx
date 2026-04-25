import { PageShell } from "@/components/layout/page-shell";
import { EmployeeTable } from "../components/employee-table";
import { EmployeeDialog } from "../components/employee-dialog";
import { useEmployeePage } from "../hooks/useEmployeePage";
import { usePermission } from "@/app/hooks/usePermission";

export function EmployeesPage() {
  const employee = useEmployeePage();
  const { hasRole } = usePermission();
  
  const canViewSalary = hasRole(["ADMIN", "STORE_MANAGER"]);
  const canAddEmployee = hasRole(["ADMIN", "STORE_MANAGER"]);

  return (
    <PageShell>
      <EmployeeTable
        items={employee.paginatedEmployees}
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
        // isEditing={employee.isEditing}
        value={employee.form}
        loading={employee.isSubmitting}
        onClose={() => {
          employee.setIsDialogOpen(false);
          employee.resetForm();
        }}
        onChange={employee.setForm}
        onSubmit={employee.handleSubmit}
      />
    </PageShell>
  );
}

