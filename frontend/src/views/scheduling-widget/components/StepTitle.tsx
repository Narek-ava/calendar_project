import { Typography, Grid } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import StyledBackButton from './StyledBackButton';
import { WidgetSummaryProps } from '../widget-wizard/types';

const StyledText = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'error'
})<{ error?: boolean }>(({ theme, error }) => ({
    color: error ? 'error' : theme.palette.widget.text,
    margin: 0,
    fontSize: '24px',
    lineHeight: '24px',

    '@media(max-width: 768px)': {
        fontSize: '20px',
        lineHeight: '20px'
    }
}));

interface StepTitleProps {
    error: boolean;
    title: string;
    step: number;
    handleBack: () => void;
    submitted: WidgetSummaryProps['submitted'];
}

const StepTitle = ({ error, title, step, handleBack, submitted }: StepTitleProps) => (
    <Grid container justifyContent="space-between" mb={1.5}>
        <Grid item>
            <StyledText error={error} variant="h5" gutterBottom>
                {title}
            </StyledText>
        </Grid>
        <Grid item sx={{ display: { xs: 'none', sm: 'block' } }}>
            {step > 0 && !submitted && (
                <StyledBackButton sx={{ mt: '5px' }} variant="contained" startIcon={<ArrowBackIos />} onClick={handleBack} id="Prev-Step">
                    Prev Step
                </StyledBackButton>
            )}
        </Grid>
    </Grid>
);

export default StepTitle;
