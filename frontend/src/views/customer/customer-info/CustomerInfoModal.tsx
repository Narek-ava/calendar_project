import customerAPI from '../../../services/CustomerService';
import { Grid, Typography, Skeleton } from '@material-ui/core';
import moment from 'moment';
import CustomerAppointmentsList from './CustomerAppointmentsList';
import CBModal from '../../../ui-component/CBModal';

interface CustomerInfoModalProps {
    customerId: string;
    onClose: () => void;
}

const CustomerInfoItem = ({ label, content }: { label: string; content?: string }) => (
    <Grid item xs={12} sm={6}>
        <Typography>
            <strong>{label}: </strong>
            {content}
        </Typography>
    </Grid>
);

const CustomerInfoDialog = ({ customerId, onClose }: CustomerInfoModalProps) => {
    const { data, isFetching } = customerAPI.useGetCustomerQuery(customerId, {
        refetchOnMountOrArgChange: true
    });

    return (
        <CBModal open onClose={onClose} fullWidth maxWidth="sm" title="Customer Info">
            {data && !isFetching ? (
                <Grid container spacing={1.5}>
                    <CustomerInfoItem label="Name" content={data.firstname} />
                    <CustomerInfoItem label="Lastname" content={data.lastname} />
                    <CustomerInfoItem label="Email" content={data.email} />
                    <CustomerInfoItem label="Phone" content={data.phone} />
                    <CustomerInfoItem
                        label="Address"
                        content={
                            data.address.address ||
                            Object.values(data.address)
                                .filter((a) => a)
                                .join(',')
                        }
                    />
                    <CustomerInfoItem label="Birthday" content={data.birth_date ? moment(data.birth_date).format('ll') : 'N/A'} />

                    <Grid item xs={12}>
                        <CustomerAppointmentsList appointments={data?.appointments} />
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                        <Skeleton animation="wave" height={30} />
                        <Skeleton animation="wave" height={30} />
                        <Skeleton animation="wave" height={30} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Skeleton animation="wave" height={30} />
                        <Skeleton animation="wave" height={30} />
                        <Skeleton animation="wave" height={30} />
                    </Grid>
                    <Grid item xs={12}>
                        <Skeleton animation="wave" height={50} />
                        <Skeleton animation="wave" height={50} />
                    </Grid>
                </Grid>
            )}
        </CBModal>
    );
};

export default CustomerInfoDialog;
