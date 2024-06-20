import { Typography, Box } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import { useCallback } from 'react';
import useSteps from '../widget-wizard/hooks/useSteps';

const StyledStepperWrap = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',

    '@media(max-width: 600px)': {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: '18px',
    fontWeight: 'normal',
    color: theme.palette.widget.text,
    textAlign: 'center',

    '@media(max-width: 600px)': {
        fontSize: '16px'
    }
}));

const StyledStepper = styled('div')(({ theme }) => ({
    display: 'flex',
    margin: '10px auto',

    '& div': {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        marginRight: '12px',
        backgroundColor: theme.palette.grey[300],
        cursor: 'pointer',

        '&.active': {
            backgroundColor: theme.palette.widget.green
        },

        '&:last-child': {
            marginRight: 0
        }
    },

    '@media(max-width: 600px)': {
        margin: '7px 0',

        '& div': {
            width: '22px',
            height: '22px',
            marginRight: '10px'
        }
    }
}));

interface WidgetStepperProps {
    step: number;
    handleSetActiveStep: (step: number) => void;
    stepsProgress: number[];
    submitted: boolean;
}

const WidgetStepper = ({ step, handleSetActiveStep, stepsProgress, submitted }: WidgetStepperProps) => {
    const { steps } = useSteps();

    const onStepClick = useCallback(
        (clickedStep: number) => {
            if (submitted) return;

            if (stepsProgress.includes(clickedStep - 1) || clickedStep < step) {
                handleSetActiveStep(clickedStep);
            }
        },
        [handleSetActiveStep, step, stepsProgress, submitted]
    );

    return (
        <StyledStepperWrap>
            <StyledTitle>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    Your
                </Box>{' '}
                Booking Progress
            </StyledTitle>
            <StyledStepper id="widget-stepper">
                {Object.entries(steps).map((stepElem) => (
                    <div
                        tabIndex={-1}
                        role="button"
                        aria-label="Change step"
                        key={`step_nav_${stepElem[0]}`}
                        className={stepElem[1].index <= step ? 'active' : ''}
                        onClick={() => onStepClick(stepElem[1].index)}
                        onKeyDown={() => undefined}
                    />
                ))}
            </StyledStepper>
        </StyledStepperWrap>
    );
};

export default WidgetStepper;
