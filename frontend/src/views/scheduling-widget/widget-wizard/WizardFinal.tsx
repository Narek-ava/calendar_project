import StepTitle from '../components/StepTitle';
import Transitions from '../../../ui-component/extended/Transitions';
import { Button, Typography } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import EventAvailable from '@material-ui/icons/EventAvailable';
import Refresh from '@material-ui/icons/Refresh';
import { useAppSelector } from '../../../hooks/redux';
import WidgetConfirmButton from '../components/WidgetConfirmButton';
import useSteps from './hooks/useSteps';

const StyledTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.widget.text,
    fontSize: '20px',

    '@media(max-width: 768px)': {
        fontSize: '18px'
    }
}));

const StyledRestartButton = styled(Button)(({ theme }) => ({
    color: theme.palette.widget.buttonDetails,
    width: '100%',
    marginTop: theme.spacing(1),

    '&:hover': {
        backgroundColor: 'transparent'
    },

    '& .MuiSvgIcon-root': {
        marginRight: theme.spacing(1)
    }
}));

interface WizardFinalProps {
    step: number;
    handleBack: () => void;
    submitBooking: () => void;
    resetWidget: () => void;
    rawResetWidget: () => void;
    submitted: boolean;
}

const WizardFinal = ({ step, handleBack, submitBooking, resetWidget, rawResetWidget, submitted }: WizardFinalProps) => {
    const { isSubmitting } = useAppSelector((state) => state.submitting);
    const { stepsLength } = useSteps();

    const handleSubmit = () => {
        if (step + 1 === stepsLength) {
            submitBooking();
        }
    };

    return (
        <Transitions type="fade" in>
            <StepTitle
                title={submitted ? '' : 'Confirm Appointment'}
                error={false}
                step={step}
                handleBack={handleBack}
                submitted={submitted}
            />
            <StyledTypography sx={{ display: { xs: 'none', sm: 'block' } }}>
                {submitted
                    ? 'Appointment created successfully.'
                    : 'Please double-check that your appointment information is correct and confirm your appointment.'}
            </StyledTypography>
            {!submitted && (
                <WidgetConfirmButton onClick={handleSubmit} disabled={isSubmitting}>
                    <EventAvailable />
                    Confirm Appointment
                </WidgetConfirmButton>
            )}
            <StyledRestartButton
                sx={{ display: { xs: submitted ? 'inline-flex' : 'none', sm: 'inline-flex' } }}
                onClick={submitted ? rawResetWidget : resetWidget}
                id="Restart-Booking"
            >
                <Refresh />
                {submitted ? 'Schedule another booking' : 'Restart booking'}
            </StyledRestartButton>
        </Transitions>
    );
};

export default WizardFinal;
