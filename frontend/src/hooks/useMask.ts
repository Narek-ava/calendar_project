const useMask = () => {
    let oldValue: any;
    let oldCursor: any;

    // const regex = new RegExp(/^\d{0,4}$/g);
    const regex = new RegExp(/^[\d aApPmM]{0,6}$/g);
    // const regex = new RegExp(/[0-1]/, /[0-9]/, ':', /[0-5]/, /[0-9]/, ' ', /[a|A|p|P]/, /[m|M]/);

    const mask = (value: any) => {
        const output = [];
        for (let i = 0; i < value.length; i += 1) {
            if (i !== 0 && i % 2 === 0) {
                output.push(':'); // add the separator
            }
            output.push(value[i]);
        }
        return output.join('');
    };

    const unmask = (value: any) => value.replace(new RegExp(/[^\d]/, 'g'), ''); // Remove every non-digit character

    const checkSeparator = (position: any, interval: any) => Math.floor(position / (interval + 1));

    const onKeyDown = ({ target }: any) => {
        oldValue = target.value;
        oldCursor = target.selectionEnd;
    };

    const onInput = (e: any) => {
        const el = e.target;
        let newCursorPosition;
        let newValue = unmask(el.value);

        if (newValue.match(regex)) {
            newValue = mask(newValue);

            newCursorPosition =
                oldCursor -
                checkSeparator(oldCursor, 2) +
                checkSeparator(oldCursor + (newValue.length - oldValue.length), 2) +
                (unmask(newValue).length - unmask(oldValue).length);

            if (newValue !== '') {
                el.value = newValue;
            } else {
                el.value = '';
            }
        } else {
            el.value = oldValue;
            newCursorPosition = oldCursor;
        }
        el.setSelectionRange(newCursorPosition, newCursorPosition);
    };

    return { onKeyDown, onInput };
};

export default useMask;
