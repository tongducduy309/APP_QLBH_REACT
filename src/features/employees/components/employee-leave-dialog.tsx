import { DatePicker, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import type {
  EmployeeLeaveCreateReq,
  LeaveType,
} from "../types/employee.types";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
//   onChange: (next: EmployeeLeaveCreateReq) => void;
  onSubmit: (req:EmployeeLeaveCreateReq) => void;
};

const leaveTypeOptions: { label: string; value: LeaveType }[] = [
  { label: "Nghỉ cả ngày", value: "FULL_DAY" },
  { label: "Nghỉ nửa ngày", value: "HALF_DAY" },
];

const initialLeaveForm: EmployeeLeaveCreateReq = {
  leaveDate: new Date().toISOString(),
  leaveType: "FULL_DAY",
  reason: "",
};

export function EmployeeLeaveDialog({
  open,
  loading,
  onClose,
  onSubmit,
}: Props) {

    const [value, setValue] = useState<EmployeeLeaveCreateReq>(initialLeaveForm);

    // const [leaveForm, setLeaveForm] =
    //     useState<EmployeeLeaveCreateReq>(initialLeaveForm);
        
    // const onChange = (next: EmployeeLeaveCreateReq) => {
    //     setLeaveForm(next);
    // };

    useEffect(() => {
      if(open) {
        setValue(initialLeaveForm);
      }
    }, [open]);


  return (
    <Modal
      title="Đánh dấu ngày nghỉ"
      open={open}
      onCancel={onClose}
      onOk={()=>{onSubmit(value)}}
      okText="Lưu"
      cancelText="Đóng"
      confirmLoading={loading}
      destroyOnHidden
    >
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-sm font-medium">Ngày nghỉ</div>
          <DatePicker
            className="w-full"
            format="DD/MM/YYYY"
            value={dayjs(value.leaveDate)}
            onChange={(date) =>
              setValue({
                ...value,
                leaveDate: date ? date.toISOString() : "",
              })
            }
          />
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">Loại nghỉ</div>
          <Select
            className="w-full"
            options={leaveTypeOptions}
            value={value.leaveType}
            onChange={(leaveType) => setValue({ ...value, leaveType })}
          />
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">Lý do</div>
          <Input.TextArea
            rows={3}
            placeholder="Nhập lý do nghỉ"
            value={value.reason}
            onChange={(e) =>
              setValue({
                ...value,
                reason: e.target.value,
              })
            }
          />
        </div>
      </div>
    </Modal>
  );
}