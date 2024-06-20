import { FC, useCallback } from 'react';
import { SxProps } from '@material-ui/system';
import { Theme, useTheme } from '@material-ui/core/styles';
import { Stack } from '@material-ui/core';

interface CollapsibleTitleProps {
    isOpened: boolean;
    onOpen: () => void;
    matchSm: boolean;
    hovered?: boolean;
}

const CollapsibleTitle: FC<CollapsibleTitleProps> = ({ children, isOpened, onOpen, matchSm, hovered = true }) => {
    const theme = useTheme();
    const desktopBorderRadius = useCallback(() => (isOpened ? '8px 8px 0 0' : '8px'), [matchSm, isOpened]);

    const tabStyles = useCallback(
        () =>
            ({
                borderRadius: matchSm ? 'none' : desktopBorderRadius,
                backgroundColor: isOpened ? theme.palette.primary.light : theme.palette.background.default,
                padding: '12px 16px 8px',
                cursor: hovered ? 'pointer' : 'default',
                transition: 'background-color 0.3s',
                ...(hovered && {
                    '&:hover': {
                        backgroundColor: theme.palette.primary.light
                    }
                }),
                minHeight: '44px',
                boxShadow: isOpened ? 2 : undefined
            } as SxProps<Theme>),
        [isOpened]
    );

    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={tabStyles()} onClick={onOpen}>
            {children}
        </Stack>
    );
};

export default CollapsibleTitle;
