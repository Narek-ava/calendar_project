import React, { useContext } from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Divider, List, Typography, Theme } from '@material-ui/core';

// project imports
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';
import { GenericCardProps } from 'types';
import { AbilityContext } from '../../../../../utils/roles/Can';
import { UserSubject } from '../../../../../models/IUser';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    menuCaption: {
        ...theme.typography.menuCaption,
        fontSize: '15px',
        fontWeight: 'bold'
    },
    subMenuCaption: {
        ...theme.typography.subMenuCaption
    },
    menuDivider: {
        marginTop: '2px',
        marginBottom: '10px'
    }
}));

// ==============================|| SIDEBAR MENU LIST GROUP ||============================== //

export interface NavGroupProps {
    item: {
        id?: string;
        type?: string;
        icon?: GenericCardProps['iconPrimary'];
        children?: NavGroupProps['item'][];
        role_subject?: string;
        title?: React.ReactNode | string;
        caption?: React.ReactNode | string;
        color?: 'primary' | 'secondary' | 'default' | undefined;
    };
}

const NavGroup = ({ item }: NavGroupProps) => {
    const classes = useStyles();
    const ability = useContext(AbilityContext);

    // menu list collapse & items
    const items = item.children
        ?.filter((menuElement) => {
            if (menuElement.role_subject && ability.can('list', menuElement.role_subject as UserSubject)) {
                return menuElement;
            }
            return undefined;
        })
        .map((menu) => {
            switch (menu.type) {
                case 'collapse':
                    return <NavCollapse key={menu.id} menu={menu} level={1} />;
                case 'item':
                    return <NavItem key={menu.id} item={menu} level={1} />;
                default:
                    return (
                        <Typography key={menu.id} variant="h6" color="error" align="center">
                            Menu Items Error
                        </Typography>
                    );
            }
        });

    return (
        <>
            <List
                subheader={
                    item.title && (
                        <Typography variant="caption" className={classes.menuCaption} display="block" gutterBottom>
                            {item.title}
                            {item.caption && (
                                <Typography variant="caption" className={classes.subMenuCaption} display="block" gutterBottom>
                                    {item.caption}
                                </Typography>
                            )}
                        </Typography>
                    )
                }
            >
                {items}
            </List>

            {/* group divider */}
            <Divider className={classes.menuDivider} />
        </>
    );
};

export default NavGroup;
