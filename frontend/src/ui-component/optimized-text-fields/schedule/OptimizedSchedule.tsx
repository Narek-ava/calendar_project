/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
import { useDebouncedCallback } from 'use-debounce';
import React, { useCallback, useState } from 'react';
import { Button, FormHelperText, Switch } from '@material-ui/core';
import moment from 'moment';
import { ISchedule } from '../../../models/ILocation';
import AppTimePicker from '../../form/time-picker/AppTimePicker';
import { Moment } from 'moment-timezone';
import { INPUT_DELAY } from '../OptimizedTextField';
import { FormikErrors } from 'formik';

interface OptimizedScheduleProps {
    schedules: ISchedule[];
    onChange: (d: ISchedule[]) => void;
    errors?: FormikErrors<any>;
}

const OptimizedSchedule = ({ schedules, onChange, errors }: OptimizedScheduleProps) => {
    /* const [equals, setEquals] = useState({
        start: moment().set({ hours: 8, minutes: 30 }),
        end: moment().set({ hours: 17, minutes: 30 })
    }); */ // must be 05:00 am format as the time picker output
    const [innerSchedule, setInnerSchedule] = useState<ISchedule[]>(
        [...schedules].sort((a, b) => (a.id === 0 && b.id === 0 ? 0 : a.id - b.id))
    );

    const debouncedHandleOnChange = useDebouncedCallback((newSchedule: ISchedule[]) => {
        if (onChange) {
            onChange(newSchedule);
        }
    }, INPUT_DELAY);

    const handleChangeTime = useCallback(
        ({ time, index, field }: { time: Moment; index: number; field: 'start' | 'end' }) => {
            if (time) {
                const newSchedule = innerSchedule.map((day, i) => {
                    if (i === index) {
                        return {
                            ...day,
                            [field]: time.format('YYYY-MM-DD HH:mm')
                        };
                    }
                    return day;
                });
                setInnerSchedule(newSchedule);
                debouncedHandleOnChange(newSchedule);
            }
        },
        [innerSchedule]
    );

    const equalizeSchedule = () => {
        const firstDay = innerSchedule[0];
        const newSchedule = innerSchedule.map((schedule) => ({
            ...schedule,
            start: firstDay.start,
            end: firstDay.end
        }));
        setInnerSchedule(newSchedule);
        debouncedHandleOnChange(newSchedule);
    };

    const toggleDay = (day: ISchedule, index: number) => {
        const newSchedule = innerSchedule.map((dayItem, i) => {
            if (i === index) {
                return { ...dayItem, enable: !day.enable };
            }
            return dayItem;
        });
        setInnerSchedule(newSchedule);
        debouncedHandleOnChange(newSchedule);
    };

    const enableDay = (index: number) => {
        const newValue = innerSchedule[index].enable;
        if (!newValue) {
            const newSchedule = innerSchedule.map((dayItem, i) => {
                if (i === index) {
                    return { ...dayItem, enable: true };
                }
                return dayItem;
            });
            setInnerSchedule(newSchedule);
            debouncedHandleOnChange(newSchedule);
        }
    };

    return (
        <table
            style={{
                borderCollapse: 'separate',
                borderSpacing: '5px 10px'
            }}
        >
            <tbody>
                <tr style={{ borderBottom: '1px solid', height: '1px' }} />
                {innerSchedule.map((day, index) => {
                    // @ts-ignore
                    const error = errors?.schedule?.[index]?.end?.join(' ');

                    return (
                        <React.Fragment key={day.id}>
                            <tr>
                                <td
                                    onClick={() => toggleDay(day, index)}
                                    style={{
                                        cursor: 'pointer'
                                    }}
                                >
                                    {moment().weekday(day.id).format('dddd')}
                                </td>
                                <td>
                                    <Switch
                                        checked={day.enable}
                                        name={`schedule[${index}].enable`}
                                        onChange={() => toggleDay(day, index)}
                                        value={day.enable}
                                    />
                                </td>
                                <td onClick={() => enableDay(index)}>
                                    <AppTimePicker
                                        disabled={!day.enable}
                                        outerValue={moment(day.start, 'YYYY-MM-DD HH:mm:ss')}
                                        onTimeSet={(time) => {
                                            handleChangeTime({ time, index, field: 'start' });
                                        }}
                                        sx={{ width: '140px', mx: 2 }}
                                    />
                                </td>
                                <td>to</td>
                                <td onClick={() => enableDay(index)}>
                                    <AppTimePicker
                                        disabled={!day.enable}
                                        outerValue={moment(day.end, 'YYYY-MM-DD HH:mm:ss')}
                                        onTimeSet={(time) => {
                                            handleChangeTime({ time, index, field: 'end' });
                                        }}
                                        sx={{ width: '140px', mx: 2 }}
                                    />
                                </td>
                                <td>{index === 0 && <Button onClick={equalizeSchedule}>Equalize</Button>}</td>
                            </tr>
                            {error && (
                                <tr>
                                    <td colSpan={6}>
                                        <FormHelperText error id={`error_schedule_end_${index}`}>
                                            {error}
                                        </FormHelperText>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
            </tbody>
        </table>
    );
};

export default OptimizedSchedule;
