<?php

namespace App\Models;

use App\Events\UserCreatedEvent;
use App\Models\Google\GoogleAccount;
use App\Models\Google\GoogleEvent;
use App\Traits\AuditableImpersonated;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Lab404\Impersonate\Models\Impersonate;
use Laravel\Cashier\Billable;
use Laravel\Nova\Actions\Actionable;
use Laravel\Sanctum\HasApiTokens;
use OwenIt\Auditing\Contracts\Auditable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property-read Company|null $contextCompany
 */
class User extends Authenticatable implements MustVerifyEmail, Auditable
{
    // Laravel built-in
    use HasApiTokens, HasFactory, SoftDeletes, Notifiable, Billable;

    // 3rd party
    use HasRoles, AuditableImpersonated, Impersonate;

    // Nova related
    use Actionable;

    protected $dispatchesEvents = [
        'created' => UserCreatedEvent::class,
    ];

    protected $fillable = [
        'firstname',
        'lastname',
        'email',
        'phone',
        'password',
        'context_company_id',
        'stripe_checkout_sessions',
        'stripe_id',
        'can_impersonate'
    ];

    protected $hidden = [
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at'        => 'datetime',
        'stripe_checkout_sessions' => 'array',
    ];

    public function avatar(): MorphOne
    {
        return $this->morphOne(Image::class, 'resource');
    }

    public function companyOwner(): HasOne
    {
        return $this->hasOne(CompanyOwner::class);
    }

    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'employees')
            ->wherePivotNotNull('verified_at')
            ->wherePivotNull('deleted_at')
            ->withTimestamps();
    }

    public function appointments(): HasManyThrough
    {
        return $this->hasManyThrough(Appointment::class, Employee::class);
    }

    public function contextCompany(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'context_company_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function employee(Company $company = null): HasOne
    {
        $companyId = $company->id ?? auth()->user()->context_company_id;

        $builder = $this->employees()
            ->whereNull('deleted_at')
            ->whereNotNull('verified_at')
            ->where('company_id', $companyId);

        return new HasOne($builder->getQuery(), $this, 'user_id', 'id');
    }

    public function role(): HasOne
    {
        $builder = $this->roles();

        return new HasOne($builder->getQuery(), $this, 'model_id', 'id');
    }

    /**
     * @return HasMany
     */
    public function googleAccounts(): HasMany
    {
        return $this->hasMany(GoogleAccount::class);
    }

    /**
     * Events only from selected to accounting calendars!
     *
     * @return Builder|GoogleEvent
     */
    public function googleEvents(): Builder|GoogleEvent
    {
        // TODO:
        // Or use: https://github.com/staudenmeir/eloquent-has-many-deep
        return GoogleEvent::whereHas('googleCalendar', function ($calendarQuery) {
            $calendarQuery
                ->where('google_calendars.accounting_events', true)
                ->whereHas('googleAccount', function ($accountQuery) {
                    $accountQuery->whereHas('user', function ($userQuery) {
                        $userQuery->where('id', $this->id);
                    });
                });
        });
    }

//    public function freescoutAccount(): HasOne
//    {
//        return $this->hasOne(FreescoutAccount::class);
//    }

    /**
     * Interact with the user's email
     *
     * @return Attribute
     */
    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn($value) => !is_null($value) ? Str::lower($value) : $value,
            set: fn($value) => !is_null($value) ? Str::lower($value) : $value,
        );
    }

    public function getFullNameAttribute(): string
    {
        return implode(' ', [$this->firstname, $this->lastname]);
    }

    public function routeNotificationForTwilio(): string
    {
        return '+1' . preg_replace('/[^0-9]/', '', $this->phone);
    }

    /**
     * Return true or false if the user can impersonate an other user.
     *
     * @return  bool
     */
    public function canImpersonate(): bool
    {
        return $this->can_impersonate || $this->isImpersonated();
    }
}
