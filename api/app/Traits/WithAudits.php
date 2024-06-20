<?php

namespace App\Traits;

use App\Http\Resources\AuditResource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

trait WithAudits
{
    /**
     * @param Request $request
     * @param Model $model
     * @return AnonymousResourceCollection
     */
    public function audits(Request $request, Model $model): AnonymousResourceCollection
    {
        $this->authorize('audit', $model);
        
        return AuditResource::collection($model->audits);
    }
}
