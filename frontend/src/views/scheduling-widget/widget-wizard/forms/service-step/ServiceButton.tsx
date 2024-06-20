import { useCallback } from 'react';
import Alarm from '@material-ui/icons/Alarm';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import { IService, PaymentType } from '../../../../../models/IService';
import { replaceMinioToLocalhost } from '../../../../../utils/functions/uploading-images-helpers';
import WidgetButton from '../../../components/WidgetButton';
import { IconCashBanknote, IconCashBanknoteOff } from '@tabler/icons';

interface ServiceButtonProps {
    service: IService;
    onChoose: () => void;
    isSelected: boolean;
    handleClickInfo: () => void;
}

const ServiceButton = ({ service, onChoose, isSelected, handleClickInfo }: ServiceButtonProps) => {
    const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);

    return (
        <WidgetButton
            isSelected={isSelected}
            name={service.name}
            imageUrl={getLogo(service.images[0])}
            onChoose={onChoose}
            bottomContent={
                <>
                    {service?.payment_type === PaymentType.Free ? <IconCashBanknoteOff /> : <IconCashBanknote />}
                    <span>
                        {service.price}
                        {service.payment_type === PaymentType.Prepaid ? ' (requires deposit)' : ''}
                    </span>
                    <Alarm sx={{ ml: '10px' }} />
                    <span>{service.duration}m</span>
                </>
            }
            nameIcon={
                service.description ? (
                    <InfoOutlined
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClickInfo();
                        }}
                    />
                ) : null
            }
        />
    );
};

export default ServiceButton;
