import { useMemo } from 'react';
import { IconCalendarTime, IconId, IconLocation, IconNotes, IconUser } from '@tabler/icons';
import { Steps } from '../types';
import useDepositFunctions from '../../hooks/useDepositFunctions';

const useSteps = () => {
    const { servicePrice } = useDepositFunctions();

    const steps = useMemo<Steps>(() => {
        if (servicePrice) {
            return {
                service: { index: 0, title: 'Service', icon: IconNotes },
                location: { index: 1, title: 'Location', icon: IconLocation },
                provider: { index: 2, title: 'Provider', icon: IconId },
                date: { index: 3, title: 'Date & Time', icon: IconCalendarTime },
                user: { index: 4, title: 'Your Information', icon: IconUser },
                payment: { index: 5, title: 'Payment', icon: IconUser },
                final: { index: 6, title: 'Final', icon: IconUser }
            };
        }

        return {
            service: { index: 0, title: 'Service', icon: IconNotes },
            location: { index: 1, title: 'Location', icon: IconLocation },
            provider: { index: 2, title: 'Provider', icon: IconId },
            date: { index: 3, title: 'Date & Time', icon: IconCalendarTime },
            user: { index: 4, title: 'Your Information', icon: IconUser },
            final: { index: 5, title: 'Final', icon: IconUser }
        };
    }, [servicePrice]);

    const stepsLength = useMemo(() => Object.keys(steps).length, [steps]);

    return { steps, stepsLength };
};

export default useSteps;
