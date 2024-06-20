import moment from 'moment';
import { IService } from '../../../models/IService';
import { WizardStates } from '../widget-wizard/types';

interface PaymentTitleProps {
    service: IService;
    date: WizardStates['dateData'];
    location: WizardStates['locationData'];
}

const PaymentTitle = ({ service, date, location }: PaymentTitleProps) => (
    <>
        Prepaid booking for
        <strong> {service.name}</strong>
        {date && (
            <i>
                {' '}
                {`(${moment(date.start_at).format('MMMM Do YYYY, hh:mm A')}${
                    location ? ` ${moment.tz(location?.time_zone).format('z')}` : ''
                })`}
            </i>
        )}
    </>
);

export default PaymentTitle;
