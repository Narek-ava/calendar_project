import { useAppSelector } from '../../../hooks/redux';
import { Theme, useMediaQuery } from '@material-ui/core';
import CreateButtonFab from '../../../ui-component/CreateButtonFab';
import AddIcon from '@material-ui/icons/Add';

const MobileCreateButton = () => {
    const { buttonAction } = useAppSelector((state) => state.mobileCreateButton);
    const matchSm = useMediaQuery((themeParam: Theme) => themeParam.breakpoints.down('sm'));

    return buttonAction && matchSm ? (
        <CreateButtonFab color="secondary" onClick={buttonAction}>
            <AddIcon fontSize="small" />
        </CreateButtonFab>
    ) : null;
};

export default MobileCreateButton;
