import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useCallback, useEffect, useState } from 'react';
import { FileError, FileRejection, useDropzone } from 'react-dropzone';
import UploadError from './UploadError';
import SingleFileUpload from './SingleFileUpload';
import { Theme } from '@mui/material';
import { ImageData, ImageResponse } from '../../models/IImage';
import { replaceMinioToLocalhost } from '../../utils/functions/uploading-images-helpers';

const fileMaxSize = 20000; // KB

let currentId = 0;

function getNewId() {
    // eslint-disable-next-line no-plusplus
    return ++currentId;
}

export interface UploadableFile {
    id: number;
    file: File;
    errors: FileError[];
    url?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
    dropzone: {
        border: `2px dashed ${theme.palette.primary.main}`,
        borderRadius: theme.shape.borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.background.default,
        height: theme.spacing(10),
        outline: 'none',
        cursor: 'pointer'
    }
}));

interface UploadFieldProps {
    imageFieldName: string;
    setFieldValue: any;
    setPreview: (d: ImageData | null) => void;
    setIsLoading: (arg: boolean) => void;
}

const UploadField = ({ imageFieldName, setFieldValue, setPreview, setIsLoading }: UploadFieldProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const [_, __, helpers] = useField(name);
    const classes = useStyles();

    const [files, setFiles] = useState<UploadableFile[]>([]);
    const onDrop = useCallback((accFiles: File[], rejFiles: FileRejection[]) => {
        const mappedAcc = accFiles.map((file) => ({ file, errors: [], id: getNewId() }));
        const mappedRej = rejFiles.map((rej) => ({ ...rej, id: getNewId() }));
        setFiles((curr) => [...curr, ...mappedAcc, ...mappedRej]);
    }, []);

    useEffect(() => {
        if (files.length === 1 && files[0].errors.length === 1 && files[0].errors[0].code === 'too-many-files') {
            files[0].errors = [];
        }
        // setFieldValue(name, files);
        // helpers.setTouched(true);
    }, [files]);

    // function onUpload(file: File, url: string) {
    //     setFiles((curr) =>
    //         curr.map((fw) => {
    //             if (fw.file === file) {
    //                 return { ...fw, url };
    //             }
    //             return fw;
    //         })
    //     );
    // }

    const onUpload = (data: ImageResponse, filename: string) => {
        const preview = replaceMinioToLocalhost(data.preview);
        setPreview({
            url: preview,
            link: '',
            filename
        });
        setFieldValue(imageFieldName, [data.link]);
    };

    const onDelete = (file: File) => {
        setFiles((curr) => curr.filter((fw) => fw.file !== file));
        setPreview(null);
        setFieldValue(imageFieldName, imageFieldName === 'images' ? [] : null);
    };

    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,
        maxFiles: 1,
        onDrop,
        accept: ['image/*'],
        maxSize: fileMaxSize * 1024 // 300b * 1024 = 300KB
    });

    return (
        <>
            {files.length === 0 && (
                <Grid item sx={{ mb: 4 }}>
                    <div {...getRootProps({ className: classes.dropzone })}>
                        <input {...getInputProps()} />

                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        <p>Drop your image here or click to select file</p>
                    </div>
                </Grid>
            )}
            {files.map((fileWrapper) => (
                <Grid item key={fileWrapper.id}>
                    {fileWrapper.errors.length ? (
                        <UploadError file={fileWrapper.file} errors={fileWrapper.errors} onDelete={onDelete} />
                    ) : (
                        <SingleFileUpload onDelete={onDelete} onUpload={onUpload} file={fileWrapper.file} setIsLoading={setIsLoading} />
                    )}
                </Grid>
            ))}
        </>
    );
};

export default UploadField;
