import { styled } from '@material-ui/core/styles';
import { Fab } from '@material-ui/core';

const CreateButtonFab = styled(Fab)(({ theme }) => ({
    boxShadow: 'none',
    ml: 1,
    width: '32px',
    height: '32px',
    minHeight: '32px'
}));

export default CreateButtonFab;
