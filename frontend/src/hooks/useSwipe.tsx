import { useCallback, useState } from 'react';

interface useSwipeProps {
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
}

const useSwipe = ({ onSwipeLeft, onSwipeRight }: useSwipeProps) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 60;

    const onTouchStart = useCallback((e) => {
        setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
        setTouchStart(e.targetTouches[0].clientX);
    }, []);

    const onTouchMove = useCallback((e) => setTouchEnd(e.targetTouches[0].clientX), []);

    const onTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) onSwipeLeft();

        if (isRightSwipe) onSwipeRight();
    }, [onSwipeLeft, onSwipeRight, touchEnd, touchStart]);

    return { onTouchStart, onTouchMove, onTouchEnd };
};

export default useSwipe;
