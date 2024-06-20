import { useCallback, useState } from 'react';

// mui
import { Avatar, Grid } from '@mui/material';
import Delete from '@material-ui/icons/Delete';
import { Box, ButtonBase, Skeleton, Tooltip, Typography } from '@material-ui/core';
import { Theme, useTheme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';

// project-imports
import { colors } from '../../../../store/constant';
import SubCard from '../../../../ui-component/cards/SubCard';
import { IUser } from '../../../../models/IUser';
import { ImageResponse } from '../../../../models/IImage';
import UploadAvatar from './UploadAvatar';
import useBoolean from '../../../../hooks/useBoolean';
import AvatarEditor from './AvatarEditor';
import { SnackBarTypes } from '../../../../store/snackbarReducer';
import { openConfirmPopup } from '../../../../store/confirmPopupSlice';
import { SNACKBAR_OPEN } from '../../../../store/actions';
import { useAppDispatch } from '../../../../hooks/redux';
import { deleteImageFromAWS, replaceMinioToLocalhost, uploadImageFile } from '../../../../utils/functions/uploading-images-helpers';
import employeeAPI from '../../../../services/EmployeeService';
import locationAPI from '../../../../services/LocationService';

const avatarSize = 80;

// style const
const useStyles = makeStyles((theme: Theme) => ({
    avatar: {
        width: `${avatarSize}px`,
        height: `${avatarSize}px`,
        margin: '0 auto 16px',
        fontSize: '42px'
    },
    deleteButton: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
        color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.main,
        '&:hover': {
            color: theme.palette.mode === 'dark' ? theme.palette.error.main : theme.palette.error.main
        }
    }
}));

export interface ImageFile extends File {
    preview?: string;
    name: string;
}

export interface ImageBlob extends Blob {
    preview?: string;
    name: string;
}

export type NewAvatar = ImageFile | ImageBlob | null;

interface ProfileAvatarProps {
    user: IUser;
    onUpdate: (user: IUser) => void;
    startSubmitting: () => void;
    isSubmitting: boolean;
    isInEditUserMode: boolean;
}

const ProfileAvatar = ({ user, onUpdate, isSubmitting, startSubmitting, isInEditUserMode }: ProfileAvatarProps) => {
    const classes = useStyles();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [newAvatar, setNewAvatar] = useState<NewAvatar>(null);
    const { value: isEditorOpened, off: closeEditor, on: openEditor } = useBoolean();
    const getLogo = useCallback((avatar) => replaceMinioToLocalhost(avatar ? avatar.url : ''), []);

    const closeAvatarEditor = useCallback(() => {
        closeEditor();
        setNewAvatar(null);
    }, []);

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

    const confirmDeleteImage = (id: number | undefined) => {
        if (id) {
            dispatch(
                openConfirmPopup({
                    onConfirm: () =>
                        deleteImageFromAWS(id)
                            .then(() => {
                                onUpdate({ ...user, avatar: null });
                                showSnackbar({
                                    message: 'Image deleted',
                                    alertSeverity: SnackBarTypes.Success
                                });
                                dispatch(employeeAPI.util.invalidateTags(['Employee']));
                                dispatch(locationAPI.util.invalidateTags(['Location']));
                            })
                            .catch((e) => {
                                showSnackbar({
                                    message: e.message,
                                    alertSeverity: SnackBarTypes.Error
                                });
                            }),
                    confirmText: `Delete`,
                    text: `Are you sure you want to delete current Avatar?`
                })
            );
        }
    };

    const onError = (e: Error) => {
        showSnackbar({
            message: e.message,
            alertSeverity: SnackBarTypes.Error
        });
    };

    const updateUser = (res: ImageResponse) => {
        const updatedUser = {
            ...user,
            avatar: res.link
        };
        onUpdate(updatedUser as IUser);
        dispatch(employeeAPI.util.invalidateTags(['Employee']));
        dispatch(locationAPI.util.invalidateTags(['Location']));
        setNewAvatar(null);
    };

    const onUpload = (res: ImageResponse) => {
        if (user.avatar && typeof user.avatar === 'object' && 'id' in user.avatar && user.avatar.id) {
            deleteImageFromAWS(user.avatar.id)
                .then(() => {
                    updateUser(res);
                })
                .catch((e) => {
                    showSnackbar({
                        message: e.message,
                        alertSeverity: SnackBarTypes.Error
                    });
                });
            return;
        }
        updateUser(res);
    };

    const handleUploadAvatar = useCallback(() => {
        if (newAvatar) {
            startSubmitting();
            // 1) upload image to the image server
            uploadImageFile({
                file: newAvatar,
                name: newAvatar.name,
                onError,
                onUpload // 2) on success - write uploaded image link to the user account
            });
        }
    }, [newAvatar]);

    return (
        <>
            <SubCard
                title="Profile Photo"
                contentSX={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '205px' }}
                titleSX={{ minHeight: '66px' }}
                secondary={
                    <>
                        {user.avatar && !newAvatar && (
                            <Tooltip title="Delete Photo" placement="top" arrow>
                                <ButtonBase sx={{ borderRadius: '12px', ml: 2 }}>
                                    <Avatar
                                        variant="rounded"
                                        className={classes.deleteButton}
                                        color="inherit"
                                        // @ts-ignore
                                        onClick={() => confirmDeleteImage(user.avatar.id)}
                                    >
                                        <Delete />
                                    </Avatar>
                                </ButtonBase>
                            </Tooltip>
                        )}
                    </>
                }
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {!newAvatar && !isSubmitting ? (
                            <Avatar
                                className={classes.avatar}
                                color="inherit"
                                src={getLogo(user.avatar)}
                                sx={{
                                    backgroundColor: user.employee.background_color
                                        ? `#${user.employee.background_color}`
                                        : colors.blue.value,
                                    color: theme.palette.getContrastText(
                                        user.employee.background_color ? `#${user.employee.background_color}` : colors.blue.value
                                    )
                                }}
                            >
                                <Typography fontSize="inherit">{user.firstname.charAt(0).toUpperCase()}</Typography>
                            </Avatar>
                        ) : (
                            <>
                                {(!newAvatar || isSubmitting) && (
                                    <Box
                                        sx={{
                                            margin: '0 auto 16px',
                                            width: `${avatarSize}px`,
                                            minHeight: `${avatarSize}px`,
                                            borderRadius: '50%'
                                        }}
                                    >
                                        <Skeleton
                                            animation="wave"
                                            width={avatarSize}
                                            height={avatarSize}
                                            variant="circular"
                                            sx={{ bgcolor: 'grey.300' }}
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                        <UploadAvatar
                            newAvatar={newAvatar}
                            setNewAvatar={setNewAvatar}
                            handleUploadAvatar={handleUploadAvatar}
                            openEditor={openEditor}
                            isSubmitting={isSubmitting}
                        />
                    </Grid>
                </Grid>
            </SubCard>
            {newAvatar && (
                <AvatarEditor
                    isEditorOpened={isEditorOpened}
                    incomingImage={newAvatar}
                    setNewImage={setNewAvatar}
                    closeEditor={closeAvatarEditor}
                    handleUploadAvatar={handleUploadAvatar}
                />
            )}
        </>
    );
};

export default ProfileAvatar;
