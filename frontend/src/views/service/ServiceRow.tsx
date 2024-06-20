import { useCallback, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SortableElement, SortableHandle } from 'react-sortable-hoc';
import { IconTrashOff } from '@tabler/icons';
import { useNavigate } from 'react-router';

// mui
import { useTheme } from '@material-ui/core/styles';
import { Avatar, IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from '@material-ui/core';
import DragIndicator from '@material-ui/icons/DragIndicator';
import DeleteIcon from '@material-ui/icons/Delete';
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';

// project imports
import { IService } from '../../models/IService';
import { useAppDispatch } from '../../hooks/redux';
import Can, { AbilityContext } from '../../utils/roles/Can';
import { replaceMinioToLocalhost } from '../../utils/functions/uploading-images-helpers';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { SNACKBAR_OPEN } from '../../store/actions';
import GroupOfAvatars, { MoveToProps } from '../../ui-component/GroupOfAvatars';
import { openConfirmPopup } from '../../store/confirmPopupSlice';
import { axiosServices } from '../../utils/axios';
import employeeAPI from '../../services/EmployeeService';
import locationAPI from '../../services/LocationService';
import serviceAPI from '../../services/ServiceService';
import { stringToColor } from '../../store/constant';
import EllipsisTypography from '../../ui-component/optimized-text-fields/EllipsisTypography';
import { getAvatarData } from '../../ui-component/AvatarData';
import { useMediaQuery } from '@mui/material';

const DragHandle = SortableHandle(() => <DragIndicator sx={{ cursor: 'grabbing' }} />);

interface ServiceRowProps {
    row: IService;
    isDragging: boolean;
}

const ServiceRow = SortableElement(({ row, isDragging }: ServiceRowProps) => {
    const ref = useRef<HTMLTableRowElement>(null);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const ability = useContext(AbilityContext);
    const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);
    const isMobile = useMediaQuery('(max-width:600px)');

    const showSnackbar = ({ alertSeverity, message }: { alertSeverity: SnackBarTypes; message: string }) => {
        dispatch({
            type: SNACKBAR_OPEN,
            open: true,
            message,
            variant: 'alert',
            alertSeverity,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
    };
    const moveTo = ({ path, id }: MoveToProps) => {
        navigate(`/${path}/${id}`);
    };

    const handleDelete = (service: IService) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => removeService(service),
                confirmText: `Deactivate`,
                text: `Are you sure you want to deactivate ${service.name} ?`
            })
        );
    };

    const removeService = async (service: IService) => {
        if (service) {
            try {
                const res = await axiosServices.delete(`/services/${service.id}`);
                if (res) {
                    showSnackbar({
                        message: 'Service deactivated',
                        alertSeverity: SnackBarTypes.Success
                    });
                    dispatch(employeeAPI.util.invalidateTags(['Employee']));
                    dispatch(locationAPI.util.invalidateTags(['Location']));
                    dispatch(serviceAPI.util.invalidateTags(['Service']));
                }
            } catch (e) {
                dispatch(
                    openConfirmPopup({
                        text: e.message
                    })
                );
                showSnackbar({
                    message: "Error: Service hasn't deactivated",
                    alertSeverity: SnackBarTypes.Error
                });
            }
        }
    };

    const handleRestore = (service: IService) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => restoreService(service),
                confirmText: `Restore`,
                text: `Are you sure you want to Restore ${service.name} ?`
            })
        );
    };

    const restoreService = async (service: IService) => {
        if (service) {
            try {
                const res = await axiosServices.patch(`/services/${service.id}/restore`);
                if (res) {
                    showSnackbar({
                        message: 'Service restored',
                        alertSeverity: SnackBarTypes.Success
                    });
                    dispatch(employeeAPI.util.invalidateTags(['Employee']));
                    dispatch(locationAPI.util.invalidateTags(['Location']));
                    dispatch(serviceAPI.util.invalidateTags(['Service']));
                }
            } catch (e) {
                dispatch(
                    openConfirmPopup({
                        text: e.message
                    })
                );
                showSnackbar({
                    message: "Error: Service hasn't restored",
                    alertSeverity: SnackBarTypes.Error
                });
            }
        }
    };

    return (
        <TableRow hover ref={ref}>
            {!isMobile && (
                <TableCell sx={{ p: 2, pl: 3 }}>
                    <DragHandle />
                </TableCell>
            )}
            <TableCell sx={{ p: { xs: 1, sm: 2 }, pl: 3 }}>
                <Stack direction="row" alignItems="center">
                    {!isMobile && (
                        <Avatar
                            variant="rounded"
                            // color="#fff"
                            src={getLogo(row.images[row.images.length - 1])}
                            sx={{
                                color: '#fff',
                                bgcolor: stringToColor(row?.name),
                                width: 40,
                                height: 40
                            }}
                        >
                            <Typography fontSize="large">{row?.name.charAt(0).toUpperCase()}</Typography>
                        </Avatar>
                    )}
                    <EllipsisTypography
                        text={row.name}
                        ml={2}
                        onClick={ability.can('update', 'service') ? () => navigate(`/service/${row.id}`) : undefined}
                    />
                </Stack>
            </TableCell>
            {!isMobile && (
                <>
                    <TableCell align="left" sx={{ p: 2, pl: 3 }}>
                        {row.employees && row.employees.length > 0 && (
                            <GroupOfAvatars
                                data={getAvatarData({
                                    data: row.employees,
                                    path: 'employee',
                                    moveTo,
                                    isClickable: ability.can('update', 'employee')
                                })}
                                isClickable={ability.can('update', 'employee')}
                            />
                        )}
                    </TableCell>
                    <TableCell sx={{ p: 2, pl: 3 }}>
                        {row.locations && row.locations.length > 0 && (
                            <GroupOfAvatars
                                data={getAvatarData({
                                    data: row.locations,
                                    path: 'location',
                                    moveTo,
                                    isClickable: ability.can('update', 'location')
                                })}
                                isClickable={ability.can('update', 'location')}
                            />
                        )}
                    </TableCell>
                </>
            )}
            {(ability.can('update', 'service') || ability.can('delete', 'service')) && (
                <TableCell align="right" sx={{ p: 2, pl: 1, pr: 2 }}>
                    <Stack direction="row" justifyContent="end" alignItems="center">
                        <Can I="update" a="service">
                            <Tooltip placement="top" title="Edit service">
                                <Link to={`/service/${row.id}`}>
                                    <IconButton color="primary">
                                        <EditTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                                    </IconButton>
                                </Link>
                            </Tooltip>
                        </Can>
                        <Can I="delete" a="service">
                            {row.deleted_at ? (
                                <Tooltip placement="top" title="Restore Service">
                                    <IconButton
                                        onClick={() => handleRestore(row)}
                                        color="primary"
                                        sx={{
                                            color: theme.palette.orange.dark,
                                            borderColor: theme.palette.orange.main,
                                            '&:hover ': { background: theme.palette.orange.light }
                                        }}
                                    >
                                        <IconTrashOff size="1.1rem" />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Tooltip placement="top" title="Deactivate Service">
                                    <IconButton
                                        onClick={() => handleDelete(row)}
                                        color="primary"
                                        sx={{
                                            color: theme.palette.orange.dark,
                                            borderColor: theme.palette.orange.main,
                                            '&:hover ': { background: theme.palette.orange.light }
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Can>
                    </Stack>
                </TableCell>
            )}
        </TableRow>
    );
});

export default ServiceRow;
