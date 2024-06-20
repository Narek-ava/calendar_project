import { Grid, Menu, MenuItem, Pagination } from '@material-ui/core';
import { gridSpacing } from '../store/constant';
import { Button, useTheme } from '@mui/material';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import React from 'react';

interface PagePagination {
    data: any;
    handleClick: (e: React.MouseEvent) => void;
    perPage: number;
    anchorEl: Element | ((element: Element) => Element) | null | undefined;
    handleClose: (limit?: number) => void;
    page: number;
    setPage: (arg: number) => void;
    additionalContent?: React.ReactNode | string;
}

const AppPagePagination = ({ data, handleClick, perPage, anchorEl, handleClose, setPage, page, additionalContent }: PagePagination) => {
    const theme = useTheme();
    return (
        <Grid item xs={12} sx={{ px: { xs: 0, sm: 3 }, py: { xs: 2, sm: gridSpacing } }}>
            <Grid container justifyContent="space-between" spacing={{ xs: 1, sm: 3 }} alignItems="center">
                <Grid item>
                    <Pagination
                        page={page}
                        onChange={(event, selectedPage) => setPage(selectedPage)}
                        count={data?.meta.last_page}
                        color="secondary"
                        shape="rounded"
                    />
                </Grid>
                {additionalContent && (
                    <Grid item ml={2}>
                        {additionalContent}
                    </Grid>
                )}
                <Grid item>
                    <Button
                        size="large"
                        sx={{ color: theme.palette.grey[900] }}
                        color="secondary"
                        endIcon={<ExpandMoreRoundedIcon />}
                        onClick={handleClick}
                    >
                        {perPage}
                    </Button>
                    <Menu
                        id="menu-user-list-style1"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={() => handleClose()}
                        variant="selectedMenu"
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                        }}
                    >
                        <MenuItem onClick={() => handleClose(10)}> 10</MenuItem>
                        <MenuItem onClick={() => handleClose(25)}> 25</MenuItem>
                        <MenuItem onClick={() => handleClose(100)}> 100</MenuItem>
                    </Menu>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default AppPagePagination;
