import useToggle from './useToggle';
// import { useMemo } from 'react';

interface ReturnType {
    value: boolean;
    toggle: React.Dispatch<boolean>;
    on: () => void;
    off: () => void;
}

const useBoolean = (initialValue = false): ReturnType => {
    const [value, toggle] = useToggle(initialValue);
    // const handlers = useMemo(
    //     () => ({
    //         toggle,
    //         on: () => toggle(true),
    //         off: () => toggle(false)
    //     }),
    //     [toggle]
    // );
    const handlers = {
        toggle,
        on: () => toggle(true),
        off: () => toggle(false)
    };
    return { value, ...handlers };
};

export default useBoolean;
