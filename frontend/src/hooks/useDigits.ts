const useMask = () => {
    let oldValue: any;
    const regex = new RegExp(/^[\d]*$/g);
    const unmask = (value: any) => value.replace(new RegExp(/[^\d]/, 'g'), ''); // Remove every non-digit character
    const onKeyDown = ({ target }: any) => {
        oldValue = target.value;
    };

    const onInput = (e: any) => {
        const el = e.target;
        const newValue = unmask(el.value);

        if (newValue.match(regex)) {
            if (newValue !== '') {
                el.value = newValue;
            } else {
                el.value = '';
            }
        } else {
            el.value = oldValue;
        }
    };

    return { onKeyDown, onInput };
};

export default useMask;
