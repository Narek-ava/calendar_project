import Avatar from '../../../ui-component/extended/Avatar';
import { stringToColor } from '../../../store/constant';

function stringAvatar(name: string) {
    const nameToShow = name.split(' ').length > 1 ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}` : `${name.split(' ')[0][0]}`;
    return {
        sx: {
            bgcolor: stringToColor(name),
            color: '#fff',
            width: '30px',
            height: '30px'
        },
        children: nameToShow
    };
}

interface IStringAvatarProps {
    name: string;
}

const BackgroundLetterAvatar = ({ name }: IStringAvatarProps) => <Avatar {...stringAvatar(name)} />;

export default BackgroundLetterAvatar;
