import { useEffect, useState } from 'react';

import { Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material';
import { Grid } from '@material-ui/core';

import { PrivateNoteStepProps } from './types';
import Transitions from '../../../ui-component/extended/Transitions';

const PrivateNoteStep = ({ privateNoteData, setPrivateNoteData }: PrivateNoteStepProps) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (privateNoteData) {
            setChecked(true);
        }
    }, [privateNoteData]);

    const handleCheck = () => {
        setChecked((prev) => {
            if (prev) {
                setPrivateNoteData(null);
            }
            return !prev;
        });
    };

    return (
        <Grid container spacing={2}>
            <Grid item sx={{ padding: '0 0 0 16px !important' }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={checked}
                            id="sms_checkbox"
                            name="with_sms"
                            onChange={handleCheck}
                            value={checked}
                            sx={{ color: '#9e9e9e' }}
                        />
                    }
                    label="Add private Note"
                />
            </Grid>
            <Grid item xs={12} sx={{ padding: '8px 0 0 16px !important' }}>
                <Transitions type="collapse" in={checked}>
                    <FormControl fullWidth error={Boolean()}>
                        <TextField
                            fullWidth
                            id="private_note"
                            name="private_note"
                            rows={2}
                            multiline
                            label="Private Note (Staff only)"
                            value={privateNoteData || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setPrivateNoteData(e.target.value);
                            }}
                        />
                    </FormControl>
                </Transitions>
            </Grid>
        </Grid>
    );
};

export default PrivateNoteStep;
