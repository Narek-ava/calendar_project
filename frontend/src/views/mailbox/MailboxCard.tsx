import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Button, Card, Grid, ListItemIcon, Menu, MenuItem, Theme, Tooltip, Typography } from '@material-ui/core';

// assets
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';
import EmailTwoToneIcon from '@material-ui/icons/EmailTwoTone';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import { useTheme } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    followerBlock: {
        padding: '16px',
        background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[50],
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[100],
        '&:hover': {
            border: `1px solid${theme.palette.primary.main}`
        }
    },
    primaryLight: {
        color: theme.palette.primary[200],
        cursor: 'pointer'
    },
    btnBlock: {
        width: '100%'
    }
}));

export interface MailboxCardProps {
    id: number;
    name: string;
    email: string;
    onDelete: () => void;
}

const MailboxCard = ({ id, name, email, onDelete }: MailboxCardProps) => {
    const classes = useStyles();
    const theme = useTheme();

    const [anchorEl, setAnchorEl] = React.useState<Element | ((element: Element) => Element) | null | undefined>(null);
    const handleClick = (event: React.SyntheticEvent) => {
        setAnchorEl(event?.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        onDelete();
        handleClose();
    };

    return (
        <Card className={classes.followerBlock}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs zeroMinWidth>
                            <Typography
                                variant="h4"
                                component="div"
                                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                            >
                                {name}
                            </Typography>
                            <Typography
                                variant="subtitle2"
                                sx={{ mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                            >
                                <EmailTwoToneIcon sx={{ mr: '6px', fontSize: '16px', verticalAlign: 'text-top' }} />
                                {email}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <MoreHorizOutlinedIcon
                                fontSize="small"
                                className={classes.primaryLight}
                                aria-controls="menu-mailbox-card"
                                aria-haspopup="true"
                                onClick={handleClick}
                            />
                            <Menu
                                id="menu-mailbox-card"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                variant="selectedMenu"
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right'
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                            >
                                <MenuItem onClick={handleDelete}>
                                    <ListItemIcon>
                                        <DeleteIcon sx={{ fontSize: '1.1rem', color: theme.palette.orange.dark }} />
                                    </ListItemIcon>
                                    Delete
                                </MenuItem>
                            </Menu>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={1}>
                        <Grid item xs={8}>
                            <Tooltip title="Open mailbox" placement="bottom">
                                <Link to={`/mailbox/${id}`}>
                                    <Button className={classes.btnBlock} variant="contained">
                                        <EmailTwoToneIcon />
                                    </Button>
                                </Link>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={4}>
                            <Tooltip title="Edit mailbox" placement="bottom">
                                <Link to={`/mailbox/settings/edit/${id}`}>
                                    <Button className={classes.btnBlock} variant="outlined" color="secondary">
                                        <SettingsOutlinedIcon sx={{ fill: 'gray' }} />
                                    </Button>
                                </Link>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Card>
    );
};

export default MailboxCard;
