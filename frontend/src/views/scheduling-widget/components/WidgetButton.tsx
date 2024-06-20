import { styled, useTheme } from '@material-ui/core/styles';
import { Avatar, Stack, Typography, Box } from '@material-ui/core';
import { stringToColor } from '../../../store/constant';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import Done from '@material-ui/icons/Done';
import { ReactNode } from 'react';

const StyledServiceItem = styled(Stack, {
    shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
    cursor: 'pointer',
    background: isSelected
        ? `linear-gradient(45deg, ${theme.palette.widget.darkGreen}, ${theme.palette.widget.lightGreen})`
        : theme.palette.grey[100],
    borderRadius: '10px',
    transition: 'background-color 0.3s',
    marginBottom: theme.spacing(1),

    '&:hover': {
        backgroundColor: isSelected ? 'inherit' : theme.palette.grey[300]
    }
}));

const StyledButtonWrap = styled(Stack)(({ theme }) => ({
    width: '100%',
    padding: '10px 16px',
    minHeight: '48px'
}));

const StyledIcon = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 10%',
    color: isSelected ? theme.palette.widget.text : theme.palette.grey[400]
}));

const StyledName = styled(Typography)(({ theme }) => ({
    fontSize: '16px',
    fontWeight: 700,
    color: theme.palette.widget.text,
    marginBottom: '2px',
    display: 'flex',

    '& .MuiSvgIcon-root': {
        marginLeft: '7px',
        width: '18px'
    }
}));

const StyledBottomContent = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
    display: 'flex',
    alignItems: 'center',
    color: isSelected ? theme.palette.widget.text : theme.palette.widget.buttonDetails,

    '& .MuiSvgIcon-root': {
        fontSize: '20px'
    }
}));

interface WidgetButtonProps {
    isSelected: boolean;
    name: string;
    onChoose: () => void;
    imageUrl?: string;
    bottomContent?: string | ReactNode;
    avatarContent?: string | ReactNode;
    nameIcon?: ReactNode;
}

const WidgetButton = ({ isSelected, name, onChoose, imageUrl, bottomContent, avatarContent, nameIcon }: WidgetButtonProps) => {
    const theme = useTheme();

    return (
        <StyledServiceItem isSelected={isSelected} direction="row" onClick={onChoose} id={`${name}-container`}>
            <StyledButtonWrap direction="row" alignItems="center" spacing={1}>
                <Avatar
                    color="inherit"
                    sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: imageUrl ? 'transparent' : stringToColor(name),
                        color: '#fff'
                    }}
                    src={imageUrl}
                >
                    {avatarContent || (
                        <Typography
                            sx={{
                                fontSize: '20px',
                                color: theme.palette.getContrastText(stringToColor(name))
                            }}
                        >
                            {name.charAt(0).toUpperCase()}
                        </Typography>
                    )}
                </Avatar>
                <Box display="flex" flexDirection="column">
                    <StyledName>
                        {name}
                        {nameIcon}
                    </StyledName>
                    <StyledBottomContent isSelected={isSelected}>{bottomContent}</StyledBottomContent>
                </Box>
            </StyledButtonWrap>
            <StyledIcon isSelected={isSelected}>{isSelected ? <Done /> : <ArrowForwardIos />}</StyledIcon>
        </StyledServiceItem>
    );
};
export default WidgetButton;
