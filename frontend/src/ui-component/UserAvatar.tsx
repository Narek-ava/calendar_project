import { useCallback } from 'react';
import { colors } from '../store/constant';
import { Avatar, Typography } from '@material-ui/core';
import { IEmployee } from '../models/IEmployee';
import { useTheme } from '@mui/material/styles';
import { replaceMinioToLocalhost } from '../utils/functions/uploading-images-helpers';
import { SxProps } from '@material-ui/system';

interface UserAvatarProps {
    employee: IEmployee;
    sx?: SxProps;
}

const UserAvatar = ({ employee, sx }: UserAvatarProps) => {
    const theme = useTheme();
    const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);

    return (
        <Avatar
            src={getLogo(employee.avatar || employee.user.avatar)}
            sx={{
                backgroundColor: employee?.background_color ? `#${employee?.background_color}` : colors.blue.value,
                color: theme.palette.getContrastText(employee?.background_color ? `#${employee?.background_color}` : colors.blue.value),
                width: 40,
                height: 40,
                ...sx
            }}
        >
            <Typography fontSize="large" sx={{ color: 'inherit' }}>
                {employee?.user.firstname.charAt(0).toUpperCase()}
            </Typography>
        </Avatar>
    );
};

export default UserAvatar;
