import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import ClickAwayListener from '@mui/material/ClickAwayListener';
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import Fade from '@mui/material/Fade';

import Box from '@mui/material/Box';
import { IconButton, InputAdornment, List, ListItem, TextField } from '@material-ui/core';
import MaskedInput from 'react-text-mask';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { SxProps } from '@material-ui/system';
import { IconChevronDown } from '@tabler/icons';
import useFocus from '../../../hooks/useFocus';
import { BaseTextFieldProps, Popper, styled } from '@mui/material';

const StyledPopper = styled(Popper)(({ theme }) => ({
    border: `1px solid ${theme.palette.mode === 'light' ? '#e1e4e8' : '#30363d'}`,
    boxShadow: `0 8px 24px ${theme.palette.mode === 'light' ? 'rgba(149, 157, 165, 0.2)' : 'rgb(1, 4, 9)'}`,
    borderRadius: 6,
    width: 150,
    zIndex: theme.zIndex.modal,
    fontSize: 13,
    color: theme.palette.mode === 'light' ? '#24292e' : '#c9d1d9',
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1c2128'
}));

interface RenderListItem {
    time: string;
    index: number;
    // items: RefObject<any[]>;
    handleItemClick: (time: string, index: number) => void;
    selectedIndex: number;
    // onKeyDown: (e: React.KeyboardEvent<HTMLDivElement | HTMLLIElement | HTMLDListElement>) => void;
}

const CustomListItem = ({ time, index, handleItemClick, selectedIndex }: RenderListItem) => {
    const theme = useTheme();
    return (
        <ListItem
            key={time}
            // eslint-disable-next-line no-return-assign
            // ref={(el) =>
            //     // @ts-ignore
            //     (items.current[index] = el)
            // }
            // autoFocus
            onClick={(e) => {
                handleItemClick(time, index);
            }}
            sx={{
                fontSize: '20px',
                padding: '10px',
                // width: '100%',
                borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#eaecef' : '#30363d'}`,
                '&:last-child': {
                    borderBottom: 'none'
                },
                backgroundColor: selectedIndex === index ? theme.palette.grey['200'] : undefined,
                '&:hover': {
                    backgroundColor: theme.palette.grey['200'],
                    cursor: 'pointer'
                }
            }}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    '& span': {
                        color: theme.palette.mode === 'light' ? '#586069' : '#8b949e'
                    }
                }}
            >
                {time}
            </Box>
        </ListItem>
    );
};

interface TimePickerAutocompleteProps {
    value: string | null;
    onTimeSet: (d: string) => void;
    startTime?: string;
    endTime?: string;
    interval: number;
    disabled?: boolean;
    sx?: SxProps;
    width?: string;
    error?: any;
    setError?: (arg: string | undefined) => void;
    variant?: BaseTextFieldProps['variant'];
}

const TimePickerAutocomplete = ({
    startTime = '00:00',
    endTime,
    interval,
    disabled,
    onTimeSet,
    value,
    sx,
    width,
    error,
    setError,
    variant = 'standard'
}: TimePickerAutocompleteProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [inputValue, setInputValue] = React.useState(moment(value).format('hh:mm a'));
    // const [open, setOpen] = React.useState(false);
    // const listItemRef = useRef<HTMLLIElement | null>(null);
    // const items = useRef<any[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    // const listRef = useRef<HTMLUListElement | null>(null);
    const [menuRef, setMenuFocus] = useFocus();
    const theme = useTheme();

    const getTimelineLabels = () => {
        const timeLabels: string[] = [];
        const startTimeMoment = startTime ? moment(startTime, 'hh:mm') : moment();
        const startPeriod = startTime ? startTimeMoment.hours() * 60 : 0;
        const endPeriod = endTime ? moment(endTime, 'hh:mm').hours() * 60 : 1440; // 60min*24 = 1440m
        for (let i = startPeriod; i < endPeriod; i += interval) {
            startTimeMoment.add(i === 0 ? 0 : interval, 'minutes');
            timeLabels.push(startTimeMoment.format('hh:mm a'));
        }
        return timeLabels;
    };

    const [filtered, setFiltered] = useState(getTimelineLabels());

    const onInputClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(inputRef.current);
    };

    const onListItemClick = (time: string, index: number) => {
        onTimeSet(time);
        setInputValue(time);
        setSelectedIndex(index);
        setAnchorEl(null);
    };

    const handleClose = () => {
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
        setSelectedIndex(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement | HTMLDListElement | HTMLLIElement>) => {
        let newSelected = 1;
        if (e.key === 'ArrowDown') {
            newSelected = Math.min(selectedIndex + 1, filtered.length - 1);
            setSelectedIndex(newSelected);
            if (menuRef) {
                // @ts-ignore
                setMenuFocus();
            }
        } else if (e.key === 'ArrowUp') {
            newSelected = Math.max(0, selectedIndex - 1);
            setSelectedIndex(newSelected);
        }
        if (e.key === 'Enter') {
            onTimeSet(filtered[selectedIndex]);
            setInputValue(filtered[selectedIndex]);
            setAnchorEl(null);
            e.preventDefault();
        }
        // const node = items.current[newSelected];
        // node?.focus();
        // listRef.current?.focus();
    };

    // console.log(selectedIndex);

    // const downHandler = (e: EventListenerOrEventListenerObject) => {
    //     console.log(e.key);
    // };
    //
    // useEffect(() => {
    //     if (open) {
    //         window.addEventListener('keydown', downHandler);
    //         // Remove event listeners on cleanup
    //     }
    //
    //     return () => {
    //         window.removeEventListener('keydown', downHandler);
    //     };
    // }, [open]);

    useEffect(() => {
        setInputValue(moment(value).format('hh:mm a'));
    }, [value]);

    useEffect(() => {
        if (inputValue) {
            let rawValue = inputValue.replace(/[^\d]/g, '');
            if (rawValue.length > 1) {
                rawValue = `${rawValue.slice(0, 2)}:${rawValue.slice(2)}`;
            }
            if (rawValue.length > 5) {
                rawValue += ' ';
            }
            const searched = getTimelineLabels().filter((time) => time.includes(rawValue));
            setFiltered(searched);
        }
    }, [inputValue]);

    const open = Boolean(anchorEl);
    const id = open ? 'timepicker' : undefined;

    return (
        <>
            <Box sx={sx} width={width} ref={inputRef} onKeyDown={handleKeyDown}>
                <MaskedInput
                    mask={[/[0-1]/, /[0-9]/, ':', /[0-5]/, /[0-9]/, ' ', /[a|A|p|P]/, /[m|M]/]}
                    className="form-control"
                    guide
                    disabled={disabled}
                    showMask
                    value={inputValue}
                    keepCharPositions={false}
                    id="mask-hour1"
                    // onBlur={(e) => {
                    //     if (e.target.value.includes('_')) {
                    //         setError && setError('Invalid time format');
                    //     }
                    // }}
                    aria-describedby={id}
                    autoComplete="off"
                    // onClick={onInputClick}
                    onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                        if (!anchorEl) {
                            setAnchorEl(e.currentTarget);
                        }
                        if (rawValue.length < 4 && !open) {
                            // setOpen(true);
                            setAnchorEl(e.currentTarget);
                        }
                        if (!e.target.value.includes('_')) {
                            onTimeSet(e.target.value);
                        }
                        // setError && setError(undefined);
                        setInputValue(e.target.value);
                    }}
                    render={(ref, props) => (
                        <TextField
                            fullWidth
                            inputRef={ref}
                            {...props}
                            disabled={disabled}
                            variant={variant}
                            defaultValue=""
                            error={!!error}
                            helperText={!!error && error}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton edge="end" onClick={onInputClick}>
                                            <IconChevronDown size="20px" color={open ? theme.palette.primary.main : undefined} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    )}
                />
            </Box>
            <StyledPopper
                id={id}
                open={open}
                anchorEl={anchorEl}
                placement="bottom-start"
                disablePortal
                style={{ width: width || 'unset' }}
            >
                {/*
                <Menu
                    id="fade-menu"
                    MenuListProps={{
                        'aria-labelledby': 'fade-button'
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    disableAutoFocus
                    disableAutoFocusItem
                    onClose={handleClose}
                    // TransitionComponent={Fade}
                    sx={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                    {filtered.map((time, index) => (
                        <MenuItem key={time} onClick={() => onListItemClick(time, index)}>
                            {time}
                        </MenuItem>
                    ))}
                </Menu>
                */}
                <ClickAwayListener onClickAway={handleClose}>
                    <List sx={{ maxHeight: '200px', overflowY: 'auto', '&:focus': { display: 'none' } }} ref={menuRef}>
                        {filtered.map((time, index) => (
                            <React.Fragment key={time}>
                                <CustomListItem
                                    handleItemClick={onListItemClick}
                                    // items={items}
                                    // onKeyDown={handleKeyDown}
                                    time={time}
                                    index={index}
                                    selectedIndex={selectedIndex}
                                />
                            </React.Fragment>
                        ))}
                        {filtered.length === 0 && (
                            <ListItem
                                sx={{
                                    fontSize: '20px',
                                    padding: '10px',
                                    borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#eaecef' : '#30363d'}`,
                                    '&:last-child': {
                                        borderBottom: 'none'
                                    }
                                }}
                            >
                                No results
                            </ListItem>
                        )}
                    </List>
                </ClickAwayListener>
            </StyledPopper>
        </>
    );
};

export default TimePickerAutocomplete;
