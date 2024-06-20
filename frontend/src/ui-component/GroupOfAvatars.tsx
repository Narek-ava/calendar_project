import AvatarGroup from '@atlaskit/avatar-group';
import { ListItem } from '@mui/material';
import { CustomAvatarElement } from './AvatarData';
import { useNavigate } from 'react-router-dom';

export interface MoveToProps {
    id: number;
    path: string;
}

interface GroupOfAvatarsProps {
    data: CustomAvatarElement[];
    isClickable: boolean;
    maxCount?: number;
}

const GroupOfAvatars = ({ data, isClickable, maxCount }: GroupOfAvatarsProps) => {
    const navigate = useNavigate();
    const moveTo = ({ path, id }: MoveToProps) => {
        navigate(`/${path}/${id}`);
    };

    const handleClickAvatar = (avatar: CustomAvatarElement) => {
        if (isClickable) {
            moveTo({
                path: avatar.url,
                id: avatar.id
            });
        }
    };

    return (
        <AvatarGroup
            appearance="stack"
            maxCount={maxCount || 4}
            data={data}
            size="large"
            isTooltipDisabled
            showMoreButtonProps={{
                style: {
                    margin: 0,
                    width: '42px',
                    height: '42px',
                    fontSize: '14px'
                }
            }}
            // custom dropdown
            overrides={{
                AvatarGroupItem: {
                    render: (Component, props, index) => {
                        const avatarItem = <Component {...props} key={index} />;
                        return (
                            <ListItem
                                key={data[index].id}
                                onClick={() => handleClickAvatar(data[index])}
                                sx={{
                                    p: 0,
                                    '& > button': {
                                        cursor: isClickable ? 'pointer' : 'default'
                                    }
                                }}
                            >
                                {avatarItem}
                            </ListItem>
                        );
                    }
                }
            }}
        />
    );
};

export default GroupOfAvatars;
