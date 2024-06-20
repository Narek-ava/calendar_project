import { useCallback, useEffect, useState } from 'react';
import { FileError, FileRejection, useDropzone } from 'react-dropzone';

// mui
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddRounded from '@material-ui/icons/AddRounded';
import { styled } from '@mui/material/styles';
import { Button, Stack, Theme } from '@mui/material';

// project imports
import UploadError from './UploadError';
import SingleFileUpload from './SingleFileUpload';
import { ImageFile, ImageBlob } from '../../views/account-profile/profile/avatar/ProfileAvatar';
import useBoolean from '../../hooks/useBoolean';
import ImageCropper from './ImageCropper';
import { StepContentProps } from '../../views/scheduling-widget/widget-wizard/types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { openConfirmPopup } from '../../store/confirmPopupSlice';

export const fileMaxSize = 20000; // KB

function getNewId() {
    return Date.now() + Math.random();
}

export interface UploadableFile {
    id: string | number | undefined;
    file: ImageFile | ImageBlob;
    errors: FileError[];
    url: string | null;
    preview?: string;
    isUploaded?: boolean;
}

const buttonSize = 80;

const useStyles = makeStyles((theme: Theme) => ({
    uploadButton: {
        p: 2.25,
        width: buttonSize,
        height: buttonSize,
        border: 'none',
        '&:hover': {
            border: 'none'
        }
    }
}));

const DropZoneStyle = styled('div')(({ theme }) => ({
    width: buttonSize,
    height: buttonSize,
    fontSize: 24,
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing(0.5),
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    '&:hover': { opacity: 0.72 }
}));

export interface AttachmentVariants {
    uploadedFiles: UploadableFile[];
    toUpload: UploadableFile[];
    uploadedUrls: string[];
}

export interface FileAttachmentProps {
    matchSm: boolean;
    attachments: StepContentProps['attachments'];
    setAttachments: StepContentProps['setAttachments'];
    error: string;
    setError: (data: string) => void;
    attachmentsIdsToDelete?: (number | string)[];
    setAttachmentsIdsToDelete?: (data: (number | string)[]) => void;
    uploadedImagesUrls?: string[] | null;
    setUploadedImagesUrls?: (data: string[] | null) => void;
    disableFileEdit?: boolean;
}

const AttachmentsUpload = ({
    matchSm,
    attachments,
    setAttachments,
    error,
    setError,
    attachmentsIdsToDelete,
    setAttachmentsIdsToDelete,
    disableFileEdit
}: FileAttachmentProps) => {
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const [selectedFile, setSelectedFile] = useState<UploadableFile | null>(null);
    const { value: isEditorOpened, off: closeEditor, on: openEditor } = useBoolean();

    const { isSubmitting } = useAppSelector((state) => state.submitting);

    const onDrop = useCallback(
        (accFiles: File[], rejFiles: FileRejection[]) => {
            const mappedAcc = accFiles.map((file) => ({ file, errors: [], preview: URL.createObjectURL(file), id: getNewId(), url: null }));
            rejFiles.forEach((file) => {
                file.errors.forEach((err) => {
                    if (err.code === 'file-too-large') {
                        err.message = 'File is larger than 20mb';
                    }
                    if (err.code === 'too-many-files') {
                        setError('Error: Too many Files');
                        file.errors = [];
                    }
                });
            });
            const mappedRej = rejFiles.map((rej) => ({ ...rej, preview: URL.createObjectURL(rej.file), id: getNewId(), url: null }));
            const files = [...attachments, ...mappedAcc, ...mappedRej];
            setAttachments(files);
        },
        [attachments]
    );

    useEffect(() => {
        if (attachments.length < 6 && error) {
            setError('');
        }
    }, [attachments]);

    const selectFile = (fileWrapper: UploadableFile) => {
        setSelectedFile(fileWrapper);
        openEditor();
    };

    const setNewImage = (newFileWrapper: UploadableFile) => {
        const targetIndex = attachments.findIndex((fileWrapper) => fileWrapper.id === newFileWrapper.id);
        if (targetIndex !== -1) {
            // delete previous file
            handleDeleteFile(attachments[targetIndex]);
            const updatedFiles: UploadableFile[] = [...attachments];
            updatedFiles[targetIndex] = newFileWrapper;
            setAttachments(updatedFiles);
        }
    };

    const handleDeleteFile = (file: UploadableFile) => {
        if (attachmentsIdsToDelete && setAttachmentsIdsToDelete) {
            let id: number | string;
            // check if ID was given by Image server (integer) or by generate via Math.random() when making file from url
            if (Number.isInteger(file.id)) {
                id = Number(file.id);
            } else {
                id = file.url!;
            }
            const idsToDelete = [...attachmentsIdsToDelete, ...(id ? [id] : [])];
            setAttachmentsIdsToDelete(idsToDelete);
            const files = attachments.filter((fileWrapper) => fileWrapper.id !== file.id);
            setAttachments(files);
        }
    };

    const confirmDeleteImage = (file: UploadableFile) => {
        dispatch(
            openConfirmPopup({
                onConfirm: () => handleDeleteFile(file),
                confirmText: `Delete`,
                text: `Are you sure you want to delete this Image?`
            })
        );
    };

    const onDelete = (fw: UploadableFile) => {
        if (fw.isUploaded) {
            confirmDeleteImage(fw);
        } else {
            const files = attachments.filter((fileWrapper) => fileWrapper.file !== fw.file);
            setAttachments(files);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        multiple: true,
        maxFiles: 5 - attachments.length,
        onDrop,
        // accept: ['image/*'],
        accept: ['image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/gif'],
        maxSize: fileMaxSize * 1024 //  20000 * 1024 = 20mb
    });

    return (
        <>
            <Stack direction="row" mt={attachments.length > 0 ? 3 : 0} sx={{ pl: -1 }} flexWrap="wrap">
                {attachments.map((fileWrapper) => (
                    <Grid item key={fileWrapper.id} sx={{ ml: 1, mb: 1 }}>
                        {fileWrapper.errors.length > 0 ? (
                            <UploadError
                                setSelectedFile={selectFile}
                                fileWrapper={fileWrapper}
                                errors={fileWrapper.errors}
                                onDelete={onDelete}
                            />
                        ) : (
                            <SingleFileUpload
                                disableFileEdit={disableFileEdit}
                                setSelectedFile={selectFile}
                                onDelete={onDelete}
                                fileWrapper={fileWrapper}
                            />
                        )}
                    </Grid>
                ))}
                {attachments.length < 5 && !isSubmitting && (
                    <DropZoneStyle
                        {...getRootProps()}
                        sx={{
                            ...(isDragActive && { opacity: 0.72 }),
                            marginLeft: attachments.length > 0 ? 2 : 0
                        }}
                    >
                        <input {...getInputProps()} />

                        <Button variant="outlined" size="large" className={classes.uploadButton}>
                            <AddRounded />
                        </Button>
                    </DropZoneStyle>
                )}
                {selectedFile && (
                    <ImageCropper open={isEditorOpened} incomingImage={selectedFile} setNewImage={setNewImage} closeEditor={closeEditor} />
                )}
            </Stack>
        </>
    );
};

export default AttachmentsUpload;
