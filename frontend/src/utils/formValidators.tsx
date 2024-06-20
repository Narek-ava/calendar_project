import { ChangeEvent } from 'react';
import { FormikErrors } from 'formik';

export const regExps = {
    name: /^[A-Za-z][A-Za-z0-9 .'-]*$/,
    letters: /^[a-zA-Z ]*$/gi,
    address: /^[A-Za-z0-9 -~]+$/,
    nonPersonName: /^[A-Za-z0-9 -~]+$/,
    password: /^[!-~]{8,}$/,
    // url: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
    postal_code: /^[a-zA-Z0-9 -]*$/gi
    // email: /^([a-z0-9][a-z0-9 _\.-]+([\.-]?\w+)*[a-z0-9])@\w+([\.-]?[a-z]+)*(\.[a-z]{2,})+$/gi,
};

export interface ValidateFieldProps<T> {
    regExp: RegExp;
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => Promise<void> | Promise<FormikErrors<T>>;
    fieldName: string;
}

export function validateField<T>({ event, regExp, setFieldValue, fieldName }: ValidateFieldProps<T>) {
    const { value } = event.target;
    if (regExp.test(value)) {
        setFieldValue(fieldName, value);
    }
}
