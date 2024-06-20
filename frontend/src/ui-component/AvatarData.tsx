import { IService } from '../models/IService';
import TooltipAvatar from './tooltips/TooltipAvatar';
import { stringToColor } from '../store/constant';
import { IEmployee } from '../models/IEmployee';
import { ILocation } from '../models/ILocation';
import { MoveToProps } from './GroupOfAvatars';
import { replaceMinioToLocalhost } from '../utils/functions/uploading-images-helpers';

export interface CustomAvatarElement {
    children: () => JSX.Element;
    id: number;
    name: string;
    url: string;
}

type AvatarDataType = IService[] | ILocation[] | IEmployee[];

interface AvatarDataProps {
    data: AvatarDataType;
    path: string;
    moveTo: (arg: MoveToProps) => void;
    isClickable: boolean;
}

export const getAvatarData = ({ data, path, moveTo, isClickable }: AvatarDataProps): CustomAvatarElement[] =>
    data.map((dataElement) => {
        let name = '';
        let src = '/';
        if ('user' in dataElement) {
            name = `${dataElement.user.firstname.charAt(0).toUpperCase() + dataElement.user.firstname.slice(1)} ${
                dataElement.user.lastname
            }`;
            if (dataElement.avatar && typeof dataElement.avatar === 'object' && 'url' in dataElement.avatar) {
                src = replaceMinioToLocalhost(dataElement.avatar.url);
            } else if (dataElement.user.avatar && typeof dataElement.user.avatar === 'object' && 'url' in dataElement.user.avatar) {
                src = replaceMinioToLocalhost(dataElement.user.avatar.url);
            }
        } else {
            name = dataElement.name.charAt(0).toUpperCase() + dataElement.name.slice(1);
        }
        if ('images' in dataElement && dataElement.images.length > 0) {
            src = replaceMinioToLocalhost(dataElement.images[dataElement.images.length - 1].url);
        }

        const handleAvatarClick = () => {
            if (isClickable) {
                moveTo({ path, id: dataElement.id });
            }
        };

        const getColor = (elem: any) => {
            if ('background_color' in elem) {
                return elem?.background_color ? `#${elem.background_color}` : stringToColor(name);
            }

            return stringToColor(name);
        };

        return {
            children: () => (
                <TooltipAvatar
                    alt={name}
                    onClick={handleAvatarClick}
                    src={src}
                    sx={{
                        // pointerEvents: isClickable ? undefined : 'none',
                        cursor: isClickable ? 'pointer' : 'default',
                        backgroundColor: src === '/' ? getColor(dataElement) : '#F2F2F2',
                        boxSizing: 'content-box',
                        border: '2px solid',
                        borderColor: dataElement?.isActive ? '#1e88e5' : '#fff',
                        color: '#fff'
                    }}
                />
            ),
            id: dataElement.id,
            name,
            url: path
        };
    });
