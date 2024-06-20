import { ReactChild, ReactFragment, ReactPortal } from 'react';

// mui
import { IconButton, Tooltip } from '@material-ui/core';
import InfoOutlined from '@material-ui/icons/InfoOutlined';

// project imports
import useBoolean from '../../hooks/useBoolean';

export interface ToggledTooltipProps {
    title: boolean | ReactChild | ReactFragment | ReactPortal;
}

const ToggledTooltip = ({ title }: ToggledTooltipProps) => {
    const { value: isTooltipOpened, off: closeTooltip, on: openTooltip, toggle: toggleTooltip } = useBoolean();

    return (
        <Tooltip open={isTooltipOpened} onOpen={openTooltip} onClose={closeTooltip} title={title} placement="top-start">
            <IconButton onClick={() => toggleTooltip(!isTooltipOpened)}>
                <InfoOutlined sx={{ fontSize: '20px' }} />
            </IconButton>
        </Tooltip>
    );
};

export default ToggledTooltip;
