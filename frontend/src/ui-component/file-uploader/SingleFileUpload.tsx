import { Grid } from '@material-ui/core';
import FileHeader from './FileHeader';
import { ImageResponse } from '../../models/IImage';
import { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { SNACKBAR_OPEN } from '../../store/actions';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { uploadImageFile } from '../../utils/functions/uploading-images-helpers';

export interface SingleFileUploadProps {
    file: File;
    onDelete: (file: File) => void;
    // onUpload: (file: File, url: string) => void;
    onUpload: (data: ImageResponse, filename: string) => void;
    setIsLoading: (arg: boolean) => void;
}

const SingleFileUpload = ({ file, onDelete, onUpload, setIsLoading }: SingleFileUploadProps) => {
    const dispatch = useAppDispatch();
    const onError = () => {
        dispatch({
            type: SNACKBAR_OPEN,
            open: true,
            message: "Error: Image hasn't uploaded",
            variant: 'alert',
            alertSeverity: SnackBarTypes.Error,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
    };
    useEffect(() => {
        uploadImageFile({ file, name: file.name, onUpload, setIsLoading, onError });
    }, []);

    return (
        <Grid item sx={{ mb: 4 }} key={file.name}>
            <FileHeader file={file} onDelete={onDelete} onUpload={onUpload} />
        </Grid>
    );
};

export default SingleFileUpload;
