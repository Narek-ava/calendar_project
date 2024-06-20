import { useCallback, useMemo } from 'react';
import { Button, Grid, Tooltip, TextField } from '@material-ui/core';
import Code from '@material-ui/icons/Code';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../store/snackbarReducer';

interface WidgetEmbedCodeProps {
    slug: string;
}

const WidgetEmbedCode = ({ slug }: WidgetEmbedCodeProps) => {
    const { showSnackbar } = useShowSnackbar();

    const code = useMemo(
        () =>
            `<script src="${window.location.origin}/widget.js?v=${Math.floor(Math.random() * 1000000000)}" company="${slug}" url="${
                window.location.origin
            }" trigger-button-class="cb-widget-btn"></script>`,
        [slug]
    );

    const copyCode = useCallback(() => {
        navigator.clipboard.writeText(code).then(() => {
            showSnackbar({
                message: 'Copied!',
                alertSeverity: SnackBarTypes.Success
            });
        });
    }, [code, showSnackbar]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Tooltip title="Click to copy widget embed code">
                    <Button onClick={copyCode} startIcon={<Code />} variant="outlined">
                        Copy code
                    </Button>
                </Tooltip>
            </Grid>
            <Grid item xs={12} lg={10} xl={8}>
                <TextField multiline type="text" value={code} fullWidth />
            </Grid>
        </Grid>
    );
};

export default WidgetEmbedCode;
