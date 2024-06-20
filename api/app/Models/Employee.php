<?php

namespace App\Models;

use App\Traits\AuditableImpersonated;
use App\Traits\Filterable;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Glorand\Model\Settings\Traits\HasSettingsField;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Arr;
use OwenIt\Auditing\Contracts\Auditable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Employee extends Model implements Auditable
{
    use Filterable;
    use SoftDeletes;
    use HasRoles;
    use AuditableImpersonated;
    use HasSlug;
    use HasSettingsField;
    use HasFactory;

    protected $fillable = [
        'user_id',
        'profession_title',
        'verify_token',
        'verified_at',
        'background_color',
        'text_color',
        'self_book',
        'schedule',
        'is_shifts_enabled',
        'shifts',
        'is_invite_accepted'
    ];

    protected $searchable = ['firstname', 'lastname', 'email'];

    protected $casts = [
//        'verified_at'        => 'timestamp',
        'schedule'           => 'array',
        'self_book'          => 'boolean',
        'is_shifts_enabled'  => 'boolean',
        'shifts'             => 'array',
        'is_invite_accepted' => 'boolean',
    ];

    protected $attributes = [
        'background_color' => '2196F3',
        'text_color'       => 'ffffff',
        'schedule'         => '[
            {"id":"1","label":"Monday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"2","label":"Tuesday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"3","label":"Wednesday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"4","label":"Thursday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"5","label":"Friday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"6","label":"Saturday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"0","label":"Sunday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"}
        ]',
        'self_book'        => true,
        'settings'         => [
            'calendar' => [
                'cell_duration'              => 60,
                'show_scheduled_staff'       => false,
                'show_canceled_appointments' => true,
                'selected_location_id'       => null,
                'locations'                  => null,
            ],
            'widget'   => [
                'use_location_schedule'    => true,
                'accounting_google_events' => true
            ]
        ],
        'shifts'           => '[]'
    ];

    protected static function booted()
    {
        static::addGlobalScope('active', function (Builder $builder) {
            $builder->whereNotNull('verified_at');
        });
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'location_employee');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'service_employee');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function avatar(): MorphOne
    {
        return $this->morphOne(Image::class, 'resource');
    }

    public function getIsVerifiedAttribute(): bool
    {
        return (bool)$this->verified_at;
    }

    public function getStatusAttribute(): string
    {
        return $this->isVerified ? 'active' : 'pending';
    }

    public function isOwner(): bool
    {
        return (bool)$this->user->companyOwner;
    }

    /**
     * Incoming $date should be in tz of location
     *
     * @param CarbonImmutable $date
     * @param Location|null $location
     * @return CarbonPeriod|null
     */
    public function workingHours(CarbonImmutable $date, ?Location $location = null): ?CarbonPeriod
    {
        // Since we store working hours or shifts w/o timezone assumes it's always UTC
        // But at the end we need to return period of working hours on location timezone

        // Convert to utc, to reduce code and bugs
        $timezone = $date->getTimezone();
        $selectedDate = $date->shiftTimezone('UTC');

        // Regular schedule
        $schedule = collect($location->schedule ?? $this->schedule)->where('id', $selectedDate->dayOfWeek)->first();
        if ($schedule['enable']) {
            // Date of day stored as shit...
            $openDate = CarbonImmutable::parse($schedule['start'])->setDateFrom($selectedDate)->setSecond(0);
            $closeDate = CarbonImmutable::parse($schedule['end'])->setDateFrom($selectedDate)->setSecond(0);
        }

        // Shifted dates overrides
        if ($this->is_shifts_enabled) {

            // Prepare periods from DB and filter too old periods
            $periods = collect($this->shifts)->map(function ($shiftedDate) use ($selectedDate) {
                return [
                    ...$shiftedDate,
                    'start' => CarbonImmutable::parse(Arr::get($shiftedDate, 'start'))->setSecond(0),
                    'end'   => CarbonImmutable::parse(Arr::get($shiftedDate, 'end'))->setSecond(0),
                ];
            })->filter(fn($shiftedDate) => $selectedDate->lessThanOrEqualTo(Arr::get($shiftedDate, 'end')));

            $shifts = collect();

            // Generate array of shifts from periods
            foreach ($periods as $shift) {
                $start = Arr::get($shift, 'start');
                $end = Arr::get($shift, 'end');

                foreach ($start->daysUntil($end) as $shiftedDate) {
                    $shifts->push([
                        ...$shift,
                        'start' => $shiftedDate->setTimeFrom($start),
                        'end'   => $shiftedDate->setTimeFrom($end),
                    ]);
                }
            }

            // Find incoming date in array of generated shifts
            $shiftedDate = $shifts->first(fn($shiftedDate) => $selectedDate->isSameDay(Arr::get($shiftedDate, 'start')));

            // Given day is disabled by custom shift
            if ($shiftedDate && !Arr::get($shiftedDate, 'opened')) return null;

            // Given day has another schedule from custom shift
            if ($shiftedDate && Arr::get($shiftedDate, 'opened')) {
                $openDate = Arr::get($shiftedDate, 'start');
                $closeDate = Arr::get($shiftedDate, 'end');
            }
        }

        // Period in location's timezone!
        if (isset($openDate) && isset($closeDate)) return $openDate->toPeriod($closeDate)->shiftTimezone($timezone);

        return null;
    }

    //TODO: Refactor to make global scope or trait Searchable or using Laravel Scout
    public function scopeSearch(Builder $query, string|null $search): Builder
    {
        if ($search) {
            return $query->whereHas('user', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    foreach ($this->searchable as $column) {
                        $query->orWhere($column, 'ILIKE', "%{$search}%");
                    }
                });
            });
        }

        return $query;
    }

    public function scopeSort(Builder $query, string $field, string $order = 'asc'): Builder
    {
        return $query->select('employees.*')
            ->join('users', 'users.id', '=', 'employees.user_id')
            ->leftJoin('model_has_roles', function ($join) {
                $join->on('model_has_roles.model_id', '=', 'employees.user_id')
                    ->on('model_has_roles.company_id', '=', 'employees.company_id')
                    ->where('model_has_roles.model_type', '=', User::class);
            })
            ->leftJoin('roles as role', function ($join) {
                $join->on('role.id', '=', 'model_has_roles.role_id')
                    ->on('role.company_id', '=', 'employees.company_id');
            })
            ->orderBy($field, $order);
    }

    public function scopeSelfBook(Builder $query): Builder
    {
        return $query->where('self_book', true);
    }

    /**
     * @return SlugOptions
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('user.full_name')
            ->extraScope(fn(Builder $builder) => $builder->where('company_id', $this->company_id))
            ->doNotGenerateSlugsOnUpdate()
            ->saveSlugsTo('slug');
    }
}
