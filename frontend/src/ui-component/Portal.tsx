import { FC, useEffect, useState } from 'react';
import ReactDom from 'react-dom';

const Portal: FC = ({ children }) => {
    const [container] = useState(() => document.createElement('div'));

    useEffect(() => {
        document.body.appendChild(container);

        return () => {
            document.body.removeChild(container);
        };
    }, [container]);

    return ReactDom.createPortal(children, container);
};

export default Portal;
