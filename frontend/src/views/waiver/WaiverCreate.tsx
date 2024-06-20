import { Button, Grid } from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// assets
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import 'assets/css/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import useAuth from 'hooks/useAuth';
import waiverAPI from 'services/WaiverService';
import { IWaiver } from 'models/ICompany';
import { registerRichEdit } from './RichEdit';
import { useAppDispatch } from 'hooks/redux';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../store/snackbarReducer';
import SurveyQuestionRichEdit, { getRichEditHtml } from './TynimceEditor';
import { registerCameraBlock } from './CameraBlock';

const WaiverCreate: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [updateWaiver] = waiverAPI.useUpdateWaiverMutation();
    const { showSnackbar } = useShowSnackbar();
    const { user } = useAuth();
    const [value, setValue] = useState(user?.currentCompany.waiver_data);

    const saveContent = () => {
        const waiverSavedData = JSON.parse(String(value));
        waiverSavedData?.pages?.map((page: any) => {
            page.elements.map((element: any) => {
                if (element.type === 'richedit') {
                    SurveyQuestionRichEdit.handleEditorChange(element.html, element.name);
                }
            });
        });
    };

    useEffect(() => {
        saveContent();
        registerRichEdit();
        registerCameraBlock();
    }, []);

    const creatorOptions = {
        showJSONEditorTab: false
    };

    const creator = new SurveyCreator(creatorOptions);
    creator.text = value || '';

    creator.toolbox.removeItem('html');
    creator.toolbox.forceCompact = true;
    creator.showSidebar = false;

    const companyId = user?.currentCompany.id;

    creator.saveSurveyFunc = (saveNo: any, callback: any) => {
        const waiverData = JSON.parse(creator.text);

        const updatedPages = waiverData?.pages?.map((page: any) => {
            const updatedElements = page?.elements?.map((element: any) => {
                if (element.type === 'richedit') {
                    const htmlContent = getRichEditHtml(element.name);

                    if (htmlContent) {
                        return {
                            ...element,
                            html: htmlContent
                        };
                    }
                }
                return element;
            });

            return {
                ...page,
                elements: updatedElements
            };
        });
        const waiver: IWaiver = {
            waiver_data: JSON.stringify({ ...waiverData, pages: updatedPages }),
            companyId
        };

        setValue(waiver.waiver_data);

        updateWaiver(waiver)
            .unwrap()
            .then(() => {
                showSnackbar({
                    message: 'Waiver updated',
                    alertSeverity: SnackBarTypes.Success
                });
                dispatch(waiverAPI.util.invalidateTags(['Waiver']));
            })
            .catch((err) => {
                showSnackbar({
                    message: `${err.data}`,
                    alertSeverity: SnackBarTypes.Error
                });
            });
        callback(saveNo, true);
    };

    return (
        <Grid>
            <MainCard
                title="Waiver"
                secondary={
                    <Button size="small" disableElevation onClick={() => navigate(-1)}>
                        <ChevronLeftOutlinedIcon />
                        Go back
                    </Button>
                }
                contentSX={{ p: { xs: 1.5, sm: 3 } }}
            >
                <SurveyCreatorComponent creator={creator} />
            </MainCard>
        </Grid>
    );
};

export default WaiverCreate;
