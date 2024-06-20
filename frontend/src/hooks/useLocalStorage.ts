import { useState } from 'react';

interface LSProps {
    key: string;
    defaultValue: string | number;
}

const useLocalStorage = ({ key, defaultValue }: LSProps) => {
    const getInitialLSValue = () => {
        try {
            const value = window.localStorage.getItem(key);

            if (value) {
                return JSON.parse(value);
            }
            window.localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue;
        } catch (err) {
            return defaultValue;
        }
    };

    const [storedLSValue, setStoredLSValue] = useState(getInitialLSValue());

    const setValue = (newValue: string | number) => {
        try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (err) {
            throw new Error('An error occurred while writing data to local storage');
        }
        setStoredLSValue(newValue);
    };

    return [storedLSValue, setValue];
};

export default useLocalStorage;
