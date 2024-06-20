import { Grid, Typography } from '@material-ui/core';
import StyledTimeSlotButton from './StyledTimeSlotButton';
import moment from 'moment/moment';
import { useMemo } from 'react';
import { TimeSlot } from '../widget-wizard/types';
import { styled } from '@material-ui/core/styles';

const StyledSpan = styled('span')(({ theme }) => ({
    fontSize: '9px',
    position: 'absolute',
    bottom: '-2px',
    fontWeight: 'bold'
}));

interface SlotsProps {
    slots: TimeSlot[];
    locationTimezone: string;
    timezone: string;
    onSlotClick: (slot: TimeSlot) => void;
    selectedSlot: TimeSlot | null;
}

const Slots = ({ slots, locationTimezone, timezone, onSlotClick, selectedSlot }: SlotsProps) => {
    const filteredSlots = useMemo(() => slots?.filter((slot) => !slot.occupied), [slots]);

    return (
        <Grid container justifyContent="center" id="widget-slots">
            {filteredSlots &&
                filteredSlots.map((slot, index) => {
                    const day = moment(slot.start_at).tz(locationTimezone).format('D');
                    const dayInSelectedTimezone = moment(slot.start_at).tz(locationTimezone).tz(timezone).format('D');

                    return (
                        <Grid item key={`timeslot_${index}`}>
                            <StyledTimeSlotButton
                                id={moment(slot.start_at).format('hh:mm A')}
                                sx={{ m: '2px', minWidth: '95px' }}
                                key={slot.start_at}
                                variant={selectedSlot && selectedSlot.start_at === slot.start_at ? 'contained' : 'outlined'}
                                onClick={() => onSlotClick(slot)}
                                disabled={slot.occupied}
                            >
                                {moment(slot.start_at).tz(locationTimezone).tz(timezone).format('hh:mm A')}
                                {day !== dayInSelectedTimezone && (
                                    <StyledSpan>{day < dayInSelectedTimezone ? 'Next Day' : 'Prev Day'}</StyledSpan>
                                )}
                            </StyledTimeSlotButton>
                        </Grid>
                    );
                })}
            {slots && !filteredSlots?.length && <Typography>No timeslots available for this date</Typography>}
        </Grid>
    );
};

export default Slots;
