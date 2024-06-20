<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\EmployeeResource;
use App\Models\Company;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmployeeController extends Controller
{
    /**
     * @param Request $request
     * @param Company $company
     * @return AnonymousResourceCollection
     */
    public function index(Request $request, Company $company): AnonymousResourceCollection
    {
        return EmployeeResource::collection($company->employees()->selfBook()->paginate());
    }

    /**
     * @param Request $request
     * @param Company $company
     * @param Employee $employee
     * @return EmployeeResource
     */
    public function show(Request $request, Company $company, Employee $employee): EmployeeResource
    {
        return new EmployeeResource($employee->load(['user', 'locations', 'services.images']));
    }
}
