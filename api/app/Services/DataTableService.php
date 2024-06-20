<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

final class DataTableService
{
    public function make(
        Request $request,
        Builder|Relation $builder
    ): LengthAwarePaginator {
        if ($request->has('search')) {
            $builder = $builder->search($request->get('search'));
        }

        if ($request->has('filters')) {
            $builder = $builder->filters($request->get('filters'));
        }

        if ($request->has('sort')) {
            $builder = $builder->sort($request->get('sort'), $request->get('order', 'asc'));
        }

        if ($request->has('trashed')) {
            $builder = $builder->withTrashed();
        }

        return $builder->paginate($request->get('per_page', 10));
    }
}
