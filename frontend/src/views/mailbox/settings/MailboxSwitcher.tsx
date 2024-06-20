import { IMailbox } from '../../../models/IMailbox';
import { Grid, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@material-ui/core';
import EmailTwoToneIcon from '@material-ui/icons/EmailTwoTone';
import ExpandMoreOutlinedIcon from '@material-ui/icons/ExpandMoreOutlined';
import React from 'react';
import mailboxAPI from '../../../services/MailboxService';
import { IconMailbox } from '@tabler/icons';

interface IMailboxSwitcherProps {
    mailbox: IMailbox;
    onChange: (id: number) => void;
}

const MailboxSwitcher = ({ mailbox, onChange }: IMailboxSwitcherProps) => {
    const { data } = mailboxAPI.useFetchAllMailboxesQuery(null, {
        refetchOnMountOrArgChange: true
    });
    const [anchorEl, setAnchorEl] = React.useState<Element | ((element: Element) => Element) | null | undefined>(null);
    const handleClick = (event: React.SyntheticEvent) => {
        setAnchorEl(event?.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSwitch = (id: number) => {
        onChange(id);
        handleClose();
    };

    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item zeroMinWidth>
                    <Typography
                        variant="h4"
                        component="div"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                    >
                        {mailbox.name}
                    </Typography>
                    <Typography
                        variant="subtitle2"
                        sx={{ mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                    >
                        <EmailTwoToneIcon sx={{ mr: '6px', fontSize: '16px', verticalAlign: 'text-top' }} />
                        {mailbox.email}
                    </Typography>
                </Grid>
                <Grid item>
                    <IconButton aria-controls="mailbox-switcher-menu" aria-haspopup="true" onClick={handleClick} sx={{ cursor: 'pointer' }}>
                        <ExpandMoreOutlinedIcon />
                    </IconButton>
                    <Menu
                        id="mailbox-switcher-menu"
                        sx={{ borderRadius: 0 }}
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
                        {data &&
                            data.data.map((mailboxItem) => (
                                <MenuItem key={mailboxItem.id} onClick={() => handleSwitch(mailboxItem.id)}>
                                    <ListItemIcon>
                                        <IconMailbox size={20} />
                                    </ListItemIcon>
                                    {mailboxItem.name}
                                </MenuItem>
                            ))}
                    </Menu>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default MailboxSwitcher;
