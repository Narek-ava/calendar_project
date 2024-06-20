<?php

namespace App\Http\Controllers;

use App\Http\Requests\Service\ServiceOrderingRequest;
use App\Http\Requests\Service\ServiceRequest;
use App\Http\Requests\Service\SimplifiedServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Service;
use App\Services\DataTableService;
use App\Traits\WithAudits;
use Carbon\Carbon;
use Glorand\Model\Settings\Exceptions\ModelSettingsException;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * @group Services
 */
class ServiceController extends Controller
{
    use WithAudits;

    public function __construct(
        private DataTableService $dataTableService
    )
    {
        $this->authorizeResource(Service::class, 'service');
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $services = auth()->user()->contextCompany->services()->filterByRole()
            ->with(['category', 'locations', 'employees.user', 'images']);

        return ServiceResource::collection($this->dataTableService->make($request, $services));
    }

    /**
     * @param ServiceRequest $request
     * @return ServiceResource
     * @throws ModelSettingsException
     */
    public function store(ServiceRequest $request): ServiceResource
    {
        $company = auth()->user()->contextCompany;

        $service = $company->services()->create($request->validated())->refresh();
        $service->locations()->attach($request->get('locations'));
        $service->employees()->attach($request->get('employees'));
        $service->images()->createMany(collect($request->get('images'))->map(function (string $image) {
            return ['link' => $image];
        }));

        // The service should be selected in filter
        $company->employees->each(function (Employee $employee) use ($service) {
            if ($settings = $employee->settings()->get('calendar.locations')) {
                array_walk($settings, fn(&$location) => $location['services'][] = $service->id);
                $employee->settings()->update('calendar.locations', $settings);
            }
        });

        return new ServiceResource($service->load(['category', 'locations', 'employees.user', 'images']));
    }

    /**
     * @param SimplifiedServiceRequest $request
     * @return ServiceResource
     * @throws ModelSettingsException
     */
    public function storeSimplified(SimplifiedServiceRequest $request): ServiceResource
    {
        $company = auth()->user()->contextCompany;

        $service = $company->services()->create([
            'name'                   => $request->validated('name'),
            'service_category_id'    => $company->serviceCategories->first()->id,
            'payment_type'           => Service::FREE_PAYMENT_TYPE,
            'duration'               => 60,
            'interval'               => 0,
            'advance_booking_buffer' => 30,
            'rescheduling_interval'  => 0,
        ])->refresh();

        // The service should be selected in filter
        $company->employees->each(function (Employee $employee) use ($service) {
            if ($settings = $employee->settings()->get('calendar.locations')) {
                array_walk($settings, fn(&$location) => $location['services'][] = $service->id);
                $employee->settings()->update('calendar.locations', $settings);
            }
        });

        // Attach to the only one location
        if ($company->locations->count() === 1) $service->locations()->attach($company->locations->first()->id);

        return new ServiceResource($service->load(['category', 'locations', 'employees.user', 'images']));
    }

    public function show(Service $service): ServiceResource
    {
        return new ServiceResource($service->load(['category', 'locations', 'employees.user', 'images']));
    }

    public function update(ServiceRequest $request, Service $service): ServiceResource
    {
        $service->update($request->validated());
        $service->locations()->sync($request->get('locations'));
        $service->employees()->sync($request->get('employees'));
        $service->images()->createMany(collect($request->get('images'))->filter(function (array|string $image) {
            return !is_array($image);
        })->map(function (string $image) {
            return ['link' => $image];
        }));

        return new ServiceResource($service->load(['category', 'locations', 'employees.user', 'images']));
    }

    public function restore(Service $service): Response
    {
        if ($service->restore()) {
            return response(['message' => 'Succeed'], 200);
        }

        return response(['message' => 'Restore failed'], 500);
    }

    public function destroy(Service $service): Response
    {
        $appointments = $service->appointments()->active()->whereDate('start_at', '>=', Carbon::now())->count();

        if ($appointments) {
            return response(['message' => 'You can’t deactivate service with upcoming appointments, please re-assign the appointments'], 400);
        }

        if ($service->delete()) {
            return response(['message' => 'Service successfully deleted'], 200);
        }

        return response(['message' => 'An error occurred'], 400);
    }

    /**
     * @param ServiceOrderingRequest $request
     * @return Response
     */
    public function updateSortingOrders(ServiceOrderingRequest $request): Response
    {
        // TODO: by slow and stupid way because of auditing. We need to keep history
        // perhaps there is more smart way, investigate this plz later
        foreach ($request->validated('ordering') as $serviceItem) {
            auth()->user()->contextCompany->services->firstWhere('id', $serviceItem['id'])->update([
                'sorting_order' => $serviceItem['sorting_order']
            ]);
        }

        return response(['message' => 'Succeed']);
    }
}
