import { PageShell } from "@/components/layout/page-shell";
import { EmployeeTable } from "../components/employee-table";
import { EmployeeDialog } from "../components/employee-dialog";
import { useEmployeePage } from "../hooks/useEmployeePage";

export function EmployeesPage() {
  const employee = useEmployeePage();

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
        onEdit={employee.openEditDialog}
        onViewDetail={employee.openDetail}
        onDelete={employee.handleDeleteEmployee}
        onActivate={employee.handleActivateEmployee}
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

