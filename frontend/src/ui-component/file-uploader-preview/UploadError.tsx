import { LinearProgress, Typography } from '@material-ui/core';
import { Fragment } from 'react';
import { FileError } from 'react-dropzone';
import FileView from './FileView';
import { UploadableFile } from './AttachmentsUpload';
import { Box } from '@mui/material';
import { SingleFileUploadProps } from './SingleFileUpload';

export interface UploadErrorProps {
    fileWrapper: UploadableFile;
    onDelete: SingleFileUploadProps['onDelete'];
    errors: FileError[];
    setSelectedFile: (file: UploadableFile) => void;
}

const UploadError = ({ fileWrapper, onDelete, errors, setSelectedFile }: UploadErrorProps) => (
    <>
        {errors.length > 0 && (
            <Fragment key={fileWrapper.id}>
                <FileView fileWrapper={fileWrapper} onDelete={onDelete} errors={errors} setSelectedFile={setSelectedFile} />
                <LinearProgress color="error" variant="determinate" value={100} />
                {errors.map((error) => (
                    <Box key={error.code} sx={{ mb: 2, maxWidth: '80px' }}>
                        <Typography color="error">{error.message}</Typography>
                    </Box>
                ))}
            </Fragment>
        )}
    </>
);

export default UploadError;
