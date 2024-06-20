import { Moment } from 'moment-timezone';
import MomentAdapter from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { Stack, TextField } from '@mui/material';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import { DateTimeStepProps } from './types';
import Transitions from '../../../ui-component/extended/Transitions';
import { useMediaQuery } from '@material-ui/core';
import AppTimePicker from '../../../ui-component/form/time-picker/AppTimePicker';

const DateTimeStep = ({ locationData, currentLocation, dateData, setDateData, matchSm }: DateTimeStepProps) => {
    const isMobile = useMediaQuery('(max-width:420px)');

    // useEffect(() => {
    //     if (locationData) {
    //         moment.tz.setDefault(locationData.time_zone);
    //     } else {
    //         moment.tz.setDefault(currentLocation.time_zone);
    //     }
    // }, [locationData, currentLocation]);

    // const locationTZ = useMemo(() => locationData?.time_zone || currentLocation.time_zone, [locationData, currentLocation]);

    return (
        <>
            <Transitions type="fade" in>
                <Stack direction={isMobile ? 'column' : 'row'} spacing={3} key={locationData?.id}>
                    <LocalizationProvider dateAdapter={MomentAdapter}>
                        <MobileDatePicker<Moment>
                            views={['day']}
                            mask="MM/DD/YYYY"
                            showTodayButton
                            disableHighlightToday
                            showToolbar={false}
                            value={dateData}
                            onChange={(dateArg) => {
                                if (dateArg) {
                                    const newDate = dateData.clone().set({
                                        year: dateArg.get('year'),
                                        date: dateArg.get('date'),
                                        month: dateArg.get('month')
                                    });
                                    setDateData(newDate);
                                }
                            }}
                            renderInput={(params) => <TextField {...params} label="Date" sx={{ width: '140px' }} />}
                        />
                    </LocalizationProvider>
                    <AppTimePicker
                        outerValue={dateData}
                        onTimeSet={(pickerTime) => {
                            const newDate = dateData.clone().set({ hour: pickerTime.get('hour'), minute: pickerTime.get('minutes') });
                            setDateData(newDate);
                        }}
                        variant="outlined"
                        sx={{ width: '140px' }}
                        listMaxHeight="160px"
                    />
                </Stack>
            </Transitions>
        </>
    );
};

export default DateTimeStep;
