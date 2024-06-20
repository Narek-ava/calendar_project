import { useEffect } from 'react';
import { useAppDispatch } from './redux';
import { setButtonAction } from '../store/slices/mobileCreateButtonSlice';

interface useMobileCreateButtonProps {
    action: () => void;
    condition: boolean;
}

const useMobileCreateButton = ({ action, condition }: useMobileCreateButtonProps) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (condition) dispatch(setButtonAction(action));

        return () => {
            dispatch(setButtonAction(null));
        };
    }, []);
};

export default useMobileCreateButton;
