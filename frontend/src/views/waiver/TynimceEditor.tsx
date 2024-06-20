import { Editor } from '@tinymce/tinymce-react';
import { SurveyQuestionElementBase } from 'survey-react-ui';

export function getRichEditHtml(questionName: string) {
    return SurveyQuestionRichEdit.editorContents[questionName] || '';
}

export default class SurveyQuestionRichEdit extends SurveyQuestionElementBase {
    constructor(props: any) {
        super(props);
        this.state = { value: this.question.value };
    }

    static handleEditorChange = (content: string, questionName: string) => {
        SurveyQuestionRichEdit.editorContents[questionName] = content;
    };

    static editorContents: { [key: string]: string } = {};

    get question() {
        return this.questionBase;
    }

    get value() {
        return this.question.value;
    }

    static renderRichEdit(questionName: string, handleEditorChange: (content: string, questionName: string) => void) {
        const initialValue = SurveyQuestionRichEdit.editorContents[questionName] || '';

        return (
            <>
                <Editor
                    onEditorChange={(content, editor) => SurveyQuestionRichEdit.handleEditorChange(content, questionName)}
                    initialValue={initialValue}
                    apiKey="s6zoceyg8t1fawcsxcqokr6owxb34usxb3gc1l61c5gcjbpm"
                    init={{
                        height: 500,
                        resize: false,
                        plugins: [
                            'advcode',
                            'advlist',
                            'anchor',
                            'autolink',
                            'codesample',
                            'fullscreen',
                            'help',
                            'image',
                            'editimage',
                            'lists',
                            'media',
                            'link',
                            'mediaembed',
                            'powerpaste',
                            'preview',
                            'searchreplace',
                            'table',
                            'visualblocks',
                            'wordcount'
                        ],
                        toolbar:
                            'undo redo | bold italic | forecolor backcolor | codesample | alignleft aligncenter alignright alignjustify | bullist numlist | link image',
                        file_picker_types: 'image',
                        file_picker_callback: (cb: any, value: any, meta: any) => {
                            if (meta.filetype == 'image') {
                                const input = document.createElement('input');
                                input.setAttribute('type', 'file');
                                input.setAttribute('accept', 'image/*');
                                input.onchange = function (event) {
                                    const target = event.target as HTMLInputElement;
                                    if (target.files && target.files.length > 0) {
                                        const file = target.files[0];
                                        const reader = new FileReader();
                                        reader.onload = function (e) {
                                            e.target?.result &&
                                                cb(String(e.target.result), {
                                                    alt: file.name
                                                });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                };
                                input.click();
                            }
                        }
                    }}
                />
            </>
        );
    }

    renderElement() {
        const questionName = this.question.name;

        const style: React.CSSProperties =
            this.question.getPropertyValue('readOnly') || this.question.isDesignMode ? {} : { pointerEvents: 'none' };
        return (
            <div style={style}>
                {SurveyQuestionRichEdit.renderRichEdit(questionName, (content: any) => {
                    this.question.value = content[questionName];
                })}
            </div>
        );
    }
}
