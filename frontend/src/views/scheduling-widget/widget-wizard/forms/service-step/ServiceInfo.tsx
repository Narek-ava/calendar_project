import { IService } from '../../../../../models/IService';
import ServiceImageTitle from '../../../components/ServiceImageTitle';
import { Box, Typography, Grid } from '@mui/material';
import { styled } from '@material-ui/core/styles';
import StyledGreenButton from '../../../components/StyledGreenButton';
import StyledBackButton from '../../../components/StyledBackButton';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import LocalAtm from '@material-ui/icons/LocalAtm';

const StyledContent = styled(Box)(({ theme }) => ({
    background: theme.palette.grey[100],
    padding: theme.spacing(1),

    '& .MuiTypography-root': {
        fontSize: '16px',
        color: theme.palette.widget.text
    }
}));

const StyledPrice = styled(Box)(({ theme }) => ({
    color: theme.palette.widget.green,
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
    justifyContent: 'center'
}));

interface ServiceInfoProps {
    service: IService | null;
    onClose: () => void;
    onChoose: () => void;
}

const ServiceInfo = ({ service, onClose, onChoose }: ServiceInfoProps) => (
    <>
        <Box sx={{ borderRadius: '5px' }}>
            <ServiceImageTitle
                service={service}
                title={
                    <Box display="flex" flexDirection="column">
                        <Typography fontSize="20px">{service?.name}</Typography>
                        <StyledPrice>
                            <LocalAtm />
                            {service?.price}
                        </StyledPrice>
                    </Box>
                }
            />
            <StyledContent>
                <Typography className="description-text">{service?.description}</Typography>
            </StyledContent>
        </Box>
        <Grid container justifyContent="space-between" mt={0} spacing={2} pb={1}>
            <Grid item xs={6}>
                <StyledBackButton variant="contained" startIcon={<ArrowBackIos />} onClick={onClose} fullWidth>
                    Back
                </StyledBackButton>
            </Grid>
            <Grid item xs={6}>
                <StyledGreenButton variant="contained" endIcon={<ArrowForwardIos />} onClick={onChoose} fullWidth>
                    Continue
                </StyledGreenButton>
            </Grid>
        </Grid>
    </>
);

export default ServiceInfo;
