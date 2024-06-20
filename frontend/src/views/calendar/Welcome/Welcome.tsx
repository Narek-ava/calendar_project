import { useMemo } from 'react';
import MainCard from '../../../ui-component/cards/MainCard';
import { CardContent, Grid, Divider, CardActions, Button } from '@material-ui/core';
import { gridSpacing } from '../../../store/constant';
import ToDoRow from './ToDoRow';
import { ILocation } from '../../../models/ILocation';
import { IService } from '../../../models/IService';
import { IEmployee } from '../../../models/IEmployee';

interface WelcomeProps {
    locations: ILocation[];
    services: IService[];
    employees: IEmployee[];
}

const Welcome = ({ locations, services, employees }: WelcomeProps) => {
    const hasLocation = useMemo(() => !!locations.length, [locations]);
    const hasService = useMemo(() => !!services.length, [services]);
    const serviceHasLocation = useMemo(() => !!services.find((s) => s.locations?.length), [services]);
    const hasEmployee = useMemo(() => !!employees.length, [employees]);
    const employeeHasService = useMemo(() => !!employees.find((e) => e.services?.length), [employees]);
    const employeeHasLocation = useMemo(() => !!employees.find((e) => e.locations?.length), [employees]);

    const toDoItems = [
        { text: 'Setup location', isCompleted: hasLocation, linkUrl: '/location' },
        { text: 'Add service', isCompleted: hasService, linkUrl: '/service' },
        { text: 'Assign service to location', isCompleted: serviceHasLocation, linkUrl: '/service' },
        { text: 'Add staff', isCompleted: hasEmployee, linkUrl: '/employee' },
        { text: 'Assign staff to service', isCompleted: employeeHasService, linkUrl: '/employee' },
        { text: 'Assign staff to location', isCompleted: employeeHasLocation, linkUrl: '/employee' }
    ];

    return (
        <MainCard title="Setup Your Company to Use Calendar" content={false}>
            <CardContent>
                <Grid container spacing={gridSpacing} alignItems="center" p={1} id="ToDo-Items">
                    {toDoItems.map((item) => (
                        <ToDoRow text={item.text} isCompleted={item.isCompleted} linkUrl={item.linkUrl} />
                    ))}
                </Grid>
            </CardContent>
            <Divider />
            <CardActions>
                <Button
                    variant="text"
                    size="small"
                    href="https://app.chilledbutter.com/cal/chilled-butter-1/service-request-assistance/employee-chilled-butter"
                    target="_blank"
                >
                    Having trouble? Schedule a call with us
                </Button>
            </CardActions>
        </MainCard>
    );
};

export default Welcome;
