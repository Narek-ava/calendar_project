import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Divider, Grid, Theme, Typography } from '@material-ui/core';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';

// project imports
import config from 'config';
import { gridSpacing } from 'store/constant';

// assets
import AccountTreeTwoToneIcon from '@material-ui/icons/AccountTreeTwoTone';
import HomeIcon from '@material-ui/icons/Home';
import HomeTwoToneIcon from '@material-ui/icons/HomeTwoTone';
import { NavItemType, NavItemTypeObject, OverrideIcon } from 'types';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    link: {
        display: 'flex',
        color: theme.palette.grey[900],
        textDecoration: 'none',
        alignContent: 'center',
        alignItems: 'center'
    },
    activeLink: {
        display: 'flex',
        textDecoration: 'none',
        alignContent: 'center',
        alignItems: 'center',
        color: theme.palette.grey[500]
    },
    icon: {
        marginRight: theme.spacing(0.75),
        marginTop: `-${theme.spacing(0.25)}`,
        width: '1rem',
        height: '1rem',
        color: theme.palette.secondary.main
    },
    separator: {
        width: 16,
        marginLeft: 8,
        marginRight: 8
    },
    content: {
        padding: '16px !important'
    },
    noPadding: {
        padding: '16px !important',
        paddingLeft: '0 !important'
    },
    card: {
        marginBottom: theme.spacing(gridSpacing),
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary[200] + 75
    },
    root: {
        background: 'transparent',
        boxShadow: 'none',
        border: 'none'
    },
    titleTop: {
        marginBottom: theme.spacing(1)
    },
    titleBottom: {
        marginTop: theme.spacing(1)
    },
    divider: {
        borderColor: theme.palette.primary.main,
        marginBottom: theme.spacing(gridSpacing)
    }
}));

// ==============================|| BREADCRUMBS ||============================== //

export interface BreadCrumbSxProps extends React.CSSProperties {
    mb?: string;
    bgcolor?: string;
}

export interface BreadCrumbsProps {
    card?: boolean;
    divider?: boolean;
    icon?: boolean;
    icons?: boolean;
    maxItems?: number;
    navigation?: NavItemTypeObject;
    rightAlign?: boolean;
    separator?: OverrideIcon;
    title?: boolean;
    titleBottom?: boolean;
    sx?: BreadCrumbSxProps;
}

const Breadcrumbs = ({
    card,
    divider,
    icon,
    icons,
    maxItems,
    navigation,
    rightAlign,
    separator,
    title,
    titleBottom,
    ...others
}: BreadCrumbsProps) => {
    const classes = useStyles();
    const [main, setMain] = useState<NavItemType | undefined>();
    const [item, setItem] = useState<NavItemType>();

    useEffect(() => {
        navigation?.items?.map((menu: NavItemType | NavItemTypeObject, index: number) => {
            if (menu.type && menu.type === 'group') {
                getCollapse(menu as { children: NavItemType[]; type?: string });
            }
            return false;
        });
    });

    // set active item state

    const getCollapse = (menu: NavItemTypeObject) => {
        if (menu.children) {
            menu.children.filter((collapse: NavItemType) => {
                if (collapse.type && collapse.type === 'collapse') {
                    getCollapse(collapse as { children: NavItemType[]; type?: string });
                } else if (collapse.type && collapse.type === 'item') {
                    if (document.location.pathname === config.basename + collapse.url) {
                        setMain(menu);
                        setItem(collapse);
                    }
                }
                return false;
            });
        }
    };

    // item separator
    const SeparatorIcon = separator!;
    const separatorIcon = separator ? <SeparatorIcon stroke={1.5} size="1rem" /> : '/';

    // card class
    let cardClass = classes.card;
    if (card === false) {
        cardClass = classes.root;
    }

    // card content class
    let contentClass = classes.content;
    if (card === false) {
        contentClass = classes.noPadding;
    }

    let mainContent;
    let itemContent;
    let breadcrumbContent: React.ReactElement = <Typography />;
    let itemTitle: NavItemType['title'] = '';
    let CollapseIcon;
    let ItemIcon;

    // collapse item
    if (main && main.type === 'collapse') {
        CollapseIcon = main.icon ? main.icon : AccountTreeTwoToneIcon;
        mainContent = (
            <Typography component={Link} to="#" variant="subtitle1" className={classes.link}>
                {icons && <CollapseIcon className={classes.icon} />}
                {main.title}
            </Typography>
        );
    }

    // items
    if (item && item.type === 'item') {
        itemTitle = item.title;

        ItemIcon = item.icon ? item.icon : AccountTreeTwoToneIcon;
        itemContent = (
            <Typography variant="subtitle1" className={classes.activeLink}>
                {icons && <ItemIcon className={classes.icon} />}
                {itemTitle}
            </Typography>
        );

        // main
        if (item.breadcrumbs !== false) {
            breadcrumbContent = (
                <Card className={cardClass} {...others}>
                    <CardContent className={contentClass}>
                        <Grid
                            container
                            direction={rightAlign ? 'row' : 'column'}
                            justifyContent={rightAlign ? 'space-between' : 'flex-start'}
                            alignItems={rightAlign ? 'center' : 'flex-start'}
                            spacing={1}
                        >
                            {title && !titleBottom && (
                                <Grid item>
                                    <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                        {item.title}
                                    </Typography>
                                </Grid>
                            )}
                            <Grid item>
                                <MuiBreadcrumbs
                                    classes={{ separator: classes.separator }}
                                    aria-label="breadcrumb"
                                    maxItems={maxItems || 8}
                                    separator={separatorIcon}
                                >
                                    <Typography component={Link} to="/" color="inherit" variant="subtitle1" className={classes.link}>
                                        {icons && <HomeTwoToneIcon className={classes.icon} />}
                                        {icon && <HomeIcon className={classes.icon} style={{ marginRight: 0 }} />}
                                        {!icon && 'Dashboard'}
                                    </Typography>
                                    {mainContent}
                                    {itemContent}
                                </MuiBreadcrumbs>
                            </Grid>
                            {title && titleBottom && (
                                <Grid item>
                                    <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                        {item.title}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                    {card === false && divider !== false && <Divider className={classes.divider} />}
                </Card>
            );
        }
    }

    return breadcrumbContent;
};

export default Breadcrumbs;
