import { Button, Grid } from '@material-ui/core';
// import { axiosServices } from '../../utils/axios';
import { ImageResponse } from '../../models/IImage';
import { FileError } from 'react-dropzone';

export interface FileHeaderProps {
    file: File;
    onDelete: (file: File) => void;
    onUpload?: (data: ImageResponse, filename: string) => void;
    errors?: FileError[];
}

const FileHeader = ({ file, onDelete, onUpload, errors }: FileHeaderProps) => (
    // const upload = async () => {
    //     const data = new FormData();
    //     data.append('image', file);
    //     data.append('filename', file.name);
    //     data.append('name', 'image');
    //     try {
    //         const res = await axiosServices.post<ImageResponse>('/uploader/image', data, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data;'
    //             }
    //         });
    //         if (res.data && onUpload) {
    //             console.log('success', res.data);
    //             onUpload(res.data);
    //         }
    //     } catch (e) {
    //         console.log(e);
    //     }
    // };
    <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>{file.name}</Grid>
        <Grid item>
            {/*
            {!errors?.length && (
                <Button onClick={upload} variant="contained">
                    Upload
                </Button>
            )}
            */}
            <Button size="small" onClick={() => onDelete(file)}>
                Delete
            </Button>
        </Grid>
    </Grid>
);

export default FileHeader;
