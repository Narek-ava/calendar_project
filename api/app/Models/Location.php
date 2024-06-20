<?php

namespace App\Models;

use App\Jobs\UpcomingAppointmentReminderJob;
use App\Traits\AuditableImpersonated;
use App\Traits\Filterable;
use App\Traits\FilterByRole;
use App\Traits\WithShortUrl;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\URL;
use OwenIt\Auditing\Contracts\Auditable;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Location extends Model implements Auditable
{
    use HasFactory;
    use SoftDeletes;
    use Filterable;
    use FilterByRole;
    use AuditableImpersonated;
    use HasSlug;
    use WithShortUrl;

    protected $fillable = [
        'name', 'phone', 'schedule', 'time_zone', 'is_primary', 'twilio_phone'
    ];
    protected array $searchable = ['name', 'phone'];

    protected $attributes = [
        'schedule'   => '[
            {"id":"1","label":"Monday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"2","label":"Tuesday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"3","label":"Wednesday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"4","label":"Thursday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"5","label":"Friday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"6","label":"Saturday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"},
            {"id":"0","label":"Sunday","enable":true,"start":"2022-01-26 09:00:00","end":"2022-01-26 18:00:00"}
        ]',
        'is_primary' => false,
        'time_zone' => 'America/Chicago',
    ];

    protected $casts = [
        'schedule' => 'array',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'resource');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'service_location');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'location_employee');
    }

    /**
     * Incoming $date should be in tz of location
     *
     * @param CarbonImmutable $date
     * @return CarbonPeriod|null
     */
    public function workingHours(CarbonImmutable $date): ?CarbonPeriod
    {
        $schedule = collect($this->schedule)->where('id', $date->dayOfWeek)->first();

        if ($schedule['enable']) {
            $openDate = CarbonImmutable::parse($schedule['start'])->setSecond(0);
            $closeDate = CarbonImmutable::parse($schedule['end'])->setSecond(0);

            return CarbonImmutable::parse($date->setTime($openDate->hour, $openDate->minute))
                ->toPeriod($date->setTime($closeDate->hour, $closeDate->minute));
        }

        return null;
    }

    /**
     * Check is open or closed the location now in its local time using TZ
     *
     * $startOffsetInMinutes is needed to send sms notification in case of gap
     * AFTER @param int $startOffsetInMinutes
     * @return bool
     * @see UpcomingAppointmentReminderJob::$offsetInMinutes and BEFORE opening hour
     *
     */
    public function isOperatingTimeNow(int $startOffsetInMinutes = 0): bool
    {
        $nowTz = CarbonImmutable::now($this->time_zone);
        if ($whTz = $this->workingHours($nowTz)) {
            $whTz->setStartDate($whTz->getStartDate()->subMinutes($startOffsetInMinutes));
            return $whTz->contains($nowTz);
        }

        return false;
    }

    //TODO: Refactor to make global scope or trait Searchable or using Laravel Scout
    public function scopeSearch(Builder $query, string|null $search): Builder
    {
        if ($search) {
            return $query->where(function (Builder $query) use ($search) {
                foreach ($this->searchable as $column) {
                    $query->orWhere($column, 'ILIKE', "%{$search}%");
                }
            });
        }

        return $query;
    }

    public function scopeSort(Builder $query, string $field, string $order): Builder
    {
        return $query->orderBy($field, $order);
    }

    public function scopeFilterByRole(Builder $query, User $user = null): Builder
    {
        $user = $user ?? auth()->user();
        $role = $user->role->name;

        return match ($role) {
            Role::PROVIDER_ROLE => $query->whereHas(
                'employees',
                function (Builder $query) use ($user) {
                    $query->where('user_id', $user->id);
                }
            ),
            default => $query
        };
    }

    /**
     * @return SlugOptions
     */
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->extraScope(fn (Builder $builder) => $builder->where('company_id', $this->company_id))
            ->doNotGenerateSlugsOnUpdate()
            ->saveSlugsTo('slug');
    }

    /**
     * Get the public url of tva room for virtual appointment
     *
     * @return Attribute
     */
    protected function kioskUrl(): Attribute
    {
        return Attribute::make(
            get: fn($value) => URL::signedRoute('kiosk.search', $this)
        );
    }
}
