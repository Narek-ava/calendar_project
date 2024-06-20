<?php

namespace App\Http\Controllers;

use App\Http\Requests\LocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Address;
use App\Models\Location;
use App\Models\Service;
use App\Services\DataTableService;
use App\Traits\WithAudits;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * @group Locations
 */
class LocationController extends Controller
{
    use WithAudits;

    public function __construct(
        private DataTableService $dataTableService
    ) {
        $this->authorizeResource(Location::class, 'location');
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $locations = auth()->user()->contextCompany->locations()->filterByRole()->with(['employees.user', 'services.images']);

        return LocationResource::collection($this->dataTableService->make($request, $locations));
    }

    public function store(LocationRequest $request): LocationResource
    {
        $company = auth()->user()->contextCompany;

        $location = $company->locations()->create($request->validated());
        $location->address()->save(new Address($request->get('address', [])));

        return new LocationResource($location->load('employees.user', 'services.images'));
    }

    public function show(Location $location): LocationResource
    {
        return new LocationResource($location->load('employees.user', 'services'));
    }

    public function update(LocationRequest $request, Location $location): LocationResource
    {
        $location->update($request->validated());
        $location->address()->update($request->get('address', []));

        return new LocationResource($location->load('employees.user', 'services.images'));
    }

    public function locationsByService(Service $service): AnonymousResourceCollection
    {
        return LocationResource::collection($service->locations);
    }

    public function restore(Location $location): Response
    {
        if ($location->restore()) {
            return response(['message' => 'Succeed'], 200);
        }

        return response(['message' => 'Restore failed'], 500);
    }

    public function destroy(Location $location): Response
    {
        $appointments = $location->appointments()->active()->whereDate('start_at', '>=', Carbon::now())->count();

        if ($appointments) {
            return response(['message' => 'You can’t deactivate location with upcoming appointments, please re-assign the appointments'], 400);
        }

        if ($location->delete()) {
            return response(['message' => 'Location successfully deleted'], 200);
        }

        return response(['message' => 'An error occurred'], 400);
    }
}
