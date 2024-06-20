import { useAppSelector } from '../../../hooks/redux';
import { useMemo } from 'react';

const useDepositFunctions = () => {
    const { deposit, noShowDeposit } = useAppSelector((state) => state.widget);

    const servicePrice = useMemo(() => {
        let price = 0;
        if (deposit.required && deposit.amount) price = deposit.amount;

        if (noShowDeposit.required && noShowDeposit.amount) price = noShowDeposit.amount;

        return typeof price === 'string' ? parseFloat(price) : price;
    }, [deposit, noShowDeposit]);

    return { servicePrice };
};

export default useDepositFunctions;
