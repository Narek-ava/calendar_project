import { useEffect, useState } from 'react';
import { ButtonBaseProps, ButtonBase } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import Portal from '../../../ui-component/Portal';
import { IconPlus } from '@tabler/icons';
import { Avatar, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const MotionIconButton = motion<ButtonBaseProps>(ButtonBase);

const useStyles = makeStyles((theme: Theme) => ({
    base: {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1,
        fontSize: '20px',
        borderRadius: '50%'
    },
    button: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.background.paper,
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        zIndex: 1
    }
}));

interface MobileAddNewButtonProps {
    onClick: () => void;
}

const MobileAddNewButton = ({ onClick }: MobileAddNewButtonProps) => {
    const classes = useStyles();
    const [isVisible, setIsVisible] = useState<boolean>(false);

    // const scrollToTop = () => {
    //     window.scrollTo({
    //         top: 0,
    //         behavior: 'smooth'
    //     });
    // };

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 60) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <Portal>
            <AnimatePresence>
                {isVisible && (
                    <MotionIconButton
                        key="button"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        // transition={{ type: 'spring', ease: 'easeOut' }}
                        exit={{ y: 20, opacity: 0 }}
                        className={classes.base}
                        sx={{ boxShadow: 3 }}
                        aria-label="add new event"
                        onClick={onClick}
                    >
                        <Avatar variant="rounded" className={classes.button} color="inherit">
                            <IconPlus stroke={1.5} size="40px" />
                        </Avatar>
                    </MotionIconButton>
                )}
            </AnimatePresence>
        </Portal>
    );
};

export default MobileAddNewButton;
