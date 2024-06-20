// material-ui
import { Autocomplete, Avatar, TextField, Typography } from '@material-ui/core';

// project imports
import { IService } from '../../../models/IService';
import { ServiceStepProps } from './types';
import { useAppDispatch } from '../../../hooks/redux';
import { openConfirmPopup } from '../../../store/confirmPopupSlice';
import { Box } from '@mui/material';
import { stringToColor } from '../../../store/constant';
import EllipsisTypography from '../../../ui-component/optimized-text-fields/EllipsisTypography';
import { useCallback } from 'react';

const ServiceStep = ({
    error,
    index,
    removeError,
    services,
    serviceData,
    setServiceData,
    setDurationData,
    rangeMode,
    setRangeMode,
    range
}: ServiceStepProps) => {
    const dispatch = useAppDispatch();

    const handleSetDuration = (duration: number) => {
        setDurationData(duration);
        setRangeMode(false);
    };

    const confirmChangeDuration = (duration: number, name: string) => {
        if (rangeMode && range && range.duration && range.duration > 60) {
            dispatch(
                openConfirmPopup({
                    onConfirm: () => handleSetDuration(duration),
                    confirmText: `Change`,
                    text: `Change duration to ${duration} minutes (default ${name} duration) ?`
                })
            );
        } else {
            setDurationData(duration);
        }
    };

    const getLogo = useCallback((logo) => (logo ? logo?.url : ''), []);

    return (
        <Autocomplete
            id="service-id"
            fullWidth
            value={serviceData}
            disableClearable={services.length === 1}
            options={services}
            getOptionLabel={(option: IService) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No items match your search"
            renderInput={(params) => <TextField {...params} error={error} label="Select Service" />}
            onChange={(e, value) => {
                if (value) {
                    setServiceData(value);
                    // setDurationData(value.duration);
                    if (value.duration) {
                        confirmChangeDuration(value.duration, value.name);
                    }
                    if (error) {
                        removeError(index);
                    }
                } else {
                    setServiceData(null);
                }
            }}
            renderOption={(props, option: IService) => (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    <Avatar
                        variant="rounded"
                        // color="#fff"
                        src={getLogo(option.images[option.images.length - 1])}
                        sx={{
                            color: '#fff',
                            bgcolor: stringToColor(option.name),
                            width: 30,
                            height: 30,
                            mr: 1
                        }}
                    >
                        <Typography fontSize="large">{option.name.charAt(0).toUpperCase()}</Typography>
                    </Avatar>
                    <EllipsisTypography text={option.name} ml={2} />
                </Box>
            )}
        />
    );
};

export default ServiceStep;
