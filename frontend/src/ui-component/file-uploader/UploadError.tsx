import { LinearProgress, Typography } from '@material-ui/core';
import { Fragment } from 'react';
import { FileError } from 'react-dropzone';
import FileHeader from './FileHeader';

export interface UploadErrorProps {
    file: File;
    onDelete: (file: File) => void;
    errors: FileError[];
}

const UploadError = ({ file, onDelete, errors }: UploadErrorProps) => (
    <Fragment key={file.name}>
        <FileHeader file={file} onDelete={onDelete} errors={errors} />
        <LinearProgress color="error" variant="determinate" value={100} />
        {errors.map((error) => (
            <div key={error.code}>
                <Typography color="error">{error.message}</Typography>
            </div>
        ))}
    </Fragment>
);

export default UploadError;
