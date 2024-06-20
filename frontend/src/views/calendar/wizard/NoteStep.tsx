// import { useEffect, useState } from 'react';

// material-ui
import { FormControl } from '@mui/material';
import TextField from '@mui/material/TextField';
import { Grid } from '@material-ui/core';

// project imports
import { NoteStepProps } from './types';

const NoteStep = ({ noteData, setNoteData }: NoteStepProps) => (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <FormControl fullWidth error={Boolean()}>
                <TextField
                    fullWidth
                    id="note"
                    name="note"
                    rows={2}
                    multiline
                    label="Note"
                    value={noteData || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setNoteData(e.target.value);
                    }}
                />
            </FormControl>
        </Grid>
    </Grid>
);
export default NoteStep;
