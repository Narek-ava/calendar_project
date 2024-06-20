import React, { ReactNode, useContext, useEffect, useRef, useState, Fragment, useCallback } from 'react';
import { throttle } from 'lodash';
import { SortableContainer } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';

// casl - roles
import { AbilityContext } from '../../utils/roles/Can';
// mui

import {
    CardContent,
    CircularProgress,
    Grid,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';
import SearchIcon from '@material-ui/icons/Search';
import { Typography, useMediaQuery } from '@mui/material';

// project imports
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { IService, IServiceOrder } from 'models/IService';
import serviceAPI from 'services/ServiceService';
import AppPagePagination from '../../ui-component/PagePagination';
import appointmentWidgetAPI from '../../services/WidgetService';
import ServiceRow from './ServiceRow';
import SwitchWithLabel from '../../ui-component/SwitchWithLabel';
import CreateServiceButton from '../../ui-component/CreateServiceButton';
import InfoTooltip from '../../ui-component/InfoTooltip';
import { useNavigate } from 'react-router';
import useMobileCreateButton from '../../hooks/useMobileCreateButton';

// makes MUI TableBody sortable
const TableBodySortable = SortableContainer(({ children }: { children: ReactNode }) => <TableBody>{children}</TableBody>);

// Строка необходима для того чтобы наш кастомный боди воспринимался как TableBody и в этом случае ошибки не будет
// TableBodySortable.name = 'TableBody';

const ServiceList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');
    const ability = useContext(AbilityContext);
    const { deactivated } = useAppSelector((state) => state.deactivationToggle);

    const [search, setSearch] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [trashed, setTrashed] = useState(deactivated);
    const [services, setServices] = useState<IService[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [updateSortingOrders] = serviceAPI.useUpdateSortingOrdersMutation();
    const [anchorEl, setAnchorEl] = React.useState<Element | ((element: Element) => Element) | null | undefined>(null);

    useMobileCreateButton({
        action: () => navigate('/service/create'),
        condition: ability.can('create', 'service')
    });

    const { data, isLoading } = serviceAPI.useFetchAllServicesQuery({
        per_page: perPage,
        page,
        search,
        ...(trashed && { trashed: 'true' })
    });

    const handleClick = (event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
    };

    useEffect(() => {
        if (!isLoading && data) {
            setServices(data.data);
        }
    }, [isLoading, data]);

    const onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        const newServices = arrayMoveImmutable(services, oldIndex, newIndex);
        if (data) {
            const sortPayload: IServiceOrder[] = newServices.map((elem, index) => ({
                id: elem.id,
                sorting_order: data.meta.from - 1 + index
            }));
            setServices(newServices);
            updateSortingOrders({ ordering: sortPayload });
            dispatch(appointmentWidgetAPI.util.invalidateTags(['AppointmentWidget']));
            setIsDragging(false);
        }
    };

    const handleChangeStatus = useCallback(() => {
        setTrashed(!trashed);
        setPage(1);
    }, [trashed]);

    const throttled = useRef(
        throttle((newValue) => {
            setSearch(newValue);
        }, 1000)
    );

    const tableCells = [{ id: 'name', label: isMobile ? 'Service Name' : 'Name' }];

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

    const onSortStart = ({ node, helper }: any) => {
        setIsDragging(true);

        node.childNodes.forEach((td: HTMLTableDataCellElement, index: number) => {
            helper.childNodes[index].style.width = `${td.offsetWidth}px`;
        });
    };

    return (
        <>
            <MainCard
                title={
                    !isMobile ? (
                        <Typography sx={{ fontSize: '18px' }} display="flex" alignItems="center">
                            Services
                            <InfoTooltip text="Drag and drop to set the order of services in booking widget." />
                        </Typography>
                    ) : null
                }
                content={false}
            >
                {!isMobile && (
                    <CardContent>
                        <Grid container justifyContent="space-between" alignItems="start" spacing={2}>
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
                                            placeholder="Search service"
                                            size="small"
                                        />
                                    </Grid>

                                    <Grid item xs={isMobile ? 12 : 3}>
                                        <SwitchWithLabel
                                            width={300}
                                            labelPlacement="left"
                                            isActive={trashed}
                                            toggleStatus={handleChangeStatus}
                                            title="Show archived services"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'right', pl: 0, flexBasis: 0, marginTop: 1 / 2 }}>
                                <CreateServiceButton />
                            </Grid>
                        </Grid>
                    </CardContent>
                )}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {!isMobile && <TableCell align="left" sx={{ pl: 3 }} />}
                                {tableCells.map((cell) => (
                                    <TableCell key={cell.id} align="left" sx={{ pl: 3 }} padding="none">
                                        {cell.label}
                                    </TableCell>
                                ))}
                                {!isMobile && (
                                    <>
                                        <TableCell align="left" sx={{ pl: 3 }}>
                                            Providers
                                        </TableCell>
                                        <TableCell align="left" sx={{ pl: 3 }}>
                                            Locations
                                        </TableCell>
                                    </>
                                )}
                                {(ability.can('update', 'service') || ability.can('delete', 'service')) && (
                                    <TableCell align="right" sx={{ pr: 4 }}>
                                        Actions
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBodySortable
                            onSortEnd={onSortEnd}
                            useDragHandle
                            lockAxis="y"
                            lockToContainerEdges
                            helperClass="sortableRow"
                            onSortStart={onSortStart}
                        >
                            {!isLoading &&
                                services.map((row: IService, index) => (
                                    <Fragment key={row.id}>
                                        <ServiceRow row={row} index={index} isDragging={isDragging} />
                                    </Fragment>
                                ))}
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBodySortable>
                    </Table>
                </TableContainer>
                {!isLoading && data && data.data.length === 0 && (
                    <CardContent>
                        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                            <Grid item xs={12}>
                                No {trashed ? 'inactive' : 'active'} services
                            </Grid>
                        </Grid>
                    </CardContent>
                )}
                <AppPagePagination
                    data={data}
                    handleClick={handleClick}
                    perPage={perPage}
                    anchorEl={anchorEl}
                    handleClose={handleClose}
                    page={page}
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

export default ServiceList;
