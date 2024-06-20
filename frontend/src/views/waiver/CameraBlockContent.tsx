import { SurveyQuestionElementBase } from 'survey-react-ui';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import React, { createRef } from 'react';

export default class CameraBlockContent extends SurveyQuestionElementBase {
    fileInputRef: any = {};

    constructor(props: any) {
        super(props);
        this.state = {
            photoSrc: ''
        };
        this.fileInputRef[this.question.name] = createRef();
    }

    get question() {
        return this.questionBase;
    }

    get value() {
        return this.question.value;
    }

    static handlePhotoIconClick = (componentInstance: any) => {
        componentInstance.fileInputRef[componentInstance.question.name].current.click();
    };

    static handlePhotoSelect = (componentInstance: any, event: any) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e: any) => {
            componentInstance.setState({ photoSrc: e.target.result });
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    static renderCamera(componentInstance: any) {
        const { photoSrc } = componentInstance.state;

        return (
            <div id="cameraContainer" style={{ border: photoSrc ? 'none' : '1px dashed #d6d6d6' }}>
                <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    id="photoInput"
                    ref={componentInstance.fileInputRef[componentInstance.question.name]}
                    style={{ display: 'none' }}
                    onChangeCapture={(e) => this.handlePhotoSelect(componentInstance, e)}
                />

                <PhotoCameraIcon
                    onClick={(e) => this.handlePhotoIconClick(componentInstance)}
                    id="camera"
                    style={{ opacity: photoSrc ? 0 : 1 }}
                />
                {photoSrc && <img id="cameraCapture" src={photoSrc} alt="Selected Photo" />}
            </div>
        );
    }

    renderElement() {
        const style: React.CSSProperties =
            this.question.getPropertyValue('readOnly') ||
            this.question.isDesignMode ||
            (!navigator.userAgent.toLowerCase().includes('mobile') && !navigator.userAgent.toLowerCase().includes('tablet') && false)
                ? { pointerEvents: 'none' }
                : {};
        return <div style={style}>{CameraBlockContent.renderCamera(this)}</div>;
    }
}
