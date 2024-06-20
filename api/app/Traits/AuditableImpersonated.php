<?php

namespace App\Traits;

use Illuminate\Support\Arr;
use OwenIt\Auditing\Auditable;

trait AuditableImpersonated
{
    use Auditable;

    /**
     * {@inheritdoc}
     */
    public function transformAudit(array $data): array
    {
        $manager = app('impersonate');
        if ($manager->isImpersonating()) Arr::set($data, 'impersonator_id', $manager->getImpersonatorId());
        
        return $data;
    }
}

