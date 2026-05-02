import { NumberInput } from "@/components/ui/number-input";
import { getPayrollSetting, updatePayrollSetting } from "@/services/payroll-api";
import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
    open: boolean;
    onClose: () => void;
};

export function PayrollSettingDialog({
    open,
    onClose,
}: Props) {

    const [salaryDay, setSalaryDay] = useState(1);
    const [settingLoading, setSettingLoading] = useState(false);
    const handleSavePayrollSetting = async () => {
        try {
            setSettingLoading(true);
            await updatePayrollSetting(salaryDay);
            toast.success("Đã lưu ngày nhận lương");
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSettingLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            setSettingLoading(true);
            getPayrollSetting().then((res) => {
                setSalaryDay(res.salaryDay);
            }).finally(() => {
                setSettingLoading(false);
            });
        }
    }, [open]);
    return (

        <Modal
            open={open}
            title="Cài đặt ngày nhận lương"
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleSavePayrollSetting} loading={settingLoading}>
                    Lưu cài đặt
                </Button>,
            ]}
        >
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                    Chọn ngày bắt đầu tính lương hàng tháng. Ví dụ chọn ngày 5 thì kỳ lương
                    sẽ tính từ ngày 5 đến ngày in bảng lương.
                </p>

                <NumberInput
                    className="w-full"
                    value={salaryDay}
                    min={1}
                    max={31}
                    step={1}
                    onValueChange={(val) => setSalaryDay(val || 1)}
                    addonBefore="Ngày nhận lương"
                    addonAfter="hàng tháng"
                    showControls
                    integerOnly
                    textAlign="center"
                />
            </div>
        </Modal>
    );
}