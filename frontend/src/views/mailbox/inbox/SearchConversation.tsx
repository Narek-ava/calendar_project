import { Autocomplete, Box, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import { IConversation } from '../../../models/IConversation';
import conversationAPI from '../../../services/ConversationService';
import { SearchConversationProps } from './types';
import { throttle } from 'lodash';
import MailTwoToneIcon from '@material-ui/icons/MailTwoTone';
import styled from '@emotion/styled/macro';
import { format } from 'date-fns';

const Li = styled.li`
    border-bottom: 1px solid #ccc;
    &:last-child {
        border-bottom: none;
    }
`;

const SearchConversation = ({ mailbox, openConversationFromSearch }: SearchConversationProps) => {
    const [open, setOpen] = useState(false);
    const [skip, setSkip] = useState(true);
    const [search, setSearch] = useState('');
    const { data } = conversationAPI.useFetchAllConversationsQuery(
        {
            id: mailbox.id,
            search
        },
        { skip }
    );

    const throttled = useRef(
        throttle((newValue) => {
            setSearch(newValue);
        }, 500)
    );

    const handleSearch = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | undefined) => {
        const newString = event?.target.value;
        throttled.current(newString || null);
    };

    const onClose = () => {
        setOpen(false);
        setSearch('');
    };

    useEffect(() => {
        if (search) {
            setSkip(false);
            setOpen(true);
            return;
        }
        setSkip(true);
        setOpen(false);
    }, [search]);

    const onFocus = () => {
        if (!search) {
            setOpen(false);
        }
    };

    const handleOpenConversation = (option: IConversation) => {
        onClose();
        openConversationFromSearch(option);
    };
    return (
        <>
            <Autocomplete
                id="search-tags"
                fullWidth
                open={open}
                size="small"
                onClose={onClose}
                // eslint-disable-next-line no-underscore-dangle
                options={data?._embedded.conversations || (([] as unknown) as IConversation[])}
                filterOptions={(x) => x}
                getOptionLabel={(option) => `${option.customer.email} - ${option.subject}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="No items match your search"
                renderInput={(params) => (
                    <TextField {...params} onFocus={onFocus} value={search} label="Search Conversation" onChange={handleSearch} />
                )}
                onInputChange={(event, newInputValue, reason) => {
                    if (reason === 'reset') {
                        setSearch('');
                        return;
                    }
                    setSearch(newInputValue);
                }}
                onChange={(event: any, newValue: IConversation | null) => {
                    if (newValue && event.type === 'keydown' && event.key === 'Enter') {
                        handleOpenConversation(newValue);
                    }
                }}
                renderOption={(props, option) => (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
                    <Li {...props} key={option.id} onClick={() => handleOpenConversation(option)}>
                        <Grid container alignItems="center">
                            <Grid item>
                                <Box component={MailTwoToneIcon} sx={{ color: 'text.secondary', mr: 2 }} />
                            </Grid>
                            <Grid item xs>
                                <Stack>
                                    <Stack direction="row">
                                        <Box
                                            component="span"
                                            sx={{
                                                display: 'flex',
                                                width: {
                                                    xs: '120px',
                                                    md: '200px',
                                                    lg: '400px',
                                                    xl: '600px'
                                                }
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block',
                                                    fontWeight: option.status === 'Active' ? 'bold' : 'regular'
                                                }}
                                            >
                                                {option.subject} - {option.preview}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        {option.customer.email}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {format(new Date(option.customerWaitingSince.time), 'd MMM')}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Li>
                )}
            />
        </>
    );
};

export default SearchConversation;
