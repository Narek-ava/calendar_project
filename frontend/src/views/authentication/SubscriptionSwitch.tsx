import { useMemo, useEffect } from 'react';
import { InitData, ProductsProps } from './types';
import { List, ListItem, ListItemIcon, ListItemText, ToggleButton, ToggleButtonGroup, Typography } from '@material-ui/core';
import Check from '@material-ui/icons/Check';
import { styled } from '@material-ui/core/styles';

interface SubscriptionSwitchProps {
    initData: InitData;
    subscriptionType: string | null;
    setFieldValue: (field: string, value: any) => void;
}

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    '@media(max-width: 600px)': {
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column'
    }
}));

const SubscriptionSwitch = ({ initData, subscriptionType, setFieldValue }: SubscriptionSwitchProps) => {
    const subscriptionTypes = useMemo(() => {
        if (!initData) return [];

        const productsData: ProductsProps[] = [];

        Object.entries(initData.limits).forEach((entry) => {
            const [key, limit] = entry;
            const product = initData.stripe.products.find((p) => p.metadata.limitName === key);
            if (product) {
                productsData.push({
                    label: product.name,
                    subscription_type: key,
                    features: [
                        `${limit.company_owner.companies} Organization${limit.company_owner.companies > 1 ? 's' : ''}`,
                        `${limit.company.employees} Employee${limit.company.employees > 1 ? 's' : ''}`,
                        `${limit.company.locations} Location${limit.company.locations > 1 ? 's' : ''}`,
                        `${limit.company.services || 'Unlimited'} Service${
                            limit.company.services > 1 || !limit.company.services ? 's' : ''
                        }`
                    ],
                    price: (product.default_price.unit_amount / 100).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }),
                    price_id: product.default_price.id
                });
            }
        });

        return productsData;
    }, [initData]);

    useEffect(() => {
        setFieldValue('stripe_price_id', subscriptionTypes[1]?.price_id);
        setFieldValue('company.subscription_type', subscriptionTypes[1]?.subscription_type);
    }, [setFieldValue, subscriptionTypes]);

    return (
        <>
            <Typography mt={2} mb={1}>
                Subscription Plan
            </Typography>

            {initData && subscriptionTypes.length ? (
                <>
                    <ToggleButtonGroup
                        fullWidth
                        color="primary"
                        value={subscriptionType}
                        exclusive
                        onChange={(e, value) => {
                            if (!value) return;
                            setFieldValue('company.subscription_type', value);
                            setFieldValue('stripe_price_id', subscriptionTypes.find((t) => t.subscription_type === value)?.price_id);
                        }}
                        aria-label="Subscription Plan"
                    >
                        {subscriptionTypes.map((type) => (
                            <StyledToggleButton value={type.subscription_type} key={type.subscription_type}>
                                {type.label}
                                <strong>&nbsp;{type.price}</strong>
                            </StyledToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <List>
                        {subscriptionTypes
                            .find((t) => t.subscription_type === subscriptionType)
                            ?.features.map((feature) => (
                                <ListItem key={`key_${feature}`}>
                                    <ListItemIcon>
                                        <Check color="primary" />
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography>{feature}</Typography>
                                    </ListItemText>
                                </ListItem>
                            ))}
                    </List>
                </>
            ) : (
                <Typography>Invalid payment gateway configuration, please contact support</Typography>
            )}
        </>
    );
};

export default SubscriptionSwitch;
