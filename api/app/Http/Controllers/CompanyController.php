<?php

namespace App\Http\Controllers;

use App\Exports\Appointments\AppointmentsDetailedTransactionsReport;
use App\Exports\Appointments\AppointmentsServiceBalanceReport;
use App\Http\Requests\Company\CompanySettingsRequest;
use App\Http\Requests\CompanyRequest;
use App\Http\Requests\Exports\AppointmentsReportRequest;
use App\Http\Resources\AuditResource;
use App\Http\Resources\CompanyResource;
use App\Models\Appointment;
use App\Models\Company;
use App\Models\Image;
use App\Models\User;
use App\Services\CompanyService;
use App\Services\DataTableService;
use App\Traits\WithAudits;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Throwable;
use Twilio\Rest\Client;
use function Sentry\captureException;

/**
 * @group Companies
 */
class CompanyController extends Controller
{
    use WithAudits;

    /**
     * @authenticated
     * @param DataTableService $dataTableService
     * @param CompanyService $companyService
     */
    public function __construct(
        private DataTableService $dataTableService,
        private CompanyService   $companyService
    )
    {
        $this->authorizeResource(Company::class, 'company');
    }

    /**
     * @apiResourceCollection App\Http\Resources\CompanyResource
     * @apiResourceModel App\Models\Company paginate=10
     * @queryParam search string Search for a company by all fields. Example: Beetsoft
     * @queryParam sort Field to sort by. Defaults to 'id'. Example: published_at
     * @queryParam order string Order. Example: asc
     * @queryParam per_page integer Number of companies per page. Example: 10
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $companies = auth()->user()->canImpersonate() ?
            Company::with(['owner', 'address']) :
            auth()->user()->companies()->with(['address']);

        return CompanyResource::collection($this->dataTableService->make(
            $request,
            $companies
        ));
    }

    /**
     * @throws Throwable
     */
    public function store(CompanyRequest $request): CompanyResource|Response
    {
        try {
            $user = User::find(auth()->user()->getAuthIdentifier());

            $company = $this->companyService->createCompany(
                $user,
                $request->validated(),
                $request->get('address', []),
                $request->get('logo'),
                $request->get('logo_rectangular')
            );

            return new CompanyResource($company->load(['address', 'logo']));
        } catch (Exception) {
            return response(['message' => 'An error occurred'], 400);
        }
    }

    public function show(Company $company): CompanyResource
    {
        return new CompanyResource($company->load(['address', 'locations', 'services', 'employees']));
    }

    public function update(CompanyRequest $request, Company $company): CompanyResource
    {
        $company->update($request->validated());
        $company->address()->update($request->get('address'));

        if ($request->get('logo')) {
            if ($company->logo) {
                $company->logo()->update(['link' => $request->get('logo')]);
            } else {
                $company->logo()->save(new Image([
                    'link' => $request->get('logo'),
                    'type' => Company::LOGO_MAIN_TYPE
                ]));
            }
        }

        if ($request->get('logo_rectangular')) {
            if ($company->logoRectangular) {
                $company->logoRectangular()->update(['link' => $request->get('logo_rectangular')]);
            } else {
                $company->logoRectangular()->save(new Image([
                    'link' => $request->get('logo_rectangular'),
                    'type' => Company::LOGO_RECTANGULAR_TYPE
                ]));
            }
        }

        return new CompanyResource($company->fresh()->load(['address', 'logo']));
    }

    public function destroy(Company $company): Response
    {
        if ($company->delete()) {
            return response(['message' => 'Company successfully deleted'], 200);
        }

        return response(['message' => 'An error occurred'], 400);
    }

    /**
     * @param AppointmentsReportRequest $request
     * @param Company $company
     * @return AppointmentsDetailedTransactionsReport|AppointmentsServiceBalanceReport
     */
    public function report(AppointmentsReportRequest $request, Company $company): AppointmentsServiceBalanceReport|AppointmentsDetailedTransactionsReport
    {
        return match ($request->validated('filters.report_type')) {
            Appointment::SERVICE_BALANCE_REPORT_TYPE       => new AppointmentsServiceBalanceReport($request, $company), // OLD
            Appointment::DETAILED_TRANSACTIONS_REPORT_TYPE => new AppointmentsDetailedTransactionsReport($request, $company) // NEW
        };
    }

    /**
     * @param Request $request
     * @param Company $company
     * @return AnonymousResourceCollection
     */
    public function audits(Request $request, Company $company): AnonymousResourceCollection
    {
        $this->authorize('audit', $company);

        return AuditResource::collection($company->audits);
    }

    /**
     * @param CompanySettingsRequest $request
     * @param Company $company
     * @return CompanyResource|Response
     */
    public function updateSettings(CompanySettingsRequest $request, Company $company): CompanyResource|Response
    {
        try {
            $company->settings()->apply((array)$request->validated('settings'));
            return new CompanyResource($company->load(['address', 'logo']));
        } catch (Exception) {
            return response(['message' => 'An error occurred'], 400);
        }
    }

    /**
     * @param Company $company
     * @return Response
     * @throws Throwable
     */
    public function twilioPhones(Company $company): Response
    {
        if (!$company->is_twilio_enabled)
            return response(['message' => "Twilio is not enabled for this company. Please contact support"], 400);

        try {
            $authToken = $company->settings()->get('integrations.twilio.auth_token');
            $accountSid = $company->settings()->get('integrations.twilio.account_sid');

            $twilioClient = new Client($accountSid, $authToken);

            return response(array_map(
                fn($number) => ['phone_number' => $number->phoneNumber, 'friendly_name' => $number->friendlyName],
                $twilioClient->incomingPhoneNumbers->read()
            ));
        } catch (Throwable $exception) {
            captureException($exception);
            return response(['message' => "{$exception->getMessage()}. Please contact support"], 400);
        }
    }

    /**
     * @param Request $request
     * @param Company $company
     * @return Response
     */
    public function updateWaiver(Request $request, Company $company): Response
    {
        return response(
            $company->update(['waiver_data' => $request->input('waiver_data')]), 204
        );
    }
}
