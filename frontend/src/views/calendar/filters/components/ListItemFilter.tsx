import { ReactNode } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@material-ui/core';

interface ListItemFilterProps {
    label: string;
    onClick: () => void;
    isActive: boolean;
    activeIcon: ReactNode;
}

const useListStyles = makeStyles((theme: Theme) => ({
    filterListItem: {
        '& .MuiListItemButton-root': {
            padding: theme.spacing(0.5, 1),

            '& .MuiListItemText-inset': {
                paddingLeft: '20px'
            },

            '& .MuiListItemIcon-root': {
                minWidth: 'auto',
                width: '20px',

                '& .MuiSvgIcon-root': {
                    width: '15px'
                }
            }
        }
    }
}));

const ListItemFilter = ({ label, onClick, isActive, activeIcon }: ListItemFilterProps) => {
    const classes = useListStyles();

    return (
        <ListItem disablePadding className={classes.filterListItem}>
            <ListItemButton onClick={onClick}>
                {isActive && <ListItemIcon>{activeIcon}</ListItemIcon>}
                <ListItemText inset={!isActive} primary={label} />
            </ListItemButton>
        </ListItem>
    );
};

export default ListItemFilter;
