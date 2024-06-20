import { useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Box, Button, Stack, Typography } from '@mui/material';
import RestartAlt from '@material-ui/icons/RestartAlt';
import { ImageBlob, ImageFile } from './ProfileAvatar';
import { isString } from 'lodash';
import CBModal from '../../../../ui-component/CBModal';
import { useMediaQuery } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';

interface ImageEditorProps {
    incomingImage: ImageFile | ImageBlob;
    setNewImage: (data: ImageFile | ImageBlob) => void;
    closeEditor: () => void;
    handleUploadAvatar: () => void;
    isEditorOpened: boolean;
}

const AvatarEditor = ({ incomingImage, closeEditor, setNewImage, handleUploadAvatar, isEditorOpened }: ImageEditorProps) => {
    const [cropper, setCropper] = useState<any>();
    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));

    const getCropData = async () => {
        if (typeof cropper !== 'undefined') {
            const blob = await fetch(cropper.getCroppedCanvas().toDataURL()).then((res) => res.blob());
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            const fileWithPreview = Object.assign(blob, {
                preview: URL.createObjectURL(blob),
                name: incomingImage.name
            });
            reader.onload = () => {
                setNewImage(fileWithPreview);
                closeEditor();
            };
        }
    };

    const resetCropper = () => {
        if (typeof cropper !== 'undefined') {
            cropper.reset();
        }
    };

    return (
        <CBModal
            title="Edit image"
            maxWidth={matchSm ? false : 'md'}
            fullWidth
            fullScreen={matchSm}
            onClose={closeEditor}
            open={isEditorOpened}
            closeButtonText="Cancel"
            onClickOk={() => {
                getCropData();
                handleUploadAvatar();
            }}
            okButtonText="Save Image"
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

export default AvatarEditor;
