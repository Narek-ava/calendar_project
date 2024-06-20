import { IAppointment } from '../../../models/IAppointment';
import { Box, Card, List, ListItem, ListItemIcon, ListItemText, Link } from '@material-ui/core';
import AccessTime from '@material-ui/icons/AccessTime';
import NearMe from '@material-ui/icons/NearMe';
import Home from '@material-ui/icons/Home';
import Phone from '@material-ui/icons/Phone';
import Person from '@material-ui/icons/Person';
import LinkIcon from '@material-ui/icons/Link';
import moment from 'moment-timezone';
import { styled } from '@material-ui/core/styles';

interface CustomerInfoAppointmentItemProps {
    appointment: IAppointment;
}

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    '& .MuiTypography-root': {
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
}));

const CustomerInfoAppointmentItem = ({ appointment }: CustomerInfoAppointmentItemProps) => (
    <Box mt={1}>
        <Card raised>
            <List dense>
                <ListItem>
                    <ListItemIcon>
                        <AccessTime />
                    </ListItemIcon>
                    <StyledListItemText>
                        {moment.tz(appointment.start_at, appointment.location.time_zone).format('hh:mm A')} {' - '}
                        {moment.tz(appointment.end_at, appointment.location.time_zone).add(1, 'second').format('hh:mm A')}
                    </StyledListItemText>
                </ListItem>
                {appointment.service.is_virtual ? (
                    <ListItem>
                        <ListItemIcon>
                            <LinkIcon />
                        </ListItemIcon>
                        <StyledListItemText>
                            <Link href={appointment.tva_url} target="_blank">
                                {appointment.tva_url}
                            </Link>
                        </StyledListItemText>
                    </ListItem>
                ) : (
                    <>
                        <ListItem>
                            <ListItemIcon>
                                <NearMe />
                            </ListItemIcon>
                            <StyledListItemText>{appointment.location.name}</StyledListItemText>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <StyledListItemText>{appointment.location.address.address}</StyledListItemText>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <Phone />
                            </ListItemIcon>
                            <StyledListItemText>{appointment.location.phone || appointment.company?.phone}</StyledListItemText>
                        </ListItem>
                    </>
                )}
                <ListItem>
                    <ListItemIcon>
                        <Person />
                    </ListItemIcon>
                    <StyledListItemText>{`${appointment.employee.user.firstname} ${appointment.employee.user.lastname}`}</StyledListItemText>
                </ListItem>
            </List>
        </Card>
    </Box>
);

export default CustomerInfoAppointmentItem;
