<?php

namespace App\Http\Controllers;

use App\Exports\CustomersExport;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Requests\Exports\CustomersExportRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use App\Services\DataTableService;
use App\Traits\WithAudits;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * @group Customers
 */
class CustomerController extends Controller
{
    use WithAudits;

    public function __construct(
        private DataTableService $dataTableService,
        private CustomerService  $customerService
    )
    {
        $this->authorizeResource(Customer::class, 'customer');
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return CustomerResource::collection($this->dataTableService->make($request, auth()
            ->user()->contextCompany->customers()->with(['address', 'contacts'])));
    }

    public function store(StoreCustomerRequest $request): CustomerResource
    {
        $customer = $this->customerService->createCustomer(auth()->user()->contextCompany, $request->validated());

        return new CustomerResource($customer->load(['address', 'contacts']));
    }

    public function show(Customer $customer): CustomerResource
    {
        return new CustomerResource($customer->load([
            'address',
            'contacts',
            'appointments' => fn(HasMany $q) => $q->with(['employeeTrashed.user', 'serviceTrashed', 'locationTrashed']),
        ]));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): CustomerResource
    {
        $customer = $this->customerService->updateCustomer($customer, $request->validated());

        return new CustomerResource($customer->load(['address', 'contacts']));
    }

    public function destroy(Customer $customer): Response
    {
        $appointments = $customer->appointments()->active()->whereDate('start_at', '>=', Carbon::now())->count();

        if ($appointments) {
            return response(['message' => 'You can’t delete customer with upcoming appointments, please re-assign the appointments'], 400);
        }

        if ($customer->delete()) {
            return response(['message' => 'Customer successfully deleted'], 200);
        }

        return response(['message' => 'An error occurred'], 400);
    }

    /**
     * @param CustomersExportRequest $request
     * @return CustomersExport
     */
    public function export(CustomersExportRequest $request): CustomersExport
    {
        return new CustomersExport($request);
    }
}
