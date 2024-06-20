import { useCallback } from 'react';
import { ICompany, IWidgetLinkBuilder } from '../../models/ICompany';
import {
    Box,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from '@mui/material';
import Delete from '@material-ui/icons/Delete';
import Add from '@material-ui/icons/Add';
import useAuth from '../../hooks/useAuth';
import useShowSnackbar from '../../hooks/useShowSnackbar';
import { SnackBarTypes } from '../../store/snackbarReducer';
import InfoTooltip from '../../ui-component/InfoTooltip';

interface WidgetLinkBuilderProps {
    links?: IWidgetLinkBuilder[];
    setFieldValue: (fieldName: string, value: any) => void;
    company: ICompany;
}

const WidgetLinkBuilder = ({ links, setFieldValue, company }: WidgetLinkBuilderProps) => {
    const { user } = useAuth();
    const { showSnackbar } = useShowSnackbar();

    const handleDelete = useCallback(
        (index: number) => {
            const values = links?.length ? [...links] : [];
            values?.splice(index, 1);
            setFieldValue('link_builder', values || undefined);
        },
        [links, setFieldValue]
    );

    const addRow = useCallback(() => {
        const emptyRow = { location_id: null, service_id: null, employee_id: null };
        const value = links?.length ? [...links, emptyRow] : [emptyRow];
        setFieldValue('link_builder', value);
    }, [links, setFieldValue]);

    const copyLink = useCallback(
        (index) => {
            let url = `${window.location.origin}/cal/${user?.currentCompany.slug}`;
            if (links?.length) {
                const row = links[index];

                if (row.location_id) url += `/location-${company.locations?.find((l) => l.id === row.location_id)?.slug}`;

                if (row.service_id) url += `/service-${company.services?.find((s) => s.id === row.service_id)?.slug}`;

                if (row.employee_id) url += `/employee-${company.employees?.find((e) => e.id === row.employee_id)?.slug}`;
            }

            navigator.clipboard.writeText(url).then(() => {
                showSnackbar({
                    message: 'Copied!',
                    alertSeverity: SnackBarTypes.Success
                });
            });
        },
        [company, links, user, showSnackbar]
    );

    return (
        <>
            <Typography variant="h4" color="primary" display="flex" alignItems="center">
                Link Builder
                <InfoTooltip text="Use link builder to create booking widget links that target specific locations, services, providers, or any combinations of the three. Share this links directly with select customers when needed. Private services are only available for booking using service specific link." />
            </Typography>
            <Box mt={1} mb={2} overflow="auto">
                <Table>
                    <TableBody>
                        {links?.map((link, index) => (
                            <TableRow key={`link_builder_${index}`}>
                                <TableCell width={50}>
                                    <IconButton onClick={() => handleDelete(index)}>
                                        <Delete color="error" />
                                    </IconButton>
                                </TableCell>
                                <TableCell width={200}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id={`location_label_${index}`}>Location</InputLabel>
                                        <Select
                                            labelId={`location_label_${index}`}
                                            label="Location"
                                            value={link.location_id || ''}
                                            onChange={(event) => {
                                                setFieldValue(`link_builder[${index}].location_id`, event.target.value);
                                            }}
                                        >
                                            <MenuItem value="">
                                                <i>None</i>
                                            </MenuItem>
                                            {company.locations?.map((location) => (
                                                <MenuItem key={`location_${index}_${location.id}`} value={location.id}>
                                                    {location.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell width={200}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id={`service_label_${index}`}>Service</InputLabel>
                                        <Select
                                            labelId={`service_label_${index}`}
                                            label="Service"
                                            value={link.service_id || ''}
                                            onChange={(event) => {
                                                setFieldValue(`link_builder[${index}].service_id`, event.target.value);
                                            }}
                                        >
                                            <MenuItem value="">
                                                <i>None</i>
                                            </MenuItem>
                                            {company.services?.map((service) => (
                                                <MenuItem key={`service_${index}_${service.id}`} value={service.id}>
                                                    {service.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell width={200}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id={`employee_label_${index}`}>Staff</InputLabel>
                                        <Select
                                            labelId={`employee_label_${index}`}
                                            label="Staff"
                                            value={link.employee_id || ''}
                                            onChange={(event) => {
                                                setFieldValue(`link_builder[${index}].employee_id`, event.target.value);
                                            }}
                                        >
                                            <MenuItem value="">
                                                <i>None</i>
                                            </MenuItem>
                                            {company.employees?.map((employee) => (
                                                <MenuItem key={`employee_${index}_${employee.id}`} value={employee.id}>
                                                    {`${employee.user.firstname} ${employee.user.lastname}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <Button variant="contained" onClick={() => copyLink(index)}>
                                        Copy Link
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
            <Button startIcon={<Add />} onClick={addRow} variant="outlined">
                Add
            </Button>
        </>
    );
};

export default WidgetLinkBuilder;
