import { useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Box, Button, Stack, Typography } from '@mui/material';
import RestartAlt from '@material-ui/icons/RestartAlt';
import SaveOutlined from '@material-ui/icons/SaveOutlined';
import { isString } from 'lodash';
import { fileMaxSize, UploadableFile } from './AttachmentsUpload';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { startSubmitting, stopSubmitting } from 'store/slices/SubmittingSlice';
import { SnackBarTypes } from '../../store/snackbarReducer';
import { SNACKBAR_OPEN } from '../../store/actions';
import CBModal from '../CBModal';
import { useMediaQuery } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';

interface ImageEditorProps {
    open: boolean;
    incomingImage: UploadableFile;
    setNewImage: (data: UploadableFile) => void;
    closeEditor: () => void;
}

const ImageCropper = ({ open, incomingImage, closeEditor, setNewImage }: ImageEditorProps) => {
    const dispatch = useAppDispatch();
    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));
    const [cropper, setCropper] = useState<any>();
    const { isSubmitting } = useAppSelector((state) => state.submitting);

    const showSnackbar = ({ alertSeverity, message }: { alertSeverity: SnackBarTypes; message: string }) => {
        dispatch({
            type: SNACKBAR_OPEN,
            open: true,
            message,
            variant: 'alert',
            alertSeverity,
            anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
    };

    const getCropData = () => {
        const getImage = new Promise<void>((resolve, reject) => {
            if (typeof cropper !== 'undefined') {
                try {
                    fetch(cropper.getCroppedCanvas().toDataURL())
                        .then((res) => res.blob())
                        .then((blob) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(blob);
                            const newFile = Object.assign(blob, {
                                name: incomingImage.file.name
                            });
                            const newFileWrapper = {
                                ...incomingImage,
                                ...(blob.size < fileMaxSize * 1024 && {
                                    errors: []
                                }),
                                file: newFile,
                                preview: URL.createObjectURL(blob),
                                ...(incomingImage.isUploaded && { isUploaded: false })
                            };
                            reader.onload = () => {
                                // saves new image
                                setNewImage(newFileWrapper);
                                closeEditor();
                                resolve();
                            };
                        })
                        .catch(() => {
                            reject();
                        });
                } catch (e) {
                    reject();
                }
            }
        });
        return getImage;
    };

    const resetCropper = () => {
        if (typeof cropper !== 'undefined') {
            cropper.reset();
        }
    };

    const handleCropImage = () => {
        dispatch(startSubmitting());
        getCropData()
            .then(() => {
                dispatch(stopSubmitting());
            })
            .catch(() => {
                showSnackbar({
                    message: 'An Error occurred while cropping image',
                    alertSeverity: SnackBarTypes.Error
                });
                dispatch(stopSubmitting());
            });
    };

    return (
        <CBModal
            open={open}
            maxWidth={matchSm ? false : 'md'}
            fullWidth
            fullScreen={matchSm}
            onClose={closeEditor}
            title="Edit image"
            okButtonText="Save Image"
            okButtonDisabled={isSubmitting}
            onClickOk={handleCropImage}
            okButtonStartIcon={<SaveOutlined />}
            closeButtonText="Cancel"
            specialContent={
                <Button onClick={resetCropper} startIcon={<RestartAlt />}>
                    Full Size
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
                            src={isString(incomingImage) ? incomingImage : incomingImage.preview}
                            viewMode={1}
                            minCropBoxHeight={10}
                            minCropBoxWidth={10}
                            background={false}
                            responsive
                            autoCropArea={1}
                            // checkCrossOrigin={false}
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

export default ImageCropper;
