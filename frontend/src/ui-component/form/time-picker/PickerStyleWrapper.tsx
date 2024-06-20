import { styled } from '@material-ui/core/styles';

const PickerStyleWrapper = styled('div')(({ theme }) => ({
    '& input[type="time"]::-webkit-calendar-picker-indicator': {
        display: 'none'
    }
}));

export default PickerStyleWrapper;
