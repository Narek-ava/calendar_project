import { Button, Grid } from '@material-ui/core';
import ArrowForward from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import Refresh from '@material-ui/icons/Refresh';
import { StepContentProps, WidgetSummaryProps } from './types';
import { styled } from '@material-ui/core/styles';
import StyledGreenButton from '../components/StyledGreenButton';
import StyledBackButton from '../components/StyledBackButton';
import useSteps from './hooks/useSteps';

const StyledRestartButton = styled(Button)(({ theme }) => ({
    color: theme.palette.widget.buttonDetails,

    '&:hover': {
        backgroundColor: 'transparent'
    }
}));

interface WidgetNavProps {
    step: number;
    stepsProgress: number[];
    resetWidget: WidgetSummaryProps['resetWidget'];
    submitted: WidgetSummaryProps['submitted'];
    handleBack: StepContentProps['handleBack'];
    isInProgress: boolean;
    isMobile: boolean;
    hide?: boolean;
}

const WidgetNav = ({ step, stepsProgress, resetWidget, handleBack, submitted, isInProgress, isMobile, hide }: WidgetNavProps) => {
    const { steps } = useSteps();

    return !hide ? (
        <Grid pt={1} spacing={1} container justifyContent={{ xs: 'center', sm: 'space-between' }} alignItems="center">
            {step > 0 && !submitted && (
                <Grid item xs={6} sx={{ display: { xs: 'inherit', sm: 'none' } }}>
                    <StyledBackButton variant="contained" startIcon={<ArrowBackIos />} onClick={handleBack} fullWidth={isMobile}>
                        Prev Step
                    </StyledBackButton>
                </Grid>
            )}
            {(stepsProgress.includes(step) || step === steps.user.index) && !submitted && (
                <Grid item xs={6}>
                    <StyledGreenButton
                        color="secondary"
                        variant="contained"
                        endIcon={<ArrowForward />}
                        form={`widget-form-${step}`}
                        type="submit"
                        fullWidth={isMobile}
                        id="Next-Step"
                    >
                        {step === 4 ? 'Confirm' : 'Next Step'}
                    </StyledGreenButton>
                </Grid>
            )}
            {isInProgress && !submitted && (
                <Grid item xs={6} sm="auto">
                    <StyledRestartButton
                        size={isMobile ? 'small' : undefined}
                        onClick={resetWidget}
                        startIcon={<Refresh />}
                        fullWidth={isMobile}
                        id="Restart-Booking"
                    >
                        Restart Booking
                    </StyledRestartButton>
                </Grid>
            )}
        </Grid>
    ) : null;
};

export default WidgetNav;
