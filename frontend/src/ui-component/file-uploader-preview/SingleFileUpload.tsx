import { Grid } from '@material-ui/core';
import FileView from './FileView';
import { UploadableFile } from './AttachmentsUpload';

export interface SingleFileUploadProps {
    fileWrapper: UploadableFile;
    onDelete: (file: UploadableFile) => void;
    setSelectedFile: (file: UploadableFile) => void;
    disableFileEdit?: boolean;
}

const SingleFileUpload = ({ fileWrapper, onDelete, setSelectedFile, disableFileEdit }: SingleFileUploadProps) => (
    <Grid item sx={{ maxWidth: '100%' }} key={fileWrapper.id}>
        <FileView fileWrapper={fileWrapper} onDelete={onDelete} setSelectedFile={setSelectedFile} disableFileEdit={disableFileEdit} />
    </Grid>
);

export default SingleFileUpload;
