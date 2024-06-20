import { IAppointment, IAppointmentPayload } from '../../../../models/IAppointment';

const useAppointmentFunctions = () => {
    const formatAppointmentPayload = (appointment: IAppointment) =>
        (({
            employee_id: appointment.employee.id,
            location_id: appointment.location.id,
            service_id: appointment.service.id,
            customer_id: appointment.customer.id,
            start_at: appointment.start_at,
            end_at: appointment.end_at,
            note: appointment.note,
            private_note: appointment.private_note,
            images: appointment.images,
            price: appointment.price,
            payments: appointment.payments
        } as unknown) as IAppointmentPayload);

    return { formatAppointmentPayload };
};

export default useAppointmentFunctions;
