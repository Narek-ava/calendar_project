import React, { useContext, useCallback, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@material-ui/core/styles';
import {
    Avatar,
    Button,
    CardContent,
    CircularProgress,
    Fab,
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

// project imports
import MainCard from 'ui-component/cards/MainCard';

// casl - roles
import Can, { AbilityContext } from '../../utils/roles/Can';

// assets
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
// import CloseIcon from '@material-ui/icons/Close';

import companyAPI from '../../services/CompanyService';
import { Link, useNavigate } from 'react-router-dom';
import { ICompany } from '../../models/ICompany';
import { SNACKBAR_OPEN } from '../../store/actions';
import { useAppDispatch } from '../../hooks/redux';
import { ArrangementOrder } from '../../types';
import { throttle } from 'lodash';
// import { Box, Modal } from '@mui/material';
// import modalStyle from 'themes/modalStyle';
import useAuth from 'hooks/useAuth';
import { IconMap2 } from '@tabler/icons';
import locationAPI from '../../services/LocationService';
import serviceAPI from '../../services/ServiceService';
import employeeAPI from '../../services/EmployeeService';
import AppPagePagination from '../../ui-component/PagePagination';
import { openConfirmPopup } from '../../store/confirmPopupSlice';
import { useMediaQuery } from '@mui/material';
import AssignmentIndOutlined from '@material-ui/icons/AssignmentIndOutlined';
import WorkOutline from '@material-ui/icons/WorkOutline';
import { stringToColor } from 'store/constant';
import EllipsisTypography from '../../ui-component/optimized-text-fields/EllipsisTypography';
import { replaceMinioToLocalhost } from '../../utils/functions/uploading-images-helpers';

const CompanyList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { user, changeCompanyContext } = useAuth(); // inform

    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [search, setSearch] = useState<string | null>(null);
    // const [open, setOpen] = useState(false);
    const [order, setOrder] = React.useState<ArrangementOrder>('asc');
    const [orderBy, setOrderBy] = React.useState<string>('name');
    const { data, isLoading } = companyAPI.useFetchAllCompaniesQuery({
        per_page: perPage,
        page,
        search,
        sort: orderBy,
        order
    });

    const isMobile = useMediaQuery('(max-width:600px)');
    // Role abilities
    const ability = useContext(AbilityContext);

    const [deleteCompany] = companyAPI.useDeleteCompanyMutation();
    const [anchorEl, setAnchorEl] = React.useState<Element | ((element: Element) => Element) | null | undefined>(null);
    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
    };

    const throttled = useRef(
        throttle((newValue) => {
            setSearch(newValue);
        }, 1000)
    );

    const tableCells = [
        { id: 'name', label: 'Name' }
        // { id: 'locations', label: 'Locations' }
        // { id: 'email', label: 'Email' },
        // { id: 'site', label: 'Site' }
    ];

    const handleOrderBy = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | undefined) => {
        const newString = event?.target.value;
        throttled.current(newString || null);
    };

    const handleDelete = (company: ICompany) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => removeCompany(company),
                confirmText: `Delete`,
                text: `Are you sure you want to delete ${company.name} ?`
            })
        );
    };

    const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);

    const removeCompany = (company: ICompany) => {
        deleteCompany(company)
            .unwrap()
            .then(() => {
                // handleCloseModal();
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: 'Organization deleted',
                    variant: 'alert',
                    alertSeverity: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            })
            .catch(() => {
                // handleCloseModal();
                dispatch({
                    type: SNACKBAR_OPEN,
                    open: true,
                    message: "Error: Organization hasn't deleted",
                    variant: 'alert',
                    alertSeverity: 'error',
                    anchorOrigin: { vertical: 'top', horizontal: 'center' }
                });
            });
    };

    const handleClose = (limit?: number) => {
        if (limit) {
            setPerPage(limit);
            setPage(1);
        }
        setAnchorEl(null);
    };

    const handleChangeCompany = async (companyId: number | undefined) => {
        if (companyId !== undefined) {
            await changeCompanyContext(companyId);
            navigate(0);
        }
    };

    const goToRouteLink = async (companyId: number, route: string) => {
        if (user?.currentCompany.id !== companyId) {
            await changeCompanyContext(companyId);
            navigate(`/${route}`);
            switch (route) {
                case 'location':
                    dispatch(locationAPI.util.invalidateTags(['Location']));
                    break;
                case 'service':
                    dispatch(serviceAPI.util.invalidateTags(['Service']));
                    break;
                case 'employee':
                    dispatch(employeeAPI.util.invalidateTags(['Employee']));
                    break;
            }
        } else {
            navigate(`/${route}`);
        }
    };

    return (
        <>
            <MainCard title="Organizations" content={false}>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                        <Grid item xs={isMobile ? 10 : 4}>
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
                                placeholder="Search organization"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: 'right', pl: 0, flexBasis: 0 }}>
                            {/*
                             <Tooltip title="Copy">
                                <IconButton>
                                    <FileCopyIcon />
                                </IconButton>
                             </Tooltip>
                             <Tooltip title="Print">
                                <IconButton>
                                    <PrintIcon />
                                </IconButton>
                             </Tooltip>
                             <Tooltip title="Filter">
                                <IconButton>
                                    <FilterListIcon />
                                </IconButton>
                             </Tooltip>

                             product add & dialog
                            */}
                            <Can I="create" a="company">
                                <Tooltip title="Add organization">
                                    <Link to="/organization/create">
                                        <Fab
                                            color="secondary"
                                            size="small"
                                            sx={{ boxShadow: 'none', ml: 1, width: '32px', height: '32px', minHeight: '32px' }}
                                        >
                                            <AddIcon fontSize="small" />
                                        </Fab>
                                    </Link>
                                </Tooltip>
                            </Can>
                        </Grid>
                    </Grid>
                </CardContent>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {/* <TableCell sx={{ pl: 3 }}>#</TableCell> */}
                                {tableCells.map((cell) => (
                                    <TableCell key={cell.id} align="left" sx={{ pl: 3 }}>
                                        <TableSortLabel
                                            active={orderBy === cell.id}
                                            direction={orderBy === cell.id ? order : 'asc'}
                                            onClick={() => handleOrderBy(cell.id)}
                                        >
                                            {cell.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                                <TableCell align="right" />
                                {(ability.can('update', 'company') || ability.can('delete', 'company')) && (
                                    <TableCell align="left" sx={{ textAlign: 'center' }}>
                                        Actions
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ p: 0 }}>
                            {!isLoading &&
                                data &&
                                data.data.map((row: ICompany) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: user?.currentCompany.id !== row.id ? theme.palette.grey['100'] : undefined
                                            },
                                            backgroundColor: user?.currentCompany.id === row.id ? theme.palette.primary.light : undefined
                                        }}
                                    >
                                        {/* <TableCell sx={{ pl: 3 }}>{row.id}</TableCell> */}
                                        <TableCell
                                            sx={{
                                                pl: 3,
                                                maxWidth: '300px',
                                                overflowX: 'auto',
                                                // color: user?.context_company.id === row.id ? theme.palette.primary.main : undefined,
                                                cursor: user?.currentCompany.id !== row.id ? 'pointer' : 'default'
                                                // '&:hover': {
                                                //     color:
                                                //         user?.context_company.id !== row.id || !row.deleted_at
                                                //             ? theme.palette.primary.main
                                                //             : undefined
                                                // }
                                            }}
                                            onClick={user?.currentCompany.id !== row.id ? () => handleChangeCompany(row.id) : undefined}
                                        >
                                            <Stack direction="row" alignItems="center">
                                                <Avatar
                                                    variant="rounded"
                                                    // color="#fff"
                                                    src={getLogo(row.logo)}
                                                    sx={{
                                                        color: '#fff',
                                                        bgcolor: stringToColor(row?.name),
                                                        width: 40,
                                                        height: 40
                                                    }}
                                                >
                                                    <Typography fontSize="large">{row?.name.charAt(0).toUpperCase()}</Typography>
                                                </Avatar>
                                                <EllipsisTypography text={row.name} ml={2} bold={user?.currentCompany.id === row.id} />
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ pl: 3 }} align="right">
                                            <Stack display="inline-flex" direction="row" alignItems="center" spacing={0}>
                                                <Tooltip title="to Widget" placement="top" arrow>
                                                    <Button
                                                        component={Link}
                                                        to={`/cal/${row.slug}`}
                                                        target="_blank"
                                                        sx={{
                                                            color: theme.palette.text.primary,
                                                            '&: hover': {
                                                                color: theme.palette.primary.main
                                                            },
                                                            // p: 0,
                                                            minWidth: '50px'
                                                        }}
                                                    >
                                                        Widget
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="to Locations" placement="top" arrow>
                                                    <Button
                                                        sx={{
                                                            color: theme.palette.text.primary,
                                                            '&: hover': {
                                                                color: theme.palette.primary.main
                                                            },
                                                            // p: 0,
                                                            minWidth: '50px'
                                                        }}
                                                        onClick={() => goToRouteLink(row.id, 'location')}
                                                        variant="text"
                                                        startIcon={<IconMap2 size="20px" />}
                                                    >
                                                        {row.locations_count}
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="to Staff" placement="top" arrow>
                                                    <Button
                                                        sx={{
                                                            color: theme.palette.text.primary,
                                                            '&: hover': {
                                                                color: theme.palette.primary.main
                                                            },
                                                            // p: 0,
                                                            minWidth: '50px'
                                                        }}
                                                        onClick={() => goToRouteLink(row.id, 'employee')}
                                                        variant="text"
                                                        startIcon={<AssignmentIndOutlined />}
                                                    >
                                                        {row.employees_count}
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="to Services" placement="top" arrow>
                                                    <Button
                                                        sx={{
                                                            color: theme.palette.text.primary,
                                                            '&: hover': {
                                                                color: theme.palette.primary.main
                                                            },
                                                            // p: 0,
                                                            minWidth: '50px'
                                                        }}
                                                        onClick={() => goToRouteLink(row.id, 'service')}
                                                        variant="text"
                                                        startIcon={<WorkOutline />}
                                                    >
                                                        {row.services_count}
                                                    </Button>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                        {/*
                                        <TableCell sx={{ pl: 3 }}>
                                            <Typography variant="subtitle1" align="left" component="div">
                                                {row.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ pl: 3 }}>
                                            <Typography variant="subtitle1" align="left" component="div">
                                                {row.site}
                                            </Typography>
                                        </TableCell>
                                        */}
                                        {(ability.can('update', 'company') || ability.can('delete', 'company')) && (
                                            <TableCell align="left" sx={{ p: 0, pl: 1 }}>
                                                <Stack direction="row" justifyContent="center" alignItems="center">
                                                    <Can I="update" a="company">
                                                        <Tooltip placement="top" title="Edit organization">
                                                            <Link to={`/organization/${row.id}`}>
                                                                <IconButton color="primary">
                                                                    <EditTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                                                                </IconButton>
                                                            </Link>
                                                        </Tooltip>
                                                    </Can>
                                                    <Can I="delete" a="company">
                                                        {user?.currentCompany.id !== row.id && (
                                                            <Tooltip placement="top" title="Delete organization">
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
                <AppPagePagination
                    page={page}
                    data={data}
                    handleClick={handleClick}
                    perPage={perPage}
                    anchorEl={anchorEl}
                    handleClose={handleClose}
                    setPage={setPage}
                />
            </MainCard>
        </>
    );
};

export default CompanyList;
