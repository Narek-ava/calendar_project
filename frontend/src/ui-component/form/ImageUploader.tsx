import { alpha, CardMedia, Grid, IconButton, Skeleton, Stack, Theme, Tooltip } from '@material-ui/core';
import AspectRatio from '@material-ui/icons/AspectRatio';
import DeleteForever from '@material-ui/icons/DeleteForever';
import UploadField from 'ui-component/file-uploader/UploadField';
import { ReactChild, useState } from 'react';
import { axiosServices } from 'utils/axios';
import { openConfirmPopup } from 'store/confirmPopupSlice';
import { SnackBarTypes } from 'store/snackbarReducer';
import { useAppDispatch } from 'hooks/redux';
import { makeStyles } from '@material-ui/styles';
import { ImageData } from '../../models/IImage';
import { FormikErrors } from 'formik';
import ImageEditor from 'ui-component/ImageEditor';
import useAuth from '../../hooks/useAuth';
import { replaceMinioToLocalhost } from '../../utils/functions/uploading-images-helpers';
import LabelWithInfo from '../LabelWithInfo';
import useShowSnackbar from '../../hooks/useShowSnackbar';

const useStyles = makeStyles((theme: Theme) => ({
    cardMedia: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom: theme.spacing(4),
        '&:hover': {
            '& > img': {
                backdropFilter: 'brightness(70%)',
                filter: 'brightness(70%) blur(2px)'
            },
            '& > div': {
                opacity: 1,
                visibility: 'visible',
                transform: 'translateY(0)'
            }
        }
    },
    cardImage: {
        borderRadius: theme.shape.borderRadius,
        // width: '100%',
        maxWidth: '600px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        objectFit: 'contain',
        objectPosition: 'center',
        background: theme.palette.background.default,
        height: theme.spacing(30),
        outline: 'none',
        transition: '0.3s'
    },
    cardButtons: {
        position: 'absolute',
        background: alpha(theme.palette.background.default, 0.7),
        borderRadius: theme.shape.borderRadius,
        padding: '5px',
        // right: '20px',
        // top: '20px',
        opacity: 0,
        transform: 'translateY(-10px)',
        visibility: 'hidden',
        transition: '0.3s'
    }
}));

type Props = {
    initialPreview: ImageData | null;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => Promise<void> | Promise<FormikErrors<any>>;
    clearFormImage: () => void;
    name: string;
    imageFieldName: string;
    infoText?: string | ReactChild;
};

const ImageUploader = ({ initialPreview, setFieldValue, name, imageFieldName, clearFormImage, infoText }: Props) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { checkAuthentication } = useAuth();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<ImageData | null>(initialPreview);

    const { showSnackbar } = useShowSnackbar();

    const deleteImage = async (id: number | undefined) => {
        if (id) {
            try {
                const res = await axiosServices.delete(`/uploader/image/${id}`);
                if (res.data) {
                    showSnackbar({
                        message: 'Image deleted',
                        alertSeverity: SnackBarTypes.Success
                    });
                    checkAuthentication().then(() => {
                        setPreview(null);
                        clearFormImage();
                    });
                }
            } catch (e) {
                showSnackbar({
                    message: "Image hasn't deleted",
                    alertSeverity: SnackBarTypes.Error
                });
            }
        }
    };

    const confirmDeleteImage = () => {
        if (preview && preview.id) {
            dispatch(
                openConfirmPopup({
                    onConfirm: () => deleteImage(preview.id),
                    confirmText: `Delete`,
                    text: 'Are you sure you want to delete this image?'
                })
            );
        } else {
            setPreview(null);
            clearFormImage();
        }
    };

    const handleEditClose = () => {
        setIsEditOpen(false);
    };

    const handleResize = () => {
        setIsEditOpen(true);
    };

    return (
        <>
            <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                <LabelWithInfo label={name} infoText={infoText} />
            </Grid>
            <Grid item xs={12} sm={9} lg={6}>
                {!isLoading && preview && preview.url && (
                    <>
                        <CardMedia className={classes.cardMedia}>
                            {preview && <img src={replaceMinioToLocalhost(preview.url)} className={classes.cardImage} alt="service" />}
                            <Stack className={classes.cardButtons} direction="row" alignItems="center" spacing={2} justifyContent="start">
                                <Tooltip title="Edit image">
                                    <IconButton size="large" color="primary" aria-label="edit image" onClick={handleResize}>
                                        <AspectRatio />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete image">
                                    <IconButton size="large" color="error" aria-label="delete image" onClick={confirmDeleteImage}>
                                        <DeleteForever />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </CardMedia>
                    </>
                )}
                {!isLoading && !preview?.url && (
                    <UploadField
                        imageFieldName={imageFieldName}
                        setFieldValue={setFieldValue}
                        setPreview={setPreview}
                        setIsLoading={setIsLoading}
                    />
                )}
                {isLoading && <Skeleton animation="wave" width="320px" height="240px" />}
            </Grid>
            <ImageEditor
                isOpen={isEditOpen}
                incomingImage={preview}
                imageFieldName="images"
                setFieldValue={setFieldValue}
                setPreview={setPreview}
                closeEditor={handleEditClose}
                setIsLoading={setIsLoading}
            />
        </>
    );
};

export default ImageUploader;
