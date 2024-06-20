<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceCategoryRequest;
use App\Http\Resources\ServiceCategoryResource;
use App\Models\ServiceCategory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * @group Service categories
 */
class ServiceCategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $serviceCategories = auth()->user()->contextCompany->serviceCategories()->with(['services'])->get();

        return ServiceCategoryResource::collection($serviceCategories);
    }

    public function store(ServiceCategoryRequest $request): ServiceCategoryResource
    {
        $serviceCategory = auth()->user()->contextCompany->serviceCategories()->create($request->validated());

        return new ServiceCategoryResource($serviceCategory);
    }

    public function show(ServiceCategory $serviceCategory): ServiceCategoryResource
    {
        return new ServiceCategoryResource($serviceCategory->load(['services']));
    }

    public function update(ServiceCategoryRequest $request, ServiceCategory $serviceCategory): ServiceCategoryResource
    {
        $serviceCategory->update($request->validated());

        return new ServiceCategoryResource($serviceCategory);
    }

    public function destroy(ServiceCategory $serviceCategory)
    {
        if ($serviceCategory->delete()) {
            return response(['message' => 'Category successfully deleted'], 200);
        }

        return response(['message' => 'An error occurred'], 400);
    }
}
