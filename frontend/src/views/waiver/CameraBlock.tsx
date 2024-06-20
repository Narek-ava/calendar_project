import { ElementFactory, Question, Serializer, SvgRegistry } from 'survey-core';
import { PropertyGridEditorCollection } from 'survey-creator-react';
import { localization } from 'survey-creator-core';
import ReactDOMServer from 'react-dom/server';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import { createElement } from 'react';
import { ReactQuestionFactory } from 'survey-react-ui';
import CameraBlockContent from './CameraBlockContent';

const CUSTOM_TYPE = 'camerablock';

export class QuestionCameraBlockModel extends Question {
    getType() {
        this.custom_type = CUSTOM_TYPE;
        return this.custom_type;
    }

    get cameraBlockType() {
        return this.getPropertyValue('cameraBlockType');
    }

    set cameraBlockType(val) {
        this.setPropertyValue('cameraBlockType', val);
    }
}

export function registerCameraBlock() {
    ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => new QuestionCameraBlockModel(name));
}

const locale = localization.getLocale('');
locale.qt[CUSTOM_TYPE] = 'Camera';
locale.pe.cameraBlockType = 'Camera block type';

const svg = ReactDOMServer.renderToString(<PhotoCameraIcon />);
SvgRegistry.registerIconFromSvg(CUSTOM_TYPE, svg);

Serializer.addClass(CUSTOM_TYPE, [], () => new QuestionCameraBlockModel(''), 'question');
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props: any) => createElement(CameraBlockContent, props));

PropertyGridEditorCollection.register({
    fit: (prop: any) => prop.type === 'camerablock',

    getJSON() {
        return {
            type: CUSTOM_TYPE,
            cameraBlockType: 'Compact'
        };
    }
});
