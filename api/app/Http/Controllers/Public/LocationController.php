<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\LocationResource;
use App\Models\Company;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LocationController extends Controller
{
    /**
     * @param Request $request
     * @param Company $company
     * @return AnonymousResourceCollection
     */
    public function index(Request $request, Company $company): AnonymousResourceCollection
    {
        return LocationResource::collection($company->locations()->paginate());
    }

    /**
     * @param Request $request
     * @param Company $company
     * @param Location $location
     * @return LocationResource
     */
    public function show(Request $request, Company $company, Location $location): LocationResource
    {
        return new LocationResource($location->load(['services.images', 'employees' => fn($q) => $q->selfBook()->with('user')]));
    }
}
