import { ReactNode, useMemo } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Theme, useMediaQuery, Box } from '@material-ui/core';
import { styled, useTheme } from '@material-ui/core/styles';

interface Colors {
    color: string;
    bgColor: string;
    contentBgColor: string;
    footerBgColor: string;
}

const StyledDialog = styled(Dialog, { shouldForwardProp: (prop) => prop !== 'matchSm' && prop !== 'colors' && prop !== 'headerColor' })<{
    matchSm: boolean;
    colors: Colors;
    headerColor?: string;
}>(({ theme, matchSm, colors, headerColor }) => ({
    '& .MuiDialog-paper': {
        padding: 0
    },

    '& .MuiDialogTitle-root': {
        backgroundColor: headerColor || colors.bgColor,
        color: colors.color,
        fontSize: '1rem',
        lineHeight: '1.3rem',
        textAlign: 'center',
        padding: matchSm ? theme.spacing(2, 1) : theme.spacing(2, 3)
    },

    '& .MuiDialogContent-root': {
        padding: `${theme.spacing(3)} !important`,
        backgroundColor: colors.contentBgColor
    },

    '& .MuiDialogActions-root': {
        background: colors.footerBgColor,
        padding: matchSm ? theme.spacing(1, 2) : theme.spacing(2, 3),

        '&:empty': {
            display: 'none'
        }
    },
    '& .ok-btn': {
        color: colors.color,
        background: colors.bgColor,

        '&:hover': {
            color: colors.color,
            background: colors.bgColor
        }
    },
    '& .cancel-btn': {
        color: colors.bgColor,
        borderColor: colors.bgColor,

        '&:hover': {
            color: colors.bgColor,
            borderColor: colors.bgColor
        }
    }
}));

interface CBModalProps {
    id?: string;
    open: boolean;
    onClose: () => void;
    title?: ReactNode | string;
    children?: ReactNode | string | null;
    closeButtonText?: string;
    fullWidth?: boolean;
    fullScreen?: boolean;
    maxWidth?: 'xl' | 'md' | 'mobile' | 'sm' | 'xs' | 'lg' | false;
    okButtonText?: string;
    onClickOk?: () => void;
    okButtonDisabled?: boolean;
    specialContent?: ReactNode | string;
    okButtonStartIcon?: ReactNode;
    okButtonFormId?: string;
    contentRef?: any;
    hideCloseButton?: boolean;
    severity?: 'error' | 'warning' | 'success' | 'info';
    headerColor?: string;
}

const CBModal = ({
    id,
    open,
    onClose,
    title,
    children,
    closeButtonText = 'Close',
    fullWidth,
    fullScreen,
    maxWidth,
    okButtonText,
    onClickOk,
    okButtonDisabled = false,
    okButtonStartIcon,
    okButtonFormId,
    specialContent,
    contentRef,
    hideCloseButton,
    severity = 'info',
    headerColor
}: CBModalProps) => {
    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));
    const theme = useTheme();

    const colors: Colors = useMemo(() => {
        switch (severity) {
            case 'warning':
                return {
                    color: theme.palette.grey[900],
                    bgColor: theme.palette.warning.dark,
                    contentBgColor: '#fff',
                    footerBgColor: theme.palette.grey[200]
                };
            case 'error':
                return {
                    color: '#fff',
                    bgColor: theme.palette.error.main,
                    contentBgColor: '#fff',
                    footerBgColor: theme.palette.grey[200]
                };
            case 'success':
                return {
                    color: theme.palette.grey[900],
                    bgColor: theme.palette.success.main,
                    contentBgColor: '#fff',
                    footerBgColor: theme.palette.grey[200]
                };
            default:
                return {
                    color: '#fff',
                    bgColor: theme.palette.primary.main,
                    contentBgColor: '#eee',
                    footerBgColor: '#fff'
                };
        }
    }, [severity, theme]);

    return (
        <StyledDialog
            id={id}
            open={open}
            onClose={onClose}
            fullWidth={fullWidth}
            maxWidth={maxWidth}
            matchSm={matchSm}
            fullScreen={fullScreen}
            colors={colors}
            headerColor={headerColor}
        >
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent ref={contentRef}>{children}</DialogContent>
            <DialogActions>
                {specialContent && <Box mr="auto">{specialContent}</Box>}
                {okButtonText && (onClickOk || okButtonFormId) && (
                    <Button
                        className="ok-btn"
                        size={matchSm ? 'small' : 'medium'}
                        type={onClickOk ? 'button' : 'submit'}
                        onClick={onClickOk || undefined}
                        variant="contained"
                        disabled={okButtonDisabled}
                        startIcon={okButtonStartIcon}
                        form={okButtonFormId}
                        id={id}
                    >
                        {okButtonText}
                    </Button>
                )}
                {!hideCloseButton && (
                    <Button className="cancel-btn" size={matchSm ? 'small' : 'medium'} variant="outlined" onClick={onClose}>
                        {closeButtonText}
                    </Button>
                )}
            </DialogActions>
        </StyledDialog>
    );
};

export default CBModal;
