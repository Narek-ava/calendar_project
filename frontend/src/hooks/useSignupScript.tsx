import { useEffect } from 'react';

const useSignupScript = () => {
    useEffect(() => {
        const script = document.createElement('script');

        script.src = 'https://www.dwin1.com/41910.js';
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);
};

export default useSignupScript;
