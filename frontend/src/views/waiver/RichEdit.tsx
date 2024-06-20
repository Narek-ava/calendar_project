import { createElement } from 'react';
import { ElementFactory, Question, Serializer, SvgRegistry } from 'survey-core';
import { ReactQuestionFactory } from 'survey-react-ui';
import { PropertyGridEditorCollection } from 'survey-creator-react';
import { localization } from 'survey-creator-core';
import ReactDOMServer from 'react-dom/server';
import WysiwygIcon from '@material-ui/icons/Wysiwyg';
import SurveyQuestionRichEdit from './TynimceEditor';

const CUSTOM_TYPE = 'richedit';

export class QuestionRichEditModel extends Question {
    getType() {
        this.custom_type = CUSTOM_TYPE;
        return this.custom_type;
    }

    get richEditType() {
        return this.getPropertyValue('richEditType');
    }

    set richEditType(val) {
        this.setPropertyValue('richEditType', val);
    }

    get titleLocation() {
        return this.getPropertyValue('hidden');
    }

    set titleLocation(val) {
        this.setPropertyValue('titleLocation', val);
    }
}

export function registerRichEdit() {
    ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => new QuestionRichEditModel(name));
}

const locale = localization.getLocale('');
locale.qt[CUSTOM_TYPE] = 'WYSIWYG';
locale.pe.richEditType = 'Rich edit type';

const svg = ReactDOMServer.renderToString(<WysiwygIcon />);
SvgRegistry.registerIconFromSvg(CUSTOM_TYPE, svg);

Serializer.addClass(CUSTOM_TYPE, [], () => new QuestionRichEditModel(''), 'question');
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props: any) => createElement(SurveyQuestionRichEdit, props));
PropertyGridEditorCollection.register({
    fit: (prop: any) => prop.type === 'richedit',

    getJSON() {
        return {
            type: CUSTOM_TYPE,
            richEditType: 'Compact'
        };
    }
});
