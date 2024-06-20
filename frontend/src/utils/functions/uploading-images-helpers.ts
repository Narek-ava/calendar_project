import { ImageData, ImageResponse } from '../../models/IImage';
import { axiosServices } from '../axios';
import { AttachmentVariants, UploadableFile } from '../../ui-component/file-uploader-preview/AttachmentsUpload';

interface uploadImagesAndSubmitProps {
    attachments: UploadableFile[];
    updateAttachmentsCb: (data: UploadableFile[]) => void;
    submitCb: (data: string[]) => void;
    imagesToDelete: (number | string)[];
    uploadingErrorCb: (e: Error) => void;
    deletingImagesErrorCb: (e: Error) => void;
}

export interface UploadImage {
    file: File | Blob;
    onUpload: (d: ImageResponse, name: string) => void;
    name: string;
    setIsLoading?: (arg: boolean) => void;
    onError: (e: Error) => void;
}

export const getMappedFilesFromAppointment = async (images: ImageData[]) => {
    const files = await Promise.all(
        images.map(async (file: ImageData) => {
            const newFile = await fetch(replaceMinioToLocalhost(file.url)).then((res) =>
                res.blob().then((blob) => new File([blob], `file_${file.id}`, { type: 'image/png' }))
            );
            return {
                file: { ...newFile },
                errors: [],
                preview: URL.createObjectURL(newFile),
                id: file.id,
                url: file.link,
                isUploaded: true
            };
        })
    );
    return files;
};

// for localhost develop use this replacer or add '127.0.0.1 minio' to your /etc/hosts
// otherwise images links will not work

// export const replaceMinioToLocalhost = (str: string) => str.replace(/minio/, 'localhost');
export const replaceMinioToLocalhost = (str: string) => str;

type ImageSizeT = 'small' | 'medium' | 'original';

export const changeImageSize = ({ size, url }: { size: ImageSizeT; url: string }) => {
    const file = url.match(/(.+?)(\.[^.]*$|$)/);
    if (file) {
        switch (file.length) {
            case 4: {
                const filename = file[1];
                const newSize = size === 'original' ? null : file[2].replace(/(?:@).*/, size);
                const extension = file[3];
                return newSize ? `${filename}${newSize}${extension}` : `${filename}${extension}`;
            }
            case 3: {
                const filename = file[1];
                const extension = file[2];
                return size === 'original' ? url : `${filename}@${size}${extension}`;
            }
            default: {
                return url;
            }
        }
    }
    return url;
};

export const uploadImageFile = async ({ file, name, onUpload, setIsLoading, onError }: UploadImage) => {
    if (setIsLoading) {
        setIsLoading(true);
    }
    const data = new FormData();
    data.append('image', file);
    data.append('filename', name);
    data.append('name', 'image');
    try {
        const res = await axiosServices.post<ImageResponse>('/uploader/image', data, {
            headers: {
                'Content-Type': 'multipart/form-data;'
            }
        });
        if (res.data) {
            onUpload(res.data, name);
        }
    } catch (e) {
        onError(e);
    }
    if (setIsLoading) {
        setIsLoading(false);
    }
};

export const uploadMultipleImages = (attachments: UploadableFile[]) => {
    const promises: Promise<UploadableFile>[] = [];
    attachments.forEach((file) => {
        const imagePromise: Promise<UploadableFile> = new Promise((resolve, reject) => {
            uploadImageFile({
                file: file.file,
                name: file.file.name,
                onUpload: (res, name) => {
                    resolve({ ...file, isUploaded: true, url: res.link });
                },
                onError: (e) => {
                    reject(e);
                }
            });
        });
        promises.push(imagePromise);
    });
    return Promise.all(promises);
};

export const checkFilesErrors = (files: UploadableFile[]) => {
    for (let i = 0; i < files.length; i += 1) {
        if (files[i].errors.length > 0) {
            return false;
        }
    }
    return true;
};

export const deleteImageFromAWS = async (id: number) =>
    new Promise((resolve, reject) => {
        try {
            axiosServices.delete(`/uploader/image/${id}`).then((res) => {
                if (res.data) {
                    resolve(res);
                }
            });
        } catch (e) {
            reject(e);
        }
    });

export const deleteMultipleImages = (ImagesIds: (number | string)[]) => {
    const promises: Promise<void>[] = [];
    ImagesIds.forEach((id) => {
        if (id) {
            const imageDeletingPromise: Promise<void> = new Promise((resolve, reject) => {
                try {
                    if (typeof id === 'string') {
                        axiosServices.delete(`/uploader/image-by-link`, { data: { link: id } }).then(() => {
                            resolve();
                        });
                    } else {
                        axiosServices.delete(`/uploader/image/${id}`).then(() => {
                            resolve();
                        });
                    }
                } catch (e) {
                    reject(e);
                }
            });
            promises.push(imageDeletingPromise);
        }
    });
    return Promise.all(promises);
};

// transforms attachments array into object to know what files are needs to be uploaded
export const getAttachmentsVariants = (attachments: UploadableFile[]) =>
    attachments.reduce(
        (obj: AttachmentVariants, file) => {
            if (!file.isUploaded) {
                obj.toUpload.push(file);
            } else {
                obj.uploadedFiles.push(file);
                if (file.url) {
                    obj.uploadedUrls.push(file.url);
                }
            }
            return obj;
        },
        { toUpload: [], uploadedUrls: [], uploadedFiles: [] }
    );

const getUrlsArrayFromFiles = (files: UploadableFile[]) =>
    files.reduce((arr, file) => {
        if (file.url) {
            arr.push(file.url);
        }
        return arr;
    }, [] as string[]);

export const uploadImagesAndSubmit = ({
    attachments,
    submitCb,
    updateAttachmentsCb,
    uploadingErrorCb,
    imagesToDelete,
    deletingImagesErrorCb
}: uploadImagesAndSubmitProps) => {
    const submit = () => {
        const attachmentVariants = getAttachmentsVariants(attachments);
        if (attachmentVariants.toUpload.length === 0) {
            submitCb(attachmentVariants.uploadedUrls);
        } else {
            uploadMultipleImages(attachmentVariants.toUpload)
                .then((files) => {
                    updateAttachmentsCb([...attachmentVariants.uploadedFiles, ...files]);
                    const newUploadedUrls = getUrlsArrayFromFiles(files);
                    submitCb([...attachmentVariants.uploadedUrls, ...newUploadedUrls]);
                })
                .catch((e: Error) => {
                    uploadingErrorCb(e);
                });
        }
    };

    if (imagesToDelete.length > 0) {
        deleteMultipleImages(imagesToDelete)
            .then(() => {
                submit();
            })
            .catch((e) => {
                deletingImagesErrorCb(e);
            });
    } else {
        submit();
    }
};
