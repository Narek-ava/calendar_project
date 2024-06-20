import { styled } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import Check from '@material-ui/icons/Check';

const StyledPatternBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'start' && prop !== 'end'
})<{ isActive: boolean; start: string; end: string }>(({ theme, isActive, start, end }) => ({
    width: '100%',
    height: '150px',
    background: `linear-gradient(135deg, ${start}, ${end})`,
    cursor: 'pointer',
    borderRadius: '10px',
    border: isActive ? `5px solid ${theme.palette.primary.main}` : 'none',

    '& .MuiSvgIcon-root': {
        margin: '10px',
        fontSize: '30px',
        color: theme.palette.primary.main
    }
}));

interface BgPatternBoxProps {
    isActive: boolean;
    start: string;
    end: string;
    onClick: () => void;
}

const BgPatternBox = ({ isActive, start, end, onClick }: BgPatternBoxProps) => (
    <StyledPatternBox isActive={isActive} start={start} end={end} onClick={onClick}>
        {isActive && <Check />}
    </StyledPatternBox>
);

export default BgPatternBox;
