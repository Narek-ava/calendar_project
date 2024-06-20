import { Typography } from '@material-ui/core';
import { SxProps } from '@material-ui/system';
import { MouseEventHandler } from 'react';

export type TypographyVariants =
    | 'subtitle1'
    | 'subtitle2'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'button'
    | 'overline'
    | 'inherit'
    | undefined;

interface EllipsisTypographyProps {
    maxWidth?: number;
    text: string | null;
    ml?: number;
    mr?: number;
    bold?: boolean;
    sx?: SxProps;
    variant?: TypographyVariants;
    onClick?: MouseEventHandler;
}

const EllipsisTypography = ({ maxWidth = 300, text, ml = 1, mr, bold, sx, variant = 'subtitle1', onClick }: EllipsisTypographyProps) => (
    <Typography
        variant={variant}
        color="inherit"
        sx={{
            ml,
            mr,
            maxWidth: `${maxWidth}px`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: bold ? 'bold' : undefined,
            cursor: onClick ? 'pointer' : 'default',
            ...sx
        }}
        onClick={onClick}
    >
        {text}
    </Typography>
);

export default EllipsisTypography;
