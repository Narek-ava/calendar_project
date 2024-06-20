import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { closeConfirmPopup } from '../../store/confirmPopupSlice';
import CBModal from '../CBModal';

const ConfirmPopup = () => {
    const {
        confirmData: { onClose, onConfirm, confirmText, cancelText, text, isConfirmDisabled, id },
        isOpened
    } = useAppSelector((state) => state.confirmPopup);
    const dispatch = useAppDispatch();

    const closeFunc = () => {
        if (onClose) {
            onClose();
        }
        dispatch(closeConfirmPopup());
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        dispatch(closeConfirmPopup());
    };

    return isOpened ? (
        <CBModal
            id={id}
            open
            onClose={closeFunc}
            okButtonText={confirmText}
            onClickOk={handleConfirm}
            okButtonDisabled={isConfirmDisabled}
            closeButtonText={onConfirm ? cancelText ?? 'Cancel' : 'Ok'}
            severity="warning"
        >
            {text}
        </CBModal>
    ) : null;
};

export default ConfirmPopup;
