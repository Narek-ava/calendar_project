import { Stack } from '@mui/material';
import FileUpload from '@material-ui/icons/FileUpload';
import SaveOutlined from '@material-ui/icons/SaveOutlined';

// assets
import AnimateButton from '../../../../ui-component/extended/AnimateButton';
import { NewAvatar } from './ProfileAvatar';
import { LoadingButton } from '@mui/lab';

export interface UploadAvatarProps {
    newAvatar: NewAvatar;
    setNewAvatar: (data: NewAvatar) => void;
    handleUploadAvatar: () => void;
    openEditor: () => void;
    isSubmitting: boolean;
}

const UploadAvatar = ({ newAvatar, setNewAvatar, handleUploadAvatar, openEditor, isSubmitting }: UploadAvatarProps) => {
    const handleSetFile = ({ target }: any) => {
        const targetFile = target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(targetFile);
        const fileWithPreview = Object.assign(targetFile, {
            preview: URL.createObjectURL(targetFile)
        });
        reader.onload = () => {
            setNewAvatar(fileWithPreview);
            openEditor();
        };
    };

    return (
        <>
            {newAvatar && (
                <Stack spacing={2}>
                    <AnimateButton>
                        <LoadingButton
                            loading={isSubmitting}
                            loadingPosition="start"
                            color="secondary"
                            startIcon={<SaveOutlined />}
                            variant="contained"
                            onClick={handleUploadAvatar}
                        >
                            {isSubmitting ? 'Updating Profile...' : 'Upload This Avatar'}
                        </LoadingButton>
                    </AnimateButton>
                </Stack>
            )}
            {!newAvatar && (
                <>
                    <input hidden type="file" onChange={handleSetFile} name="account-avatar" id="account-avatar" />
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label htmlFor="account-avatar">
                        <AnimateButton>
                            <LoadingButton
                                loading={isSubmitting}
                                loadingPosition="start"
                                color="secondary"
                                component="span"
                                startIcon={<FileUpload />}
                                variant="contained"
                            >
                                {isSubmitting ? 'Updating Profile...' : 'Change Photo'}
                            </LoadingButton>
                        </AnimateButton>
                    </label>
                </>
            )}
        </>
    );
};

export default UploadAvatar;
