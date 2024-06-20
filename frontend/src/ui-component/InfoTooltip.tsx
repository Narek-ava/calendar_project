import { useState, useCallback, useRef, useEffect, ReactChild } from 'react';
import { Tooltip } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

interface InfoTooltipProps {
    text: string | ReactChild;
}

const InfoTooltip = ({ text }: InfoTooltipProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleClickOutside = useCallback(
        (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                handleClose();
            }
        },
        [handleClose]
    );

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);

        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);

    return (
        <Tooltip
            ref={tooltipRef}
            title={text}
            sx={{ ml: 1 }}
            disableHoverListener
            open={isOpen}
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            onClick={handleOpen}
        >
            <InfoOutlinedIcon color="secondary" fontSize="small" />
        </Tooltip>
    );
};

export default InfoTooltip;
