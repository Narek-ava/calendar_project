import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { filter, startCase, throttle, toLower } from 'lodash';
import { axiosServices } from 'utils/axios';

import {
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Tooltip,
    Typography
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, useMediaQuery } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import { SNACKBAR_OPEN } from 'store/actions';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { IEmployee, UserRole } from 'models/IEmployee';
import employeeAPI from 'services/EmployeeService';
import locationAPI from '../../services/LocationService';
import { ArrangementOrder } from '../../types';
import { IconTrashOff } from '@tabler/icons';
import useAuth from '../../hooks/useAuth';
import { openConfirmPopup } from '../../store/confirmPopupSlice';
import { SnackBarTypes } from '../../store/snackbarReducer';
import AppPagePagination from '../../ui-component/PagePagination';
import GroupOfAvatars, { MoveToProps } from '../../ui-component/GroupOfAvatars';
import { getAvatarData } from '../../ui-component/AvatarData';
import Can, { AbilityContext } from '../../utils/roles/Can';
import { isAllowDeleteEmployee, isAllowEditEmployee } from '../../utils/roles/functions';
import serviceAPI from '../../services/ServiceService';
import EllipsisTypography from '../../ui-component/optimized-text-fields/EllipsisTypography';
import UserAvatar from '../../ui-component/UserAvatar';
import CreateButton from '../../ui-component/CreateButton';
import SwitchWithLabel from '../../ui-component/SwitchWithLabel';
import InviteForm from './InviteForm';
import useMobileCreateButton from '../../hooks/useMobileCreateButton';
import usePlanName from '../../hooks/usePlanName';

const EmployeeList: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const planName = usePlanName();

    const { deactivated } = useAppSelector((state) => state.deactivationToggle);
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [search, setSearch] = useState<string | null>(null);
    const [order, setOrder] = useState<ArrangementOrder>('asc');
    const [orderBy, setOrderBy] = useState<string>('firstname');
    const [trashed, setTrashed] = useState(deactivated);

    const [emailModal, setEmailModal] = useState(false);
    const userRoles = ['All', UserRole.Admin, UserRole.Manager, UserRole.Provider, UserRole.Owner];
    const [role, setRole] = useState<string>(userRoles[0]);
    const [filtered, setFiltered] = useState<IEmployee[] | undefined>(undefined);

    const isMobile = useMediaQuery('(max-width:600px)');

    const ability = useContext(AbilityContext);

    const { data, isLoading } = employeeAPI.useFetchAllEmployeesQuery({
        per_page: perPage,
        page,
        search,
        sort: orderBy,
        order,
        ...(trashed && { trashed: 'true' })
    });

    const [anchorEl, setAnchorEl] = React.useState<Element | ((element: Element) => Element) | null | undefined>(null);
    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
    };

    const throttled = useRef(
        throttle((newValue) => {
            setSearch(newValue);
        }, 1000)
    );

    const handleOrderBy = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    useEffect(() => {
        if (data) {
            if (role === userRoles[0]) {
                setFiltered(data.data);
            } else {
                const searched = filter(data.data, (row) => row.role.toLowerCase() === role.toLowerCase());
                setFiltered(searched);
            }
        }
    }, [data, search, role]);

    const tableCells = [
        { id: 'firstname', label: isMobile ? 'Employee Name' : 'Name' },
        { id: 'role', label: 'Role' }
    ];

    const handleSearch = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | undefined) => {
        const newString = event?.target.value;
        throttled.current(newString?.toLowerCase());
    };

    const handleChangeRole = (event: SelectChangeEvent) => {
        setRole(event.target.value as string);
    };

    const handleChangeStatus = useCallback(() => {
        setTrashed(!trashed);
        setPage(1);
    }, [trashed]);

    const handleClose = (limit?: number) => {
        if (limit) {
            setPerPage(limit);
            setPage(1);
        }
        setAnchorEl(null);
    };

    const handleOpenEmailModal = () => setEmailModal(true);
    const handleCloseEmailModal = () => setEmailModal(false);

    useMobileCreateButton({
        action: handleOpenEmailModal,
        condition: ability.can('create', 'employee')
    });

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

    const handleDelete = (employee: IEmployee) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => removeEmployee(employee),
                confirmText: `Deactivate`,
                text: `Are you sure you want to deactivate ${employee.user.firstname} ${employee.user.lastname} ?`
            })
        );
    };

    const removeEmployee = async (employee: IEmployee) => {
        if (employee) {
            try {
                const res = await axiosServices.delete(`/employees/${employee.id}`);
                if (res) {
                    showSnackbar({
                        message: 'Employee deactivated',
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
                    message: "Error: Employee hasn't deleted",
                    alertSeverity: SnackBarTypes.Error
                });
            }
        }
    };

    const handleRestore = (employee: IEmployee) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => restoreEmployee(employee),
                confirmText: `Restore`,
                text: `Are you sure you want to restore ${employee.user.firstname} ${employee.user.lastname} ?`
            })
        );
    };

    const restoreEmployee = async (employee: IEmployee) => {
        if (employee) {
            try {
                const res = await axiosServices.patch(`/employees/${employee.id}/restore`);
                if (res) {
                    showSnackbar({
                        message: 'Employee restored',
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
                    message: "Error: Employee hasn't restored",
                    alertSeverity: SnackBarTypes.Error
                });
            }
        }
    };

    const moveTo = ({ path, id }: MoveToProps) => {
        navigate(`/${path}/${id}`);
    };

    return (
        <>
            <MainCard title={!isMobile ? 'Staff' : null} content={false}>
                {!isMobile && (
                    <CardContent>
                        <Grid container justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} spacing={2}>
                            <Grid item xs={10} alignItems="center" display="flex" flexWrap="wrap">
                                <Grid container justifyContent="flex-start" spacing={2} alignItems="center">
                                    <Grid item xs={isMobile ? 12 : 4}>
                                        <TextField
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon fontSize="small" />
                                                    </InputAdornment>
                                                )
                                            }}
                                            onChange={handleSearch}
                                            placeholder="Search employee"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={isMobile ? 12 : 3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel id="demo-simple-select-label">Role</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={role}
                                                label="Role"
                                                onChange={handleChangeRole}
                                            >
                                                {userRoles.map((item) => (
                                                    <MenuItem key={item} value={item}>
                                                        {startCase(toLower(item))}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={isMobile ? 12 : 3}>
                                        <SwitchWithLabel
                                            width={300}
                                            labelPlacement="left"
                                            isActive={trashed}
                                            toggleStatus={handleChangeStatus}
                                            title="Show archived staff"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Can I="create" an="employee">
                                <Grid item xs={2} sx={{ textAlign: 'right', pl: 0, flexBasis: 0 }}>
                                    <CreateButton
                                        user={user}
                                        maxCountReachedText={`You're on the ${planName} subscription plan. Please contact support to upgrade your plan to be able to add more staff`}
                                        tooltipText="Add staff"
                                        propertyName="employees"
                                        action={handleOpenEmailModal}
                                    />
                                </Grid>
                            </Can>
                        </Grid>
                    </CardContent>
                )}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {tableCells.map((cell) => (
                                    <TableCell key={cell.id} align="left" sx={{ pl: 3 }} padding="none">
                                        <TableSortLabel
                                            active={orderBy === cell.id}
                                            direction={orderBy === cell.id ? order : 'asc'}
                                            onClick={() => handleOrderBy(cell.id)}
                                        >
                                            {cell.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                                {!isMobile && (
                                    <>
                                        <TableCell align="left" sx={{ pl: 3 }}>
                                            Locations
                                        </TableCell>
                                        <TableCell align="left" sx={{ pl: 3 }}>
                                            Services
                                        </TableCell>
                                    </>
                                )}
                                {(ability.can('update', 'employee') || ability.can('delete', 'employee')) && (
                                    <TableCell align="left" sx={{ textAlign: 'center' }}>
                                        Actions
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!isLoading &&
                                user &&
                                filtered &&
                                filtered.map((row, index) => (
                                    <TableRow
                                        // hover
                                        key={index}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: user.id !== row.user.id ? theme.palette.grey['100'] : undefined
                                            },
                                            backgroundColor: user.id === row.user.id ? theme.palette.primary.light : undefined
                                        }}
                                    >
                                        <TableCell sx={{ pl: 3 }}>
                                            <Stack direction="row" alignItems="center">
                                                <UserAvatar employee={row} />
                                                <Stack sx={{ ml: 1 }}>
                                                    <EllipsisTypography
                                                        text={`${row?.user.firstname} ${row?.user.lastname}`}
                                                        ml={0}
                                                        onClick={
                                                            ability.can('update', 'employee')
                                                                ? () => navigate(`/employee/${row.id}`)
                                                                : undefined
                                                        }
                                                    />
                                                    {!isMobile && (
                                                        <Typography variant="subtitle2" align="left" component="div">
                                                            {row.user.email}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ pl: 3 }}>
                                            <Typography variant="subtitle1" align="left" component="div">
                                                {startCase(toLower(row.role))}
                                            </Typography>
                                        </TableCell>
                                        {!isMobile && (
                                            <>
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
                                                <TableCell sx={{ p: 2, pl: 3 }}>
                                                    {row.services && row.services.length > 0 && (
                                                        <GroupOfAvatars
                                                            data={getAvatarData({
                                                                data: row.services,
                                                                path: 'service',
                                                                moveTo,
                                                                isClickable: ability.can('update', 'service')
                                                            })}
                                                            isClickable={ability.can('update', 'service')}
                                                        />
                                                    )}
                                                </TableCell>
                                            </>
                                        )}
                                        {(ability.can('update', 'employee') || ability.can('delete', 'employee')) && (
                                            <TableCell align="left" sx={{ p: 0, pl: 1 }}>
                                                <Stack direction="row" justifyContent="center" alignItems="center">
                                                    <Can I="update" a="employee">
                                                        {isAllowEditEmployee(user, row) && (
                                                            <Tooltip placement="top" title="Edit employee">
                                                                <Link to={`/employee/${row.id}`}>
                                                                    <IconButton color="primary">
                                                                        <EditTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                                                                    </IconButton>
                                                                </Link>
                                                            </Tooltip>
                                                        )}
                                                    </Can>
                                                    <Can I="delete" a="employee">
                                                        {/* check this */}
                                                        {row.deleted_at ? (
                                                            <Tooltip placement="top" title="Restore Employee">
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
                                                            isAllowDeleteEmployee(user, row) && (
                                                                <Tooltip placement="top" title="Deactivate Employee">
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
                                                            )
                                                        )}
                                                    </Can>
                                                </Stack>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {!isLoading && data && data.data.length === 0 && (
                    <CardContent>
                        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                            <Grid item xs={12}>
                                No {trashed ? 'inactive' : 'active'} employees
                            </Grid>
                        </Grid>
                    </CardContent>
                )}
                <AppPagePagination
                    page={page}
                    data={data}
                    handleClick={handleClick}
                    perPage={perPage}
                    anchorEl={anchorEl}
                    handleClose={handleClose}
                    setPage={setPage}
                    additionalContent={
                        isMobile ? (
                            <SwitchWithLabel
                                width={110}
                                labelPlacement="left"
                                isActive={trashed}
                                toggleStatus={handleChangeStatus}
                                title="Archived"
                            />
                        ) : undefined
                    }
                />
            </MainCard>
            <InviteForm open={emailModal} onClose={handleCloseEmailModal} />
        </>
    );
};

export default EmployeeList;
