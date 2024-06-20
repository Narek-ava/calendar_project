import React from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { convertToRaw, ContentState, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { useTheme } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';

import 'assets/scss/textEditor.scss';

interface ITextEditorProps {
    value: string | null;
    setFieldValue: (val: string) => void;
}

const TextEditor = ({ value, setFieldValue }: ITextEditorProps) => {
    const theme = useTheme();

    const prepareDraft = (htmlValue: string) => {
        const draft = htmlToDraft(htmlValue);
        const contentState = ContentState.createFromBlockArray(draft.contentBlocks);
        return EditorState.createWithContent(contentState);
    };

    const [editorState, setEditorState] = React.useState(value ? prepareDraft(value) : EditorState.createEmpty());

    const onEditorStateChange = (newEditorState: EditorState) => {
        const forFormik = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
        setFieldValue(forFormik);
        setEditorState(newEditorState);
    };
    return (
        <Grid
            item
            xs={12}
            sx={{
                '& .rdw-editor-wrapper': {
                    bgcolor: theme.palette.mode === 'dark' ? 'dark.main' : theme.palette.background.paper,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? theme.palette.dark.light + 20 : 'primary.light',
                    borderRadius: '12px',
                    // overflow: 'hidden',
                    // height: '220px',
                    '& .rdw-editor-main': {
                        px: 2,
                        py: 0.5,
                        border: 'none',
                        height: '150px'
                    },
                    '& .rdw-editor-toolbar': {
                        pt: 1.25,
                        border: 'none',
                        borderBottom: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? theme.palette.dark.light + 20 : 'primary.light',
                        bgcolor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.50',
                        '& .rdw-option-wrapper': {
                            bgcolor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.50',
                            borderColor: theme.palette.mode === 'dark' ? theme.palette.dark.dark : 'grey.900'
                        },
                        '& .rdw-dropdown-wrapper': {
                            bgcolor: theme.palette.mode === 'dark' ? 'dark.light' : 'grey.50',
                            borderColor: theme.palette.mode === 'dark' ? theme.palette.dark.dark : 'grey.900',
                            '& .rdw-dropdown-selectedtext': {
                                color: theme.palette.mode === 'dark' ? 'dark.dark' : 'grey.900'
                            }
                        }
                    }
                }
            }}
        >
            <Editor
                editorState={editorState}
                wrapperClassName="custom-wrapper"
                editorClassName="custom-editor"
                onEditorStateChange={onEditorStateChange}
                toolbar={{
                    options: [
                        'inline',
                        'blockType',
                        'fontSize',
                        'fontFamily',
                        'list',
                        'textAlign',
                        'colorPicker',
                        'link',
                        'embedded',
                        'emoji',
                        'image',
                        'remove',
                        'history'
                    ],
                    inline: {
                        inDropdown: true
                    },
                    blockType: {
                        inDropdown: true
                    },
                    fontSize: {
                        inDropdown: true
                    },
                    list: {
                        inDropdown: true
                    },
                    textAlign: {
                        inDropdown: true
                    },
                    link: {
                        inDropdown: true
                    }
                }}
            />
        </Grid>
    );
};

export default TextEditor;
