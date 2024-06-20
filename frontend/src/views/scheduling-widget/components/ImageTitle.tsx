import { styled } from '@material-ui/core/styles';
import { changeImageSize, replaceMinioToLocalhost } from '../../../utils/functions/uploading-images-helpers';
import { Box } from '@mui/material';
import { ReactNode } from 'react';

const StyledImageName = styled('div')(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    height: '170px',

    '& img': {
        height: '100%',
        width: '100%',
        objectFit: 'contain',
        display: 'block',

        '@media(max-width: 600px)': {
            height: '150px'
        }
    },

    '& .MuiBox-root.image-title-content': {
        overflow: 'auto',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.widget.title,
        fontSize: '24px',
        lineHeight: '28px',
        position: 'absolute',
        top: 0,
        backgroundColor: `${theme.palette.grey[900]}60`,
        padding: theme.spacing(2),

        '@media(max-width: 768px)': {
            fontSize: '18px',
            lineHeight: '22px'
        },
        '@media(max-width: 600px)': {
            height: '150px'
        }
    }
}));

interface ImageTitleProps {
    imageUrl?: string;
    title: string | ReactNode;
    altText?: string;
}

const ImageTitle = ({ imageUrl, title, altText }: ImageTitleProps) => (
    <StyledImageName>
        {imageUrl && (
            <img
                src={changeImageSize({
                    url: replaceMinioToLocalhost(imageUrl),
                    size: 'medium'
                })}
                alt={altText}
            />
        )}
        <Box className="image-title-content">{title}</Box>
    </StyledImageName>
);

export default ImageTitle;
