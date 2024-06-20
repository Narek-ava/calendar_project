import { Stack } from '@material-ui/core';
import { Typography } from '@mui/material';
import ToggledTooltip, { ToggledTooltipProps } from './ToggledTooltip';

interface ToggledTooltipWithTitleProps {
    tooltipText: ToggledTooltipProps['title'];
    title: string;
}

// <Stack>
//     <Typography>Max image size: 20mb</Typography>
//     <Typography>Limit of images to upload : 5</Typography>
// </Stack>
// Attachments:

const ToggledTooltipWithTitle = ({ title, tooltipText }: ToggledTooltipWithTitleProps) => (
    <Stack direction="row" alignItems="center" mb={1}>
        <ToggledTooltip title={tooltipText} />
        <Typography>{title}</Typography>
    </Stack>
);

export default ToggledTooltipWithTitle;
