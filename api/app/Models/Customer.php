<?php

namespace App\Models;

use App\Traits\AuditableImpersonated;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Nova\Actions\Actionable;
use OwenIt\Auditing\Contracts\Auditable;

class Customer extends Model implements Auditable
{
    use HasFactory;
    use SoftDeletes;
    use Notifiable;
    use Filterable;
    use AuditableImpersonated;
    use Actionable;

    protected $fillable = [
        'firstname', 'lastname', 'email', 'phone', 'birth_date', 'note',
        'created_at', 'updated_at' // TODO: tmp, for importing only, remove after importing
    ];

    protected $searchable = ['firstname', 'lastname', 'email', 'phone'];

    protected $casts = [
        'birth_date' => 'immutable_date',
    ];

    /**
     * Is used to distinguish which company customer is attached
     * If you need the all customers attached to company owner(they are shared between companies) use companyOwner->customers
     *
     * @return BelongsTo
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function companyOwner(): BelongsTo
    {
        return $this->belongsTo(CompanyOwner::class);
    }

    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'resource');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(CustomerContact::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

//    public function freescoutCustomer(): HasOne
//    {
//        return $this->hasOne(FreescoutCustomer::class);
//    }

    public function scopeGetByEmail(Builder $query, string $email): Builder
    {
        return $query->whereHas('contacts', function (Builder $query) use ($email) {
            $query->where('type', CustomerContact::EMAIL_TYPE)->where('value', $email);
        });
    }

    //TODO: Refactor to make global scope or trait Searchable or using Laravel Scout
    public function scopeSearch(Builder $query, string|null $search): Builder
    {
        if ($search) {
            return $query->where(function (Builder $query) use ($search) {
                foreach ($this->searchable as $column) {
                    $query->orWhere($column, 'ILIKE', "%{$search}%");

                    // Phone, only by numbers
                    if ($column === 'phone' && $cleared = preg_replace('/[^0-9]+/i', '', $search)) {
                        $query->orWhereRaw("regexp_replace(phone, '[^0-9]+', '', 'g') ILIKE ?", ["%$cleared%"]);
                    }
                }

                // First name + last name
                $imploded = implode(',', $this->searchable);
                $query->orWhereRaw("CONCAT_WS(' ', $imploded) ILIKE ?", ["%$search%"]);
            });
        }

        return $query;
    }

    public function scopeSort(Builder $query, string $field, string $order): Builder
    {
        return $query->orderBy($field, $order);
    }

    public function routeNotificationForTwilio(): string
    {
        return '+1' . preg_replace('/[^0-9]/', '', $this->phone);
    }

    public function getFullNameAttribute(): string
    {
        return implode(' ', [$this->firstname, $this->lastname]);
    }

    /**
     * Interact with the user's email
     *
     * @return Attribute
     */
    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => !is_null($value) ? Str::lower($value) : $value,
            set: fn ($value) => !is_null($value) ? Str::lower($value) : $value,
        );
    }

    /**
     * @return bool
     */
    public function isNoShowDepositRequired(): bool
    {
        $latestAppointment = $this->appointments->sortByDesc('start_at')->first();

        return $latestAppointment?->status === Appointment::CANCELED_STATUS
            && $latestAppointment?->cancel_reason === Appointment::CUSTOMER_NO_SHOW_CANCEL_REASON;
    }
}
