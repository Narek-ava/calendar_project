import { useCallback } from 'react';
import { IPayment } from '../../../../models/IPayment';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@material-ui/core';
import Delete from '@material-ui/icons/Delete';
import moment from 'moment';
import { methodOptions, reasonOptions } from './PaymentInfoSelectOptions';
import CurrencyFormat from 'react-currency-format';
import { styled } from '@material-ui/core/styles';

interface PaymentsTableProps {
    payments: IPayment[] | null;
    timezone?: string;
    onClickRow: (payment: IPayment, index: number) => void;
    onDelete: (index: number) => void;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    transition: 'background-color 0.3s',
    cursor: 'pointer',

    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.grey[50]
    },

    '&:hover': {
        backgroundColor: theme.palette.grey[100]
    },

    '&:last-child td, &:last-child th': {
        border: 0
    }
}));

const PaymentsTable = ({ payments, timezone, onClickRow, onDelete }: PaymentsTableProps) => {
    const onClickDelete = useCallback(
        (e, index) => {
            e.stopPropagation();
            onDelete(index);
        },
        [onDelete]
    );

    return (
        <Container disableGutters>
            {payments?.length ? (
                <TableContainer component={Paper}>
                    <Table aria-label="Payments Table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Method</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments?.map((payment, index) => (
                                <StyledTableRow key={`payment_row_${index}`} onClick={() => onClickRow(payment, index)}>
                                    <TableCell>
                                        {moment(payment.datetime)
                                            .tz(timezone || 'UTC')
                                            .format('MM/DD/YY')}
                                    </TableCell>
                                    <TableCell>{methodOptions.find((m) => m.value === payment.method)?.label}</TableCell>
                                    <TableCell>{reasonOptions.find((r) => r.value === payment.reason)?.label}</TableCell>
                                    <TableCell>
                                        <CurrencyFormat
                                            value={payment.amount}
                                            prefix="$"
                                            displayType="text"
                                            decimalScale={2}
                                            fixedDecimalScale
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            title="Delete Payment"
                                            size="small"
                                            color="error"
                                            onClick={(e) => {
                                                onClickDelete(e, index);
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>There are no payments yet</Typography>
            )}
        </Container>
    );
};

export default PaymentsTable;
