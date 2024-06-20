<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\ServiceResource;
use App\Models\Company;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    /**
     * @param Request $request
     * @param Company $company
     * @return AnonymousResourceCollection
     */
    public function index(Request $request, Company $company): AnonymousResourceCollection
    {
        return ServiceResource::collection($company->services()->public()->paginate());
    }

    /**
     * @param Request $request
     * @param Company $company
     * @param Service $service
     * @return ServiceResource
     */
    public function show(Request $request, Company $company, Service $service): ServiceResource
    {
        return new ServiceResource($service->load(['locations', 'employees.user', 'images']));
    }
}
