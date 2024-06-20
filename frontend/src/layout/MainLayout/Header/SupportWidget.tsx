import { Avatar, ButtonBase, Tooltip } from '@mui/material';
import { useTheme } from '@material-ui/core/styles';
import ContactSupportOutlined from '@material-ui/icons/ContactSupportOutlined';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { setShowSupportWidget } from '../../../store/slices/layoutSlice';

const SupportWidget = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { showSupportWidget } = useAppSelector((state) => state.layout);

    const handleClick = () => {
        dispatch(setShowSupportWidget(!showSupportWidget));
    };

    return (
        <Tooltip title="Support" placement="top" arrow>
            <ButtonBase sx={{ borderRadius: '12px', ml: 2 }}>
                <Avatar
                    variant="rounded"
                    // className={classes.headerAvatar}
                    onClick={handleClick}
                    color="inherit"
                    sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.mediumAvatar,
                        transition: 'all .2s ease-in-out',
                        background:
                            showSupportWidget || theme.palette.mode === 'dark'
                                ? theme.palette.secondary.main
                                : theme.palette.secondary.light,
                        color:
                            showSupportWidget || theme.palette.mode === 'dark'
                                ? theme.palette.secondary.light
                                : theme.palette.secondary.dark
                    }}
                >
                    <ContactSupportOutlined sx={{ fontSize: 18 }} />
                </Avatar>
            </ButtonBase>
        </Tooltip>
    );
};

export default SupportWidget;
