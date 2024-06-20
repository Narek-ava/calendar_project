import React, { useEffect, useMemo } from 'react';
import { InitData, ProductsProps } from '../types';
import { gridSpacing } from '../../../store/constant';
import { Grid, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Button } from '@material-ui/core';
import MainCard from '../../../ui-component/cards/MainCard';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import CheckTwoTone from '@material-ui/icons/CheckTwoTone';

const useStyles = makeStyles((theme: Theme) => ({
    priceTitle: {
        fontSize: '25px',
        fontWeight: 500,
        position: 'relative',
        marginBottom: '15px',
        '&:after': {
            content: '""',
            position: 'absolute',
            bottom: '-15px',
            left: 'calc(50% - 25px)',
            width: '50px',
            height: '4px',
            background: theme.palette.primary.main,
            borderRadius: '3px'
        }
    },
    priceAmount: {
        fontSize: '32px',
        fontWeight: 700,
        '& > span': {
            fontSize: '20px',
            fontWeight: '500'
        },
        '@media(max-width:700px)': {
            fontSize: '26px'
        }
    },
    priceList: {
        margin: 0,
        padding: 0,
        '&> li': {
            padding: '5px 0px',
            '& svg': {
                fill: theme.palette.success.dark
            }
        }
    },
    priceIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        background: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.primary.light,
        color: theme.palette.primary.main,
        '& > svg': {
            width: '35px',
            height: '35px'
        }
    },
    planDescription: {
        height: '150px',
        display: 'flex'
        // alignItems: 'center'
    }
}));

interface PlanSelectionProps {
    initData: InitData;
    setStripePriceId: (id: string) => void;
    subscriptionType: string;
    setSubscriptionType: (type: string) => void;
}

const PlanSelection = ({ initData, setStripePriceId, subscriptionType, setSubscriptionType }: PlanSelectionProps) => {
    const classes = useStyles();

    const features = {
        single_user: [
            'No Setup Fees',
            '500 SMS Text Notifications',
            'One Staff Member',
            'One Business Location',
            'Unlimited Services',
            'Resource Booking',
            'Personal Calendar',
            'Online Booking',
            'Virtual Appointments',
            'Branded Booking Widget',
            'Sales & Client Reports',
            'Custom Shifts'
        ],
        organization: [
            'No Setup Fees',
            '2000 SMS Text Notifications',
            'Ten Staff Members',
            'Two Business Locations',
            'Unlimited Services',
            'Resource Calendar View',
            'Personal Calendar',
            'Online Booking',
            'Virtual Appointments',
            'Staff Access',
            'Sales & Client Reports',
            'Custom Shifts'
        ],
        small_business: []
    };

    const subscriptionTypes = useMemo(() => {
        if (!initData) return [];

        const productsData: ProductsProps[] = [];

        Object.entries(initData.limits).forEach((entry) => {
            const [key] = entry;
            const product = initData.stripe.products.find((p) => p.metadata.limitName === key);
            if (product) {
                productsData.push({
                    label: product.name,
                    subscription_type: key,
                    // @ts-ignore
                    features: features[product.metadata.limitName],
                    price: (product.default_price.unit_amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                    price_id: product.default_price.id,
                    description: product.description
                });
            }
        });

        return productsData;
    }, [initData]);

    useEffect(() => {
        setStripePriceId(subscriptionTypes[1]?.price_id);
        setSubscriptionType(subscriptionTypes[1]?.subscription_type);
    }, [setStripePriceId, setSubscriptionType, subscriptionTypes]);

    return (
        <Grid container spacing={gridSpacing}>
            {subscriptionTypes.map((type, index) => (
                <Grid item xs={12} sm={6} key={`subscription_type_${index}`}>
                    <MainCard
                        onClick={() => {
                            setSubscriptionType(type.subscription_type);
                            setStripePriceId(type.price_id);
                        }}
                        boxShadow
                        sx={{
                            cursor: 'pointer',
                            border: subscriptionType === type.subscription_type ? '2px solid' : '1px solid',
                            borderColor: subscriptionType === type.subscription_type ? 'secondary.main' : 'primary.main'
                        }}
                    >
                        <Grid container textAlign="center" spacing={1.5} id={type.subscription_type}>
                            <Grid item xs={12}>
                                <Typography variant="h6" className={classes.priceTitle}>
                                    {type.label}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                {type.description && (
                                    <Typography variant="body2" className={classes.planDescription}>
                                        {type.description}
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <Typography component="div" variant="body2" className={classes.priceAmount}>
                                    <sup>$</sup>
                                    {type.price}
                                    <span>/Month</span>
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <List className={classes.priceList} component="ul">
                                    {subscriptionTypes
                                        .find((t) => t.subscription_type === type.subscription_type)
                                        ?.features.map((feature) => (
                                            <React.Fragment key={`key_${feature}`}>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <CheckTwoTone sx={{ fontSize: '1.3rem' }} />
                                                    </ListItemIcon>
                                                    <ListItemText primary={feature} />
                                                </ListItem>
                                                <Divider />
                                            </React.Fragment>
                                        ))}
                                </List>
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    startIcon={subscriptionType === type.subscription_type ? <CheckTwoTone /> : null}
                                    variant="outlined"
                                >
                                    {subscriptionType === type.subscription_type ? 'Chosen' : 'Click to Choose'}
                                </Button>
                            </Grid>
                        </Grid>
                    </MainCard>
                </Grid>
            ))}
        </Grid>
    );
};

export default PlanSelection;
