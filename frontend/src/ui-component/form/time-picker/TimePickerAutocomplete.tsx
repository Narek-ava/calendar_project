import { memo, useEffect, useState } from 'react';
import moment, { Moment } from 'moment-timezone';
import { useDebouncedCallback } from 'use-debounce';
import styled from '@emotion/styled/macro';

// mui
import { ClickAwayListener, Popper } from '@mui/material';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useTheme } from '@mui/material/styles';

import { INPUT_DELAY } from '../../optimized-text-fields/OptimizedTextField';
import PickerStyleWrapper from './PickerStyleWrapper';
import { TimePickerProps } from './types';

const Li = styled.li`
    border-bottom: 1px solid #ccc;
    &:last-of-type {
        border-bottom: none;
    }
`;

const TimePickerAutocomplete = memo(
    ({ onTimeSet, outerValue, disabled, sx, listMaxHeight, variant, label, timeOptions, size }: TimePickerProps) => {
        const theme = useTheme();
        const [innerValue, setInnerValue] = useState<Moment>(outerValue);
        const [isDropDownOpened, setIsDropDownOpened] = useState(false);
        const [filtered, setFiltered] = useState(timeOptions);

        const closeDropDown = () => {
            setIsDropDownOpened(false);
        };

        const openDropDown = () => {
            setIsDropDownOpened(true);
        };

        useEffect(() => {
            setInnerValue(outerValue);
        }, [outerValue]);

        const debouncedHandleOnChange = useDebouncedCallback((val: string) => {
            // incoming time from picker (24h format)
            if (val) {
                // format to 12h to get filtered time labels
                const time12h = moment(val, 'HH:mm').format('hh:mm');
                const baseTime = time12h.split(':');
                const hours = baseTime[0];
                const minutes = baseTime[1];
                let searched: Moment[] = [];
                // filtered labels based on the first typed minutes number by user.
                if (minutes.split('')[0] === '0') {
                    const alternativeDecimals = minutes.split('')[1];
                    const newTime12h = Number(alternativeDecimals) < 6 ? `${hours}:${alternativeDecimals}0` : null;
                    searched = timeOptions.filter((time) => {
                        if (newTime12h) {
                            return time.format('hh:mm A').includes(time12h) || time.format('hh:mm A').includes(newTime12h);
                        }
                        return time.format('hh:mm A').includes(time12h);
                    });
                } else {
                    searched = timeOptions.filter((time) => time.format('hh:mm A').includes(time12h));
                }
                setFiltered(searched);
                onTimeSet(moment(val, 'HH:mm'));
            }
        }, INPUT_DELAY);

        const onClickOption = (option: Moment) => {
            setInnerValue(option);
            onTimeSet(option);
            closeDropDown();
        };

        return (
            <ClickAwayListener onClickAway={closeDropDown}>
                <PickerStyleWrapper>
                    <Autocomplete
                        size={size}
                        open={isDropDownOpened}
                        onClose={closeDropDown}
                        onOpen={openDropDown}
                        disablePortal
                        id="combo-box-demo"
                        value={innerValue}
                        options={filtered}
                        getOptionLabel={(option: Moment | string) => {
                            if (typeof option === 'string') {
                                return option;
                            }
                            return option.format('HH:mm');
                        }}
                        freeSolo
                        autoSelect
                        filterOptions={(x) => x}
                        disabled={disabled}
                        disableClearable
                        onChange={(event: any, value, reason, details) => {
                            if (typeof value === 'object') {
                                setInnerValue(value);
                                onTimeSet(value);
                                event.stopPropagation();
                            }
                        }}
                        onInputChange={(event: any, value, reason) => {
                            if (value !== 'Invalid date') {
                                // 24h value
                                debouncedHandleOnChange(value);
                            }
                        }}
                        PopperComponent={(props) => (
                            // @ts-ignore
                            // fixes styles warning bug
                            <Popper {...props} style={{ margin: 0, width: sx ? sx.width : undefined }} placement="bottom-start" />
                        )}
                        ListboxProps={{
                            style: {
                                maxHeight: listMaxHeight,
                                borderBottom: '1px solid',
                                padding: '5px 0'
                            }
                        }}
                        sx={sx}
                        isOptionEqualToValue={(option, val) => option === val}
                        clearOnBlur={false}
                        renderOption={(props, option: Moment) => (
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
                            <Li
                                {...props}
                                key={option.format()}
                                onClick={() => onClickOption(option)}
                                style={{ backgroundColor: option.isSame(innerValue) ? theme.palette.grey['200'] : undefined }}
                            >
                                {option.format('hh:mm A')}
                            </Li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        setInnerValue(outerValue);
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!e.target.value) {
                                        onTimeSet(outerValue);
                                    }
                                }}
                                type="time"
                                label={label}
                                variant={variant}
                            />
                        )}
                    />
                </PickerStyleWrapper>
            </ClickAwayListener>
        );
    }
);

export default TimePickerAutocomplete;
