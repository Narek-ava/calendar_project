<?php

namespace App\Http\Controllers\Inbox;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inbox\SearchCustomerRequest;
use App\Http\Resources\Inbox\CompanyResource;
use App\Http\Resources\Inbox\CustomerResource;
use App\Models\Appointment;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CompanyController extends Controller
{
    /**
     * @return AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        return CompanyResource::collection(Company::all());
    }

    /**
     * @param SearchCustomerRequest $request
     * @param Company $company
     * @return CustomerResource
     */
    public function searchCustomer(SearchCustomerRequest $request, Company $company): CustomerResource
    {
        return CustomerResource::make($company->customers()
            ->where(function (Builder $query) use ($request) {
                $query
                    ->when($request->validated('email'), fn(Builder $query) => $query->where('email', $request->validated('email')))
                    ->when($request->validated('phone'), fn(Builder $query) => $query->whereRaw("regexp_replace(phone, '[^0-9]+', '', 'g') ILIKE ?", ["%{$request->validated('phone')}%"]));
            })
            ->with(['appointments' => function (Relation $query) {
                $query
                    ->where('start_at', '>=', Carbon::now())
                    ->where('type', Appointment::APPOINTMENT_TYPE)
                    ->active()
                    ->with('service');
            }])
            ->firstOrFail()
        );
    }
}
