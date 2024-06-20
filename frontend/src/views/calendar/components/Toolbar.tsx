import moment from 'moment';
import { IconCalendarPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons';
import { UserRole } from 'models/IEmployee';
// material-ui
import { IconButton, Button, ButtonGroup, Stack, Theme, Tooltip, useMediaQuery } from '@material-ui/core';

// assets
import { useTheme } from '@mui/material/styles';
import { CalendarModeValues, ToolbarProps, ViewOption } from '../types';
import FilterImage from '../../../assets/images/icons/filter.svg';

// ==============================|| CALENDAR TOOLBAR ||============================== //

const Toolbar = ({
    staff,
    isMobile,
    matchSm,
    locations,
    services,
    date,
    onClickToday,
    onClickNext,
    onClickPrev,
    view,
    viewOptions,
    onChangeView,
    togglePicker,
    onClickNew,
    openFilters,
    userRole
}: ToolbarProps) => {
    const matchLg = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('lg'));
    const theme = useTheme();

    const handleChangeView = (viewOption: ViewOption) => {
        onChangeView(viewOption);
    };

    return (
        <Stack sx={{ padding: matchSm ? theme.spacing(2) : 0 }}>
            {matchLg && (
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 0, sm: 2 } }}>
                    {!isMobile && (
                        <ButtonGroup variant="outlined" aria-label="outlined button group">
                            {Object.values(viewOptions).map((viewOption) => {
                                const Icon = viewOption.icon;
                                if (viewOption.value === CalendarModeValues.ResourceDay && staff.length === 0) {
                                    return undefined;
                                }
                                if (viewOption.value === CalendarModeValues.Day && staff.length > 0) {
                                    return undefined;
                                }
                                return (
                                    <Tooltip
                                        title={
                                            viewOption.value === CalendarModeValues.Day ||
                                            viewOption.value === CalendarModeValues.ResourceDay
                                                ? 'Day'
                                                : viewOption.label
                                        }
                                        key={viewOption.value}
                                    >
                                        <Button
                                            disableElevation
                                            variant={viewOption.value === view ? 'contained' : 'outlined'}
                                            onClick={() => handleChangeView(viewOption)}
                                        >
                                            <Icon stroke="2" size="1.3rem" />
                                        </Button>
                                    </Tooltip>
                                );
                            })}
                        </ButtonGroup>
                    )}
                    {isMobile && (
                        <>
                            <Button variant="contained" disabled={moment(date).isSame(moment(), 'day')} onClick={onClickToday}>
                                Today
                            </Button>
                            <Stack direction="row" alignItems="center" spacing={0}>
                                <IconButton onClick={onClickPrev} sx={{ p: 0 }}>
                                    <IconChevronLeft />
                                </IconButton>
                                <Button onClick={togglePicker} size="large">
                                    {moment(date).format('ddd, MMM DD')}
                                </Button>
                                <IconButton onClick={onClickNext} sx={{ p: 0 }}>
                                    <IconChevronRight />
                                </IconButton>
                            </Stack>
                        </>
                    )}
                    <IconButton onClick={openFilters} color="primary">
                        <img src={FilterImage} width={30} />
                    </IconButton>
                    {!matchSm && services.length > 0 && locations.length > 0 && userRole !== UserRole.ReadOnlyLimited && (
                        <Button
                            onClick={onClickNew}
                            variant="contained"
                            startIcon={<IconCalendarPlus />}
                            color="secondary"
                            // sx={{ ml: 'auto' }}
                        >
                            {/* remove text if isMobile */}
                            {matchSm ? 'New' : 'New Appointment'}
                        </Button>
                    )}
                </Stack>
            )}
        </Stack>
    );
};

export default Toolbar;
