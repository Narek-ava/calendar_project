import { useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ImageData, ImageResponse } from '../models/IImage';
import { useAppDispatch } from '../hooks/redux';
import { SNACKBAR_OPEN } from '../store/actions';
import { SnackBarTypes } from '../store/snackbarReducer';
import RestartAlt from '@material-ui/icons/RestartAlt';
import { replaceMinioToLocalhost, uploadImageFile } from '../utils/functions/uploading-images-helpers';
import CBModal from './CBModal';
import { Theme, useMediaQuery } from '@material-ui/core';

interface ImageEditorProps {
    isOpen: boolean;
    incomingImage: ImageData | null;
    imageFieldName: string;
    setFieldValue: any;
    setPreview: (d: ImageData | null) => void;
    closeEditor: () => void;
    setIsLoading: (arg: boolean) => void;
}

const ImageEditor = ({ isOpen, incomingImage, imageFieldName, setFieldValue, setPreview, closeEditor, setIsLoading }: ImageEditorProps) => {
    const dispatch = useAppDispatch();
    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));

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

    const [cropper, setCropper] = useState<any>();
    const onUpload = (data: ImageResponse) => {
        const preview = replaceMinioToLocalhost(data.preview);
        setPreview({
            url: preview,
            link: '',
            filename: incomingImage?.filename
        });
        setFieldValue(imageFieldName, [data.link]);
    };

    const getCropData = async () => {
        if (typeof cropper !== 'undefined') {
            const blob = await fetch(cropper.getCroppedCanvas().toDataURL()).then((res) => res.blob());
            closeEditor();
            uploadImageFile({
                file: blob,
                name: incomingImage?.filename || '',
                onUpload,
                onError,
                setIsLoading
            });
        }
    };

    const resetCropper = () => {
        if (typeof cropper !== 'undefined') {
            cropper.reset();
        }
    };

    return (
        <CBModal
            maxWidth={matchSm ? false : 'md'}
            fullWidth
            fullScreen={matchSm}
            onClose={closeEditor}
            open={isOpen}
            title="Edit image"
            closeButtonText="Cancel"
            okButtonText="Save Image"
            onClickOk={getCropData}
            specialContent={
                <Button onClick={resetCropper} startIcon={<RestartAlt />}>
                    Drop changes
                </Button>
            }
        >
            {incomingImage && (
                <Stack spacing={2} sx={{ width: '100%' }}>
                    <Box sx={{ width: '100%' }}>
                        <Typography sx={{ fontStyle: 'italic', textAlign: 'right' }}>*Double click to move image</Typography>
                        <Cropper
                            style={{ height: 400, width: '100%' }}
                            zoomTo={0.5}
                            initialAspectRatio={1}
                            preview=".img-preview"
                            src={replaceMinioToLocalhost(incomingImage.url)}
                            viewMode={1}
                            minCropBoxHeight={10}
                            minCropBoxWidth={10}
                            background={false}
                            responsive
                            autoCropArea={1}
                            checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                            onInitialized={(instance) => {
                                setCropper(instance);
                            }}
                            guides
                        />
                    </Box>
                    <Box sx={{ display: 'inline-block', boxSizing: 'border-box' }}>
                        <Typography variant="h4">Result preview</Typography>
                        <Box
                            className="img-preview"
                            sx={{
                                width: '100%',
                                height: '300px',
                                overflow: 'hidden'
                            }}
                        />
                    </Box>
                </Stack>
            )}
        </CBModal>
    );
};

export default ImageEditor;
