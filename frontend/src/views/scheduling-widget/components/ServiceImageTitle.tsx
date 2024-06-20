import { IService } from '../../../models/IService';
import { ReactNode } from 'react';
import ImageTitle from './ImageTitle';

interface ServiceImageTitleProps {
    service: IService | null;
    title?: string | ReactNode;
}

const ServiceImageTitle = ({ service, title }: ServiceImageTitleProps) =>
    service && service.images.length > 0 ? (
        <ImageTitle imageUrl={service.images[service.images.length - 1].url} title={title || service.name} altText={service.name} />
    ) : null;

export default ServiceImageTitle;
