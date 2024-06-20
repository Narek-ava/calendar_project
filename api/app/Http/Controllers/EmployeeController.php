<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employee\CheckEmployeeEmailRequest;
use App\Http\Requests\Employee\EmployeeRequest;
use App\Http\Requests\Employee\InviteExistingUserToEmployeeRequest;
use App\Http\Requests\Employee\ResendInviteEmployeeRequest;
use App\Http\Requests\Employee\SimplifiedCreateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Service;
use App\Services\DataTableService;
use App\Services\EmployeeService;
use App\Traits\WithAudits;
use DomainException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Throwable;

/**
 * @group Employees
 */
class EmployeeController extends Controller
{
    use WithAudits;

    public function __construct(
        private readonly EmployeeService  $employeeService,
        private readonly DataTableService $dataTableService
    )
    {
        $this->authorizeResource(Employee::class, 'employee');
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $employees = auth()->user()->contextCompany->employees()->with(['user', 'services.images', 'locations']);

        return EmployeeResource::collection($this->dataTableService->make($request, $employees));
    }

    /**
     * @throws Throwable
     */
    public function store(EmployeeRequest $request): EmployeeResource|Response
    {
        try {
            $employee = $this->employeeService->inviteEmployee($request->validated());

            return new EmployeeResource($employee->load(['services.images', 'locations', 'user']));
        } catch (DomainException $exception) {
            return response(['message' => $exception->getMessage()], 400);
        }
    }

    public function show(Employee $employee): EmployeeResource
    {
        return new EmployeeResource($employee->load(['services.images', 'locations', 'user']));
    }

    public function update(EmployeeRequest $request, Employee $employee): EmployeeResource|Response
    {
        try {
            $employee = $this->employeeService->updateEmployee($employee, $request->validated());

            return new EmployeeResource($employee->load(['services.images', 'locations', 'user']));
        } catch (Throwable $exception) {
            return response(['message' => $exception->getMessage()], 400);
        }
    }

    public function restore(Employee $employee): Response
    {
        if ($employee->restore()) {
            return response(['message' => 'Succeed']);
        }

        return response(['message' => 'Restore failed'], 500);
    }

    public function destroy(Employee $employee): Response
    {
        try {
            $this->employeeService->delete($employee);

            return response(['message' => 'Employee successfully deleted']);
        } catch (Exception $exception) {
            return response(['message' => $exception->getMessage()], 400);
        }
    }

    /**
     * @param Service $service
     * @param Location $location
     * @return AnonymousResourceCollection
     */
    public function employeesByServiceLocation(Service $service, Location $location): AnonymousResourceCollection
    {
        return EmployeeResource::collection($service->employees($location)->with('user')->get());
    }

    /**
     * @param CheckEmployeeEmailRequest $request
     * @return Response
     */
    public function checkEmail(CheckEmployeeEmailRequest $request): Response
    {
        try {
            return $this->employeeService->checkEmail($request->get('email'));
        } catch (Throwable $exception) {
            return response(['message' => $exception->getMessage()], 400);
        }
    }

    /**
     * @param InviteExistingUserToEmployeeRequest $request
     * @return EmployeeResource|Response
     * @throws Throwable
     */
    public function inviteExistingUser(InviteExistingUserToEmployeeRequest $request): EmployeeResource|Response
    {
        $this->authorize('create', Employee::class);

        try {
            return new EmployeeResource(
                $this->employeeService->inviteExistingUser($request->validated())->load(['services.images', 'locations', 'user'])
            );
        } catch (Throwable $exception) {
            return response(['message' => $exception->getMessage()], 400);
        }
    }

    /**
     * @param string $token
     * @return Response
     */
    public function inviteVerify(string $token): Response
    {
        if ($this->employeeService->acceptInvitation($token)) return response(['message' => 'Invitation accepted']);

        return response(['message' => 'Token not found'], 400);
    }

    /**
     * @param ResendInviteEmployeeRequest $request
     * @param Employee $employee
     * @return Response
     */
    public function resendInvite(ResendInviteEmployeeRequest $request, Employee $employee): Response
    {
        $this->employeeService->resendInvite($employee, $request->validated('email'));
        return response(['message' => 'Invitation accepted']);
    }

    /**
     * @param SimplifiedCreateEmployeeRequest $request
     * @return EmployeeResource|Response
     * @throws Throwable
     */
    public function storeSimplified(SimplifiedCreateEmployeeRequest $request): EmployeeResource|Response
    {
        $this->authorize('create', Employee::class);

        try {
            $employee = $this->employeeService->createSimplifiedEmployee($request->validated('email'));

            return new EmployeeResource($employee->load(['services.images', 'locations', 'user']));
        } catch (Throwable $exception) {
            return response(['message' => $exception->getMessage()], 400);
        }
    }

}
