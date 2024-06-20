import React, { useContext, useRef, useState, useCallback, useMemo } from 'react';
import Can, { AbilityContext } from '../../utils/roles/Can';

import { useTheme } from '@material-ui/core/styles';
import {
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
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import { throttle } from 'lodash';
import { SNACKBAR_OPEN } from 'store/actions';
import { useAppDispatch } from 'hooks/redux';
import { ICustomer } from 'models/ICustomer';
import customerAPI from 'services/CustomerService';
import { ArrangementOrder } from '../../types';
import AppPagePagination from '../../ui-component/PagePagination';
import { openConfirmPopup } from '../../store/confirmPopupSlice';
import { useMediaQuery } from '@mui/material';
import Visibility from '@material-ui/icons/Visibility';
import EllipsisTypography from '../../ui-component/optimized-text-fields/EllipsisTypography';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { axiosServices } from '../../utils/axios';
import FormattedPhoneNumber from '../../ui-component/FormattedPhoneNumber';
import CustomerInfoModal from './customer-info/CustomerInfoModal';
import { useNavigate } from 'react-router';
import useMobileCreateButton from '../../hooks/useMobileCreateButton';

const CustomerList: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [search, setSearch] = useState<string | null>(null);
    const [order, setOrder] = useState<ArrangementOrder>('asc');
    const [orderBy, setOrderBy] = useState<string>('firstname');
    const [infoCustomerId, setInfoCustomerId] = useState<number | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<Element | ((element: Element) => Element) | null | undefined>(null);

    const closeCustomerInfoDialog = useCallback(() => {
        setInfoCustomerId(null);
    }, [setInfoCustomerId]);

    const isMobile = useMediaQuery('(max-width:600px)');
    const ability = useContext(AbilityContext);
    const navigate = useNavigate();

    useMobileCreateButton({
        action: () => navigate('/customer/create'),
        condition: ability.can('create', 'customer')
    });

    const { data, isLoading } = customerAPI.useFetchAllCustomersQuery({
        per_page: perPage,
        page,
        search,
        sort: orderBy,
        order
    });

    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
    };

    const throttled = useRef(
        throttle((newValue) => {
            setSearch(newValue);
        }, 1000)
    );

    const tableCells = useMemo(() => {
        const cells = [
            { id: 'firstname', label: 'Name' },
            { id: 'email', label: 'Email' }
        ];

        if (isMobile) return cells;

        return [...cells, { id: 'phone', label: 'Phone' }];
    }, [isMobile]);

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

    const handleDelete = (customer: ICustomer) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => removeCustomer(customer),
                confirmText: `Delete`,
                text: `Are you sure you want to delete ${customer.firstname} ${customer.lastname} ?`
            })
        );
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

    const removeCustomer = async (customer: ICustomer) => {
        if (customer) {
            try {
                const res = await axiosServices.delete(`/customers/${customer.id}`);
                if (res) {
                    showSnackbar({
                        message: 'Customer deleted',
                        alertSeverity: SnackBarTypes.Success
                    });
                    dispatch(customerAPI.util.invalidateTags(['Customer']));
                }
            } catch (e) {
                dispatch(
                    openConfirmPopup({
                        text: e.message
                    })
                );
                showSnackbar({
                    message: "Error: Customer hasn't deleted",
                    alertSeverity: SnackBarTypes.Error
                });
            }
        }
    };

    return (
        <>
            <CardContent>
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={4} alignItems="center">
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
                            placeholder="Search customer"
                            size="small"
                        />
                    </Grid>
                    {!isMobile && (
                        <Can I="create" a="customer">
                            <Grid item xs={2} sx={{ textAlign: 'right', pl: 0, flexBasis: 0 }}>
                                <Tooltip title="Add customer">
                                    <Link to="/customer/create">
                                        <Fab
                                            color="secondary"
                                            size="small"
                                            sx={{
                                                boxShadow: 'none',
                                                ml: 1,
                                                width: '32px',
                                                height: '32px',
                                                minHeight: '32px'
                                            }}
                                        >
                                            <AddIcon fontSize="small" />
                                        </Fab>
                                    </Link>
                                </Tooltip>
                            </Grid>
                        </Can>
                    )}
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
                            {!isMobile && (ability.can('update', 'customer') || ability.can('delete', 'customer')) && (
                                <TableCell align="left" sx={{ textAlign: 'center' }}>
                                    Actions
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!isLoading &&
                            data &&
                            data.data.map((row, index) => (
                                <TableRow hover key={index} id={`${row.firstname} ${row.lastname}-row`}>
                                    {/* <TableCell sx={{ pl: 3 }}>{row.id}</TableCell> */}
                                    <TableCell>
                                        <EllipsisTypography
                                            text={`${row.firstname} ${row.lastname}`}
                                            onClick={ability.can('update', 'customer') ? () => navigate(`/customer/${row.id}`) : undefined}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ pl: 3 }}>
                                        <Typography variant="subtitle1" align="left" component="div">
                                            {row.email}
                                        </Typography>
                                    </TableCell>
                                    {!isMobile && (
                                        <>
                                            <TableCell sx={{ pl: 3 }}>
                                                {row.phone && (
                                                    <>
                                                        <FormattedPhoneNumber phone={row.phone} />
                                                        <Typography variant="subtitle1" align="left" component="div">
                                                            {}
                                                        </Typography>
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell align="right" sx={{ p: 0, pl: 1 }}>
                                                <Stack direction="row" justifyContent="center" alignItems="center">
                                                    <Can I="view" a="customer">
                                                        <Tooltip placement="top" title="View customer">
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => {
                                                                    setInfoCustomerId(row.id);
                                                                }}
                                                            >
                                                                <Visibility />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Can>
                                                    <Can I="update" a="customer">
                                                        {!row.deleted_at && (
                                                            <Tooltip placement="top" title="Edit customer">
                                                                <Link to={`/customer/${row.id}`}>
                                                                    <IconButton color="primary">
                                                                        <EditTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                                                                    </IconButton>
                                                                </Link>
                                                            </Tooltip>
                                                        )}
                                                    </Can>
                                                    <Can I="delete" a="customer">
                                                        {!row.deleted_at && (
                                                            <Tooltip placement="top" title="Delete customer">
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
                                        </>
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
            {infoCustomerId && <CustomerInfoModal customerId={infoCustomerId.toString()} onClose={closeCustomerInfoDialog} />}
        </>
    );
};

export default CustomerList;
