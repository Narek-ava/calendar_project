import { useMemo } from 'react';
import { IService, PaymentType } from '../../../models/IService';
import { IconCashBanknote, IconCashBanknoteOff } from '@tabler/icons';
import { styled } from '@material-ui/core/styles';

interface ServiceCostProps {
    service: IService | null;
}

const StyledCost = styled('div')(({ theme }) => ({
    fontSize: '18px',
    color: theme.palette.widget.green,
    display: 'flex',
    alignItems: 'center',

    '& svg': {
        display: 'flex'
    }
}));

const ServiceCost = ({ service }: ServiceCostProps) => {
    const getServicePrice = useMemo(() => {
        if (service && service.payment_type === PaymentType.Free) {
            return PaymentType.Free.toUpperCase();
        }
        if (service && service.payment_type !== PaymentType.Free) {
            return service.price;
        }
        return '';
    }, [service]);

    return (
        <StyledCost>
            <span id="selected-service-payment-type-icon">
                {service?.payment_type === PaymentType.Free ? <IconCashBanknoteOff /> : <IconCashBanknote />}
            </span>
            <span id="selected-service-payment-type-text">{getServicePrice}</span>
        </StyledCost>
    );
};

export default ServiceCost;
