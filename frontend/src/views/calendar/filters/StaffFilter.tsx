import { useCallback } from 'react';
import { StaffFilterProps } from '../types';
import { getAvatarData } from '../../../ui-component/AvatarData';
import GroupOfAvatars, { MoveToProps } from '../../../ui-component/GroupOfAvatars';
import { Stack } from '@material-ui/core';
import { useAppSelector } from '../../../hooks/redux';
import useFilterSettings from '../hooks/useFilterSettings';

const StaffFilter = ({ locationEmployees }: StaffFilterProps) => {
    const { showScheduledStaffOnly } = useAppSelector((state) => state.calendarFilter);
    const { selectedEmployeeIds, setLocationSelectedEmployeeIds } = useFilterSettings();

    const toggleEmployee = useCallback(
        ({ id }: MoveToProps) => {
            setLocationSelectedEmployeeIds(
                selectedEmployeeIds.includes(id)
                    ? selectedEmployeeIds.filter((selectedId) => selectedId !== id)
                    : [...selectedEmployeeIds, id]
            );
        },
        [selectedEmployeeIds, setLocationSelectedEmployeeIds]
    );

    return (
        <Stack>
            <GroupOfAvatars
                data={getAvatarData({
                    data: locationEmployees.map((obj) => ({ ...obj, isActive: selectedEmployeeIds.includes(obj.id) })),
                    path: 'employee',
                    moveTo: toggleEmployee,
                    isClickable: !showScheduledStaffOnly
                })}
                isClickable={false}
                maxCount={10}
            />
        </Stack>
    );
};

export default StaffFilter;
