<?php

namespace App\Http\Controllers;

use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentPaymentsRequest;
use App\Http\Requests\Appointment\UpdateAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentStatusRequest;
use App\Http\Resources\AppointmentListResource;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\GlobalAppointmentListResource;
use App\Models\Appointment;
use App\Services\AppointmentService;
use App\Services\CalendarService;
use App\Services\Exceptions\AppointmentException;
use App\Services\SubscriptionLimitsService;
use App\Traits\WithAudits;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class AppointmentController extends Controller
{
    use WithAudits;

    public function __construct(
        private readonly CalendarService    $calendarService,
        private readonly AppointmentService $appointmentService
    )
    {
        $this->authorizeResource(Appointment::class, 'appointment');
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return AppointmentListResource::collection($this->calendarService->make($request, auth()
            ->user()->contextCompany->appointments()->filterByRole()->with([
                'employeeTrashed.user', 'locationTrashed', 'serviceTrashed', 'customerTrashed.address', 'images'
            ]))
        );
    }

    /**
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function globalAppointments(Request $request): AnonymousResourceCollection
    {
        $employeeIds = auth()->user()->contextCompany->employees()
            ->when($request->has('filters.location') && !is_null($request->input('filters.location')), function ($query) use ($request) {
                $query->whereHas('locations', fn($query) => $query->whereIn('id', array_filter(explode(',', $request->input('filters.location')), 'is_numeric')));
            })
            ->when($request->has('filters.employee') && !is_null($request->input('filters.employee')), function ($query) use ($request) {
                $query->whereIn('id', array_filter(explode(',', $request->input('filters.employee')), 'is_numeric'));
            })
            ->get()
            ->pluck('user.employees.*.id')
            ->flatten();

        // Cleanup request since we need only employee ids
        $request->merge(['filters' => ['location' => null, 'customer' => null, 'service' => null, 'employee' => implode(',', $employeeIds->toArray())]]);

        // Get only active appointments from another employees from another companies
        return GlobalAppointmentListResource::collection(
            $this->calendarService->make($request, Appointment::query()
                ->when(
                    // It means Single User subscription must see canceled and completed global appointments on his calendar
                    // But another users should not see his such global appointments from another companies
                    auth()->user()->contextCompany->companyOwner->subscription_type !== SubscriptionLimitsService::SINGLE_USER_TYPE,
                    fn($q) => $q->active(),
                )
//                ->active()
                ->whereHas('company')
                ->where('company_id', '!=', auth()->user()->contextCompany->id)
                ->whereIn('employee_id', $employeeIds)
                ->filterByRole()
            )
        );
    }

    public function store(StoreAppointmentRequest $request): AppointmentResource|Response
    {
        try {
            $appointment = match ($request->get('type')) {
                Appointment::APPOINTMENT_TYPE => $this->appointmentService->employeeCreateAppointment(
                    auth()->user()->contextCompany,
                    $request->validated()
                ),
                Appointment::BLOCKED_TIME_TYPE => $this->appointmentService->createBlockedTime(
                    auth()->user()->contextCompany,
                    $request->validated()
                )
            };

            return new AppointmentResource($appointment->refresh()->load([
                'employeeTrashed.user', 'locationTrashed', 'serviceTrashed', 'customerTrashed.address', 'images'
            ]));
        } catch (AppointmentException $e) {
            return response(['message' => $e->getMessage()], 400);
        }
    }

    public function show(Appointment $appointment): AppointmentResource
    {
        return new AppointmentResource($appointment->load([
            'employeeTrashed' => fn($q) => $q->withCount(['locations'])->with('user'),
            'locationTrashed', 'serviceTrashed', 'customerTrashed.address', 'images'
        ]));
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): AppointmentResource|Response
    {
        try {
            $appointment = match ($appointment->type) {
                Appointment::APPOINTMENT_TYPE => $this->appointmentService->employeeUpdateAppointment(
                    $appointment,
                    $request->validated()
                ),
                Appointment::BLOCKED_TIME_TYPE => $this->appointmentService->updateBlockedTime(
                    $appointment,
                    $request->validated()
                )
            };

            return new AppointmentResource($appointment->refresh()->load([
                'employeeTrashed.user', 'locationTrashed', 'serviceTrashed', 'customerTrashed.address', 'images'
            ]));
        } catch (AppointmentException $e) {
            return response(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy(Appointment $appointment): Response
    {
        if ($appointment->delete()) {
            return response(['message' => 'Appointment successfully deleted'], 200);
        }

        return response(['message' => 'An error occurred'], 400);
    }

    /**
     * @param UpdateAppointmentStatusRequest $request
     * @param Appointment $appointment
     * @return Response
     */
    public function status(UpdateAppointmentStatusRequest $request, Appointment $appointment): Response
    {
        $this->appointmentService->setStatus($appointment, $request->validated());
        return response(['message' => 'Status updated']);
    }

    /**
     * @param UpdateAppointmentPaymentsRequest $request
     * @param Appointment $appointment
     * @return AppointmentResource
     */
    public function payments(UpdateAppointmentPaymentsRequest $request, Appointment $appointment): AppointmentResource
    {
        $appointment->update(['payments' => $request->validated('payments')]);

        return new AppointmentResource($appointment->load([
            'employeeTrashed.user', 'locationTrashed', 'serviceTrashed', 'customerTrashed.address', 'images'
        ]));
    }
}
