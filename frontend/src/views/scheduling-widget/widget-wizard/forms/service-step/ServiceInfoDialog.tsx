import { IService } from '../../../../../models/IService';
import ServiceImageTitle from '../../../components/ServiceImageTitle';
import { styled } from '@material-ui/core/styles';
import { Dialog, Typography, Grid, Button, Box } from '@mui/material';
import Alarm from '@material-ui/icons/Alarm';
import EventAvailable from '@material-ui/icons/EventAvailable';
import Refresh from '@material-ui/icons/Refresh';
import ServiceCost from '../../../components/ServiceCost';
import WidgetConfirmButton from '../../../components/WidgetConfirmButton';

interface ServiceInfoDialogProps {
    open: boolean;
    onClose: () => void;
    service: IService | null;
    onChoose: () => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiPaper-root': {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        borderRadius: '5px',
        wordBreak: 'break-word',

        '& .dialog-content': {
            backgroundColor: theme.palette.grey[100],
            borderRadius: '5px',

            '& .service-name': {
                color: theme.palette.widget.text,
                fontSize: '24px',
                padding: theme.spacing(2, 2, 0)
            },

            '& .subheader': {
                padding: theme.spacing(2),

                '& .duration': {
                    display: 'flex',
                    alignItems: 'end',
                    fontSize: '16px',
                    color: theme.palette.widget.text,

                    '& .MuiSvgIcon-root': {
                        width: '20px',
                        marginRight: '2px'
                    }
                }
            },

            '& .MuiTypography-root.description-text': {
                color: theme.palette.widget.text,
                fontSize: '16px',
                padding: theme.spacing(0, 2, 2)
            }
        },

        '& .cancel-button': {
            color: theme.palette.widget.title,
            fontSize: '14px',

            '& .MuiSvgIcon-root': {
                marginRight: theme.spacing(1)
            },

            '&:hover': {
                background: 'none'
            }
        }
    }
}));

const ServiceInfoDialog = ({ open, onClose, service, onChoose }: ServiceInfoDialogProps) => (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <Box className="dialog-content" id="description-modal">
            <ServiceImageTitle service={service} />
            {service?.images.length === 0 && <Typography className="service-name">{service.name}</Typography>}
            <Grid container justifyContent="space-between" className="subheader">
                <Grid item className="duration">
                    <Alarm />
                    {service?.duration}m
                </Grid>
                <Grid item>
                    <ServiceCost service={service} />
                </Grid>
            </Grid>
            <Typography className="description-text">{service?.description}</Typography>
            <WidgetConfirmButton onClick={onChoose}>
                <EventAvailable />
                Yes, I&apos;d like this Service
            </WidgetConfirmButton>
        </Box>
        <Button onClick={onClose} className="cancel-button">
            <Refresh />
            Change Service
        </Button>
    </StyledDialog>
);

export default ServiceInfoDialog;
