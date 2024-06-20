import React, { useContext, useRef, useState } from 'react';
import { throttle } from 'lodash';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';

// casl - roles
import Can, { AbilityContext } from '../../utils/roles/Can';

// material-ui
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
    Tooltip
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import MainCard from 'ui-component/cards/MainCard';
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import { useMediaQuery } from '@mui/material';
import { IconTrashOff } from '@tabler/icons';

// project imports
import locationAPI from '../../services/LocationService';
import { ILocation } from 'models/ILocation';
import { SNACKBAR_OPEN } from 'store/actions';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { ArrangementOrder } from '../../types';
import AppPagePagination from '../../ui-component/PagePagination';
import { openConfirmPopup } from '../../store/confirmPopupSlice';
import { axiosServices } from '../../utils/axios';
import { SnackBarTypes } from '../../store/snackbarReducer';
import EllipsisTypography from '../../ui-component/optimized-text-fields/EllipsisTypography';
import GroupOfAvatars, { MoveToProps } from '../../ui-component/GroupOfAvatars';
import { getAvatarData } from '../../ui-component/AvatarData';
import { isAllowEditLocation } from '../../utils/roles/functions';
import useAuth from '../../hooks/useAuth';
import employeeAPI from '../../services/EmployeeService';
import serviceAPI from '../../services/ServiceService';
import CreateButton from '../../ui-component/CreateButton';
import SwitchWithLabel from '../../ui-component/SwitchWithLabel';
import moment from 'moment/moment';
import useMobileCreateButton from '../../hooks/useMobileCreateButton';
import usePlanName from '../../hooks/usePlanName';

const LocationList: React.FC = () => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const { deactivated } = useAppSelector((state) => state.deactivationToggle);
    const isMobile = useMediaQuery('(max-width:600px)');
    const ability = useContext(AbilityContext);
    const planName = usePlanName();

    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [search, setSearch] = useState<string | null>(null);
    const [order, setOrder] = useState<ArrangementOrder>('asc');
    const [orderBy, setOrderBy] = useState<string>('name');
    const [trashed, setTrashed] = useState(deactivated);
    const [anchorEl, setAnchorEl] = React.useState<Element | ((element: Element) => Element) | null | undefined>(null);

    const { data, isLoading } = locationAPI.useFetchAllLocationsQuery({
        per_page: perPage,
        page,
        search,
        sort: orderBy,
        order,
        ...(trashed && { trashed: 'true' })
    });

    useMobileCreateButton({
        action: () => navigate('/location/create'),
        condition: ability.can('create', 'location')
    });

    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
    };

    const handleChangeStatus = () => {
        setTrashed(!trashed);
        setPage(1);
    };

    const throttled = useRef(
        throttle((newValue) => {
            setSearch(newValue);
        }, 1000)
    );

    const tableCells = [{ id: 'name', label: isMobile ? 'Location Name' : 'Name' }];

    const handleOrderBy = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | undefined) => {
        const newString = event?.target.value;
        throttled.current(newString?.toLowerCase());
    };

    const handleClose = (limit?: number) => {
        if (limit) {
            setPerPage(limit);
            setPage(1);
        }
        setAnchorEl(null);
    };

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

    const handleDelete = (location: ILocation) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => removeLocation(location),
                confirmText: `Deactivate`,
                text: `Are you sure you want to deactivate ${location.name} ?`
            })
        );
    };

    const removeLocation = async (location: ILocation) => {
        if (location) {
            try {
                const res = await axiosServices.delete(`/locations/${location.id}`);
                if (res) {
                    showSnackbar({
                        message: 'Location deactivated',
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
                    message: "Error: Location hasn't deactivated",
                    alertSeverity: SnackBarTypes.Error
                });
            }
        }
    };

    const handleRestore = (location: ILocation) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => restoreLocation(location),
                confirmText: `Restore`,
                text: `Are you sure you want to restore ${location.name} ?`
            })
        );
    };

    const restoreLocation = async (location: ILocation) => {
        if (location) {
            try {
                const res = await axiosServices.patch(`/locations/${location.id}/restore`);
                if (res) {
                    showSnackbar({
                        message: 'Location restored',
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
                    message: "Error: Location hasn't restored",
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
            <MainCard title={!isMobile ? 'Locations' : null} content={false}>
                {!isMobile && (
                    <CardContent>
                        <Grid container justifyContent="space-between" alignItems="start" spacing={2}>
                            <Grid item xs={10} alignItems="center" display="flex" flexWrap="wrap">
                                <Grid container justifyContent="flex-start" spacing={2} alignItems="center">
                                    <Grid item xs={4}>
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
                                            placeholder="Search location"
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <SwitchWithLabel
                                            width={300}
                                            labelPlacement="left"
                                            isActive={trashed}
                                            toggleStatus={handleChangeStatus}
                                            title="Show archived locations"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Can I="create" a="location">
                                <Grid item xs={2} sx={{ textAlign: 'right', pl: 0, flexBasis: 0, marginTop: 1 / 2 }}>
                                    <CreateButton
                                        user={user}
                                        maxCountReachedText={`You're on the ${planName} subscription plan. Please contact support to upgrade your plan to be able to add more locations`}
                                        tooltipText="Add location"
                                        propertyName="locations"
                                        action="/location/create"
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
                                {/* <TableCell sx={{ pl: 3 }}>#</TableCell> */}
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
                                        <TableCell align="left" sx={{ pl: 3, width: '200px' }}>
                                            Providers
                                        </TableCell>
                                        <TableCell align="left" sx={{ pl: 3, width: '200px' }}>
                                            Services
                                        </TableCell>
                                    </>
                                )}
                                {(ability.can('update', 'location') || ability.can('delete', 'location')) && (
                                    <TableCell align="left" sx={{ textAlign: 'center', width: '100px' }}>
                                        Actions
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!isLoading &&
                                user &&
                                data &&
                                data.data.map((row: ILocation) => (
                                    <TableRow hover key={row.id}>
                                        <TableCell id={row.name}>
                                            <EllipsisTypography
                                                text={`${row.name} (${moment.tz(row.time_zone).format('z')})`}
                                                onClick={
                                                    ability.can('update', 'location') ? () => navigate(`/location/${row.id}`) : undefined
                                                }
                                            />
                                        </TableCell>
                                        {!isMobile && (
                                            <>
                                                <TableCell align="left" sx={{ pl: 3 }}>
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
                                                <TableCell sx={{ pl: 3 }}>
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
                                        {(ability.can('update', 'location') || ability.can('delete', 'location')) && (
                                            <TableCell align="left" sx={{ p: 0, pl: 1 }}>
                                                <Stack direction="row" justifyContent="center" alignItems="center">
                                                    <Can I="update" a="location">
                                                        {isAllowEditLocation(user, row) && (
                                                            <Tooltip placement="top" title="Edit location">
                                                                <Link to={`/location/${row.id}`}>
                                                                    <IconButton color="primary">
                                                                        <EditTwoToneIcon
                                                                            sx={{ fontSize: '1.3rem' }}
                                                                            id={`${row.name}-settings`}
                                                                        />
                                                                    </IconButton>
                                                                </Link>
                                                            </Tooltip>
                                                        )}
                                                    </Can>
                                                    <Can I="delete" a="location">
                                                        {row.deleted_at ? (
                                                            <Tooltip placement="top" title="Restore Location">
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
                                                            <Tooltip placement="top" title="Deactivate Location">
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
                                No {trashed ? 'inactive' : 'active'} locations
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
        </>
    );
};

export default LocationList;
