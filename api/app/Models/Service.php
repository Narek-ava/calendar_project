<?php

namespace App\Models;

use App\Traits\AuditableImpersonated;
use App\Traits\Filterable;
use App\Traits\FilterByRole;
use Glorand\Model\Settings\Exceptions\ModelSettingsException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Service extends Model implements Auditable
{
    use HasFactory;
    use SoftDeletes;
    use Filterable;
    use FilterByRole;
    use AuditableImpersonated;
    use HasSlug;

    const PREPAY_PAYMENT_TYPE = 'prepay';
    const FREE_PAYMENT_TYPE = 'free';
    const PAID_PAYMENT_TYPE = 'paid';

    public static array $paymentTypes = [
        self::PREPAY_PAYMENT_TYPE,
        self::FREE_PAYMENT_TYPE,
        self::PAID_PAYMENT_TYPE,
    ];

    protected $fillable = [
        'service_category_id',
        'name',
        'duration',
        'interval',
        'payment_type',
        'price',
        'prepay',
        'is_private',
        'fixed_price',
        'description',
        'is_reschedule_enabled',
        'schedule',
        'sorting_order',
        'rescheduling_interval',
        'is_virtual',
        'confirmation_note',
        'advance_booking_buffer',
        'is_waiver_enabled',
    ];
    protected array $searchable = ['services.name'];

    protected $casts = [
        'duration'                         => 'integer',
        'interval'                         => 'integer',
        'fixed_price'                      => 'boolean',
        'is_private'                       => 'boolean',
        'schedule'                         => 'array',
        'rescheduling_interval'            => 'integer',
        'is_virtual'                       => 'boolean',
    ];

    protected $attributes = [
        'fixed_price'    => false,
        'is_private'     => false,
        'schedule'  => '[
            {"id":"0","enable":true},
            {"id":"1","enable":true},
            {"id":"2","enable":true},
            {"id":"3","enable":true},
            {"id":"4","enable":true},
            {"id":"5","enable":true},
            {"id":"6","enable":true}
        ]',
    ];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted(): void
    {
        static::addGlobalScope('order', function (Builder $builder) {
            $builder->orderBy('sorting_order')->orderBy('id');
        });
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'resource');
    }

    // TODO: Add company id to the service table and remove stupid relation service->service_category->company
    public function company(): HasOneThrough
    {
        return $this->hasOneThrough(Company::class, ServiceCategory::class, 'id', 'id', 'service_category_id', 'company_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'service_location');
    }

    public function employees(Model|Location $location = null): BelongsToMany
    {
        $query = $this->belongsToMany(Employee::class, 'service_employee');

        return $location ? $query
            ->join('location_employee', 'employees.id', '=', 'location_employee.employee_id')
            ->where('location_employee.location_id', $location->id) : $query;
    }

    public function getSlotSizeAttribute(): int
    {
        return $this->duration + $this->interaval;
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

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_private', false);
    }

    public function scopePrivate(Builder $query): Builder
    {
        return $query->where('is_private', true);
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
            ->extraScope(fn(Builder $builder) => $builder->where('service_category_id', $this->service_category_id))
            ->doNotGenerateSlugsOnUpdate()
            ->saveSlugsTo('slug');
    }

    /**
     * @throws ModelSettingsException
     */
    public function getNoShowAmountAttribute(): float|int
    {
        return $this->price * ($this->company->settings()->get('appointments.no_show_deposit.percent', 0) / 100);
    }
}
