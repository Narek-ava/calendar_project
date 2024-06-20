import { useCallback, useEffect, useState, useMemo } from 'react';
import moment, { Moment } from 'moment-timezone';

// mui
import { Button, Stack } from '@material-ui/core';
import AddBoxOutlined from '@material-ui/icons/AddBoxOutlined';
import Delete from '@material-ui/icons/Delete';
import SaveOutlined from '@material-ui/icons/SaveOutlined';

// project imports
import { AppointmentType, IAppointmentPayload } from '../../../models/IAppointment';
import { IEmployee, UserRole } from '../../../models/IEmployee';
import BlockTimeForm from './BlockTimeForm';
import { AppointmentWizardProps } from '../wizard/types';
import { ILocation } from '../../../models/ILocation';
import BlockTimeInfo from './BlockTimeInfo';
import useAuth from '../../../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { startSubmitting, stopSubmitting } from 'store/slices/SubmittingSlice';
import { openConfirmPopup } from '../../../store/confirmPopupSlice';
import { DateRange } from '../types';
import { apiTimeFormat } from '../../../store/constant';
import appointmentAPI from '../../../services/AppointmentService';
import BlockSkeleton from './BlockSkeleton';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { isEventDateValid } from '../../../utils/functions/time-zones-helpers';
import CBModal from '../../../ui-component/CBModal';

interface BlockTimeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    location: ILocation;
    eventId: number | undefined;
    closeBlockDialog: () => void;
    employees: IEmployee[];
    range: DateRange | null;
    handleDelete: AppointmentWizardProps['handleDelete'];
    handleCreate: AppointmentWizardProps['handleCreate'];
    handleUpdate: AppointmentWizardProps['handleUpdate'];
    matchSm: boolean;
    isEdit: boolean;
    setIsEdit: (data: boolean) => void;
    selectedEmployeeId: number | null;
    setSelectedEmployeeId: (data: number | null) => void;
}

const BlockTimeDialog = ({
    isOpen,
    onClose,
    range,
    eventId,
    location,
    closeBlockDialog,
    employees,
    handleCreate,
    handleDelete,
    handleUpdate,
    matchSm,
    isEdit,
    setIsEdit,
    selectedEmployeeId,
    setSelectedEmployeeId
}: BlockTimeDialogProps) => {
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const [employee, setEmployee] = useState<IEmployee | null>(null);
    const [start, setStart] = useState<Moment>(moment(range?.start, 'YYYY-MM-DD HH:mm'));
    const [end, setEnd] = useState<Moment>(moment(range?.end, 'YYYY-MM-DD HH:mm'));
    const [error, setError] = useState(false);
    const [dateError, setDateError] = useState<string>('');
    const [title, setTitle] = useState<string>('');

    const { data: block, isLoading: isLoadingBlock } = appointmentAPI.useGetAppointmentQuery(eventId ?? skipToken);
    const { data: history, isLoading: isLoadingHistory } = appointmentAPI.useGetAppointmentHistoryQuery(eventId ?? skipToken);

    const { isSubmitting } = useAppSelector((store) => store.submitting);
    const { isForeignAppointment } = useAppSelector((state) => state.calendar);

    const setInitialValues = () => {
        if (block) {
            setStart(moment(block.start_at));
            setEnd(moment(block.end_at));
            setEmployee(block.employee);
            if (block.note) {
                setTitle(block.note);
            }
        }
    };

    const setProvider = useCallback(
        (id: number) => {
            const provider = employees.find((staff) => staff.id === id);
            if (provider) {
                setEmployee(provider);
            }
        },
        [employees]
    );

    useEffect(() => {
        if (selectedEmployeeId) {
            setProvider(selectedEmployeeId);
        }
        if (user && user.employee.role.name === UserRole.Provider) {
            setProvider(user.employee.id);
        }
    }, [user, selectedEmployeeId]);

    useEffect(() => {
        if (block) {
            setInitialValues();
            return;
        }
        if (range) {
            setStart(moment(range.start, apiTimeFormat));
            setEnd(moment(range.end, apiTimeFormat));
        }
    }, [range, block]);

    const handleSubmit = () => {
        const sendData = (data: IAppointmentPayload) => {
            dispatch(startSubmitting());
            if (block) {
                handleUpdate(String(block.id), data);
            } else {
                handleCreate(data);
            }
        };

        if (!employee) {
            setError(true);
            return;
        }
        if (start && end) {
            if (start >= end) {
                setDateError('End Date cannot be less than or equal to Start Date');
                return;
            }
            const data = ({
                employee_id: employee.id,
                location_id: location.id,
                type: AppointmentType.Blocked_Time,
                start_at: start.toISOString(true),
                end_at: end.toISOString(true),
                note: title
            } as unknown) as IAppointmentPayload;
            // check past time
            if (!isEventDateValid(data, location.time_zone)) {
                dispatch(
                    openConfirmPopup({
                        onConfirm: () => {
                            sendData(data);
                        },
                        onClose: () => {
                            dispatch(stopSubmitting());
                        },
                        confirmText: `${block ? 'Update' : 'Create'}`,
                        text: `Are you sure you want to ${block ? 'update' : 'create'} Time Block for the past date?`
                    })
                );
            } else {
                sendData(data);
            }
        }
    };

    const handleReturn = () => {
        setIsEdit(false);
        setInitialValues();
        setError(false);
    };

    const modalActions = useMemo(
        () =>
            !isLoadingBlock ? (
                <Stack direction="row" spacing={matchSm ? 1 : 2}>
                    {block && (
                        <Button
                            color="error"
                            onClick={() => {
                                handleDelete(block.id, block.type);
                            }}
                            startIcon={<Delete />}
                        >
                            Delete
                        </Button>
                    )}
                    {isEdit && block && (
                        <Button variant="text" onClick={handleReturn}>
                            Return
                        </Button>
                    )}
                    {!isEdit && !isForeignAppointment && (
                        <Button disabled={isSubmitting} variant="contained" color="secondary" onClick={() => setIsEdit(true)}>
                            Edit
                        </Button>
                    )}
                </Stack>
            ) : undefined,
        [block, handleDelete, handleReturn, isEdit, isForeignAppointment, isSubmitting, matchSm, setIsEdit, isLoadingBlock]
    );

    const okButtonText = useMemo(() => {
        if (isLoadingBlock) return undefined;

        if (block && isEdit) return 'Update';

        return block ? undefined : 'Create';
    }, [block, isEdit, isLoadingBlock]);

    return (
        <CBModal
            id="block_wizard"
            title="Block Time"
            maxWidth={matchSm ? false : 'sm'}
            fullWidth
            fullScreen={matchSm}
            onClose={onClose}
            open={isOpen}
            okButtonText={okButtonText}
            okButtonStartIcon={block ? <SaveOutlined /> : <AddBoxOutlined />}
            onClickOk={handleSubmit}
            okButtonDisabled={isSubmitting}
            specialContent={modalActions}
        >
            {!isLoadingBlock && !isLoadingHistory && (
                <>
                    {isEdit ? (
                        <BlockTimeForm
                            userRole={user?.employee.role.name}
                            title={title}
                            setTitle={setTitle}
                            employees={employees}
                            employee={employee}
                            setEmployee={setEmployee}
                            start={start}
                            setStart={setStart}
                            end={end}
                            setEnd={setEnd}
                            error={error}
                            setError={setError}
                            dateError={dateError}
                            setDateError={setDateError}
                            matchSm={matchSm}
                        />
                    ) : (
                        <>{block && history && <BlockTimeInfo matchSm={matchSm} event={block} history={history} />}</>
                    )}
                </>
            )}
            {eventId && (isLoadingBlock || isLoadingHistory) && <BlockSkeleton />}
        </CBModal>
    );
};

export default BlockTimeDialog;
