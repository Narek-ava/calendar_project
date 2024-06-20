import { FileError } from 'react-dropzone';
import { UploadableFile } from './AttachmentsUpload';
import { Box, IconButton, Paper, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { IconResize } from '@tabler/icons';
import { useCallback } from 'react';
import Cancel from '@material-ui/icons/Cancel';
import { SingleFileUploadProps } from './SingleFileUpload';
import { useAppSelector } from '../../hooks/redux';

export interface FileHeaderProps {
    fileWrapper: UploadableFile;
    onDelete: SingleFileUploadProps['onDelete'];
    errors?: FileError[];
    setSelectedFile: (data: UploadableFile) => void;
    disableFileEdit?: boolean;
}

const FileView = ({ fileWrapper, onDelete, setSelectedFile, disableFileEdit }: FileHeaderProps) => {
    const { isSubmitting } = useAppSelector((state) => state.submitting);

    const handleEditFile = useCallback(() => {
        setSelectedFile(fileWrapper);
    }, [fileWrapper]);
    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
                p: 0,
                m: 0.5,
                width: 80,
                height: 80,
                borderRadius: 0.25,
                position: 'relative',
                flexShrink: 0
            }}
        >
            <Paper
                variant="outlined"
                component="img"
                src={fileWrapper.preview}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', borderRadius: 1 }}
            />
            {!disableFileEdit && (
                <Box sx={{ bottom: '2px', left: '2px', position: 'absolute' }}>
                    <IconButton
                        disabled={isSubmitting}
                        size="small"
                        onClick={handleEditFile}
                        sx={{
                            borderRadius: '4px',
                            p: '1px',
                            color: 'common.white',
                            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48)
                            }
                        }}
                    >
                        <IconResize />
                    </IconButton>
                </Box>
            )}
            <Box sx={{ top: '-10px', right: '-10px', position: 'absolute' }}>
                <IconButton
                    disabled={isSubmitting}
                    size="small"
                    onClick={() => onDelete(fileWrapper)}
                    sx={{
                        p: '1px',
                        color: 'common.white',
                        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                        '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48)
                        }
                    }}
                >
                    <Cancel />
                </IconButton>
            </Box>
        </Stack>
    );
};

export default FileView;
