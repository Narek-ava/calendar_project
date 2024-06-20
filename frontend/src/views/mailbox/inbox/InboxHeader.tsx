// material-ui
import { Grid, IconButton, Stack, TablePagination } from '@material-ui/core';

// assets
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
// import SearchIcon from '@material-ui/icons/Search';

// project imports
import { InboxHeaderProps } from './types';

// ==============================|| MAIL LIST HEADER ||============================== //

const InboxHeader = ({ length, rowsPerPage, page, handleChangePage, handleDrawerOpen }: InboxHeaderProps) => (
    <>
        <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
                <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1.5}>
                    <IconButton onClick={handleDrawerOpen} size="small">
                        <MenuRoundedIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Grid>
            <Grid item sx={{ display: { xs: 'none', sm: 'block' } }} flexGrow={1}>
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1.5}>
                    <TablePagination
                        sx={{ '& .MuiToolbar-root': { pl: 1, py: 0 } }}
                        rowsPerPageOptions={[]}
                        component="div"
                        count={length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                    />
                </Stack>
            </Grid>
        </Grid>
    </>
);

export default InboxHeader;
