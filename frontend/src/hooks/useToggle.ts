import { useReducer } from 'react';

const toggler = (state: boolean, newValue: boolean) => newValue || !state;

const useToggle = (initialState = false) => useReducer(toggler, initialState);

export default useToggle;
