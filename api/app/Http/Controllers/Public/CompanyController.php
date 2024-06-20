<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\CompanyResource;
use App\Http\Resources\Public\EmployeeResource;
use App\Models\Company;
use App\Models\Location;
use App\Models\Service;
use App\Services\CustomerService;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Throwable;

/**
 * @group Appointments
 */
class CompanyController extends Controller
{
    /**
     * @param CustomerService $customerService
     */
    public function __construct(private readonly CustomerService $customerService)
    {
    }

    /**
     * @param Request $request
     * @param Company $company
     * @return CompanyResource
     */
    public function show(Request $request, Company $company): CompanyResource
    {
        $fallbackRelations = [
            // TODO: fallback, remove after slugs implementation
            'serviceCategories.services' => fn(HasMany $q) => $q->public()->with(['locations', 'images']),
        ];

        // All relations in case if no slugs are in input
        $availableRelations = [
            'services'  => fn($q) => $q->with('images'),
            'locations' => fn($q) => $q,
            'employees' => fn($q) => $q->selfBook()->with('user'),
        ];

        // Slugs string from FE
        $relationsString = $request->input('query');

        // Return all available relations without filtration
        if (!$relationsString) return new CompanyResource($company->load($fallbackRelations));

        $queriedRelations = [];

        foreach (explode('/', $relationsString) as $i => $item) {
            try {
                list($relationName, $relationSlug) = explode('-', $item, 2);
                $relationName = Str::plural($relationName);
            } catch (Throwable $exception) {
                continue;
            }

            if (!array_key_exists($relationName, $availableRelations)) continue;
            $queriedRelations[$relationName] = $relationSlug;
        }

        if (!count($queriedRelations)) return new CompanyResource($company->load($fallbackRelations));

        // Filter the rest relations by queried
        foreach ($availableRelations as $availableRelationName => $availableRelationQuery) {
            $availableRelations[$availableRelationName] = function ($q) use ($availableRelationName, $availableRelationQuery, $queriedRelations) {
                foreach ($queriedRelations as $queriedRelationName => $queriedRelationSlug) {
                    if ($availableRelationName === $queriedRelationName) {
                        $availableRelationQuery($q)->whereSlug($queriedRelationSlug);
                    } else {
                        /*
                         * Private services are available only by direct link like:
                         * ?query=location-awesome-place/service-fast-haircut
                         * ?query=service-fast-haircut
                         *
                         * But should not be available by links like:
                         * ?query=
                         * ?query=location-awesome-place
                         * ?query=employee-john-smith
                         */
                        if ($availableRelationName === 'services' && !array_key_exists('services', $queriedRelations)) {
                            $availableRelationQuery($q)->whereRelation($queriedRelationName, 'is_private', false);
                        }
                        $availableRelationQuery($q)->whereRelation($queriedRelationName, 'slug', $queriedRelationSlug);
                    }
                }
            };
        }

        return new CompanyResource($company->load(array_merge($availableRelations, $fallbackRelations)));
    }

    /**
     * @param Company $company
     * @param Service $service
     * @param Location $location
     * @return AnonymousResourceCollection
     */
    public function employees(Company $company, Service $service, Location $location): AnonymousResourceCollection
    {
        return EmployeeResource::collection($service->employees($location)->selfBook()->with('user')->get());
    }

    /**
     * Handle webhook without queues but(!) in case of delays or many requests do it via the queued job
     *
     * Example of incoming request:
     * {
     * "What best describes you?": "string",
     * "What's your name?": "John",
     * "How should we get back to you?": "string",
     * "What's your phone number?": "123123123",
     * "What's your email address?": "inbox@example.com",
     * "tripettoId": "0000000000",
     * "tripettoIndex": 1,
     * "tripettoCreateDate": "2022-11-09T06:45:43.492Z",
     * "tripettoFingerprint": "6df17a9efbdc75f713a8ee07db784be94acd1457133146b705a090a9ae94eda7"
     * }
     *
     * @param Request $request
     * @param Company $company
     * @return Response
     */
    public function handleTripettoWebhook(Request $request, Company $company): Response
    {
        // Do nothing for another companies
        if (app()->isProduction() && $company->slug !== 'the-honorable-society')
            return response(['result' => false, 'message' => 'wrong company'], 400);

        // Map Tripetto fields into needed CB fields
        $fieldsMap = [
            "What's your name?"          => 'full_name',
            "What's your phone number?"  => 'phone',
            "What's your email address?" => 'email',
        ];

        $customerData = [
            'firstname' => null,
            'lastname'  => null,
            'phone'     => null,
            'email'     => null,
        ];

        foreach ($request->only(array_keys($fieldsMap)) as $fieldName => $fieldValue) {
            if ($fieldsMap[$fieldName] !== 'full_name') {
                $customerData[$fieldsMap[$fieldName]] = $fieldValue;
            } else {
                $fullName = explode(' ', $fieldValue, 2);
                $customerData['firstname'] = $fullName[0];
                $customerData['lastname'] = $fullName[1] ?? null;
            }
        }

        $this->customerService->getOrCreateCustomer($company, $customerData);

        return response(['result' => true, 'message' => 'ok']);
    }
}
