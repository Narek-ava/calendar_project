<?php

namespace App\Models;

use App\Services\ReputationManagementService;
use App\Traits\AuditableImpersonated;
use App\Traits\Filterable;
use App\Traits\UsesUuid;
use App\Traits\WithShortUrl;
use Glorand\Model\Settings\Exceptions\ModelSettingsException;
use Glorand\Model\Settings\Traits\HasSettingsField;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Laravel\Nova\Actions\Actionable;
use OwenIt\Auditing\Contracts\Auditable;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Company extends Model implements Auditable
{
    use HasFactory;
    use SoftDeletes;
    use UsesUuid;
    use Filterable;
    use HasSlug;
    use AuditableImpersonated;
    use Actionable;
    use HasSettingsField;
    use WithShortUrl;

    const LOGO_MAIN_TYPE = 'logo_main';
    const LOGO_RECTANGULAR_TYPE = 'logo_rectangular';
    const CB_SERVICE_FEE_AMOUNT = 3;

    protected $fillable = [
        'company_owner_id', 'name', 'email', 'phone', 'site', 'is_service_fees_enabled', 'is_twilio_enabled','waiver_data'
    ];

    protected array $searchable = ['name', 'email', 'phone', 'site'];

    protected $attributes = [
        'settings' => [
            'notifications' => [
                'enabled'                => true,
                'immediately_sms_notify' => false,
            ],
            'appointments'  => [
                'autocomplete'               => [
                    'enabled'  => false,
                    'interval' => null,
                ],
                'completed_notify_customers' => false,
                'no_show_deposit'            => [
                    'enabled' => false,
                    'percent' => 20
                ],
            ],
            'widget'        => [
                'is_attachments_enabled' => true,
                'max_advance_booking'    => 14,
            ],
            'integrations'  => [
                'reputation_management' => ReputationManagementService::GRADEUS_INTEGRATION,
                'cc_processor'          => Appointment::AUTHORIZE_NET_PAYMENT_METHOD,

                'gradeus'       => [
                    'api_key'    => null,
                    'profile_id' => null,
                ],
                'reviewshake'   => [
                    'api_key'       => null,
                    'subdomain'     => null,
                    'custom_domain' => null,
                    'campaign'      => null,
                    'client'        => null,
                    'location_slug' => null,
                ],
                'paypal'        => [
                    'client_id'     => null,
                    'client_secret' => null,
                ],
                'authorize_net' => [
                    'api_login_id'    => null,
                    'transaction_key' => null,
                ],
                'stripe'        => [
                    'secret_key'      => null,
                    'publishable_key' => null,
                ],
                'twilio'        => [
                    'auth_token'  => null,
                    'account_sid' => null,
                ],
            ],
        ]
    ];

    protected $casts = [
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'employees')->withTimestamps();
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function address(): MorphOne
    {
        return $this->morphOne(Address::class, 'resource');
    }

    public function logo(): MorphOne
    {
        return $this->morphOne(Image::class, 'resource')->where('type', self::LOGO_MAIN_TYPE);
    }

    public function logoRectangular(): MorphOne
    {
        return $this->morphOne(Image::class, 'resource')->where('type', self::LOGO_RECTANGULAR_TYPE);
    }

    public function getEmailLogoAttribute()
    {
        return $this->logoRectangular->link ?? $this->logo->link ?? null;
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    public function serviceCategories(): HasMany
    {
        return $this->hasMany(ServiceCategory::class);
    }

    public function services(): HasManyThrough
    {
        return $this->hasManyThrough(Service::class, ServiceCategory::class);
    }

    /**
     * Is used to distinguish which company customer is attached
     * If you need the all customers attached to company owner(they are shared between companies) use companyOwner->customers
     *
     * @return HasMany
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function companyOwner(): BelongsTo
    {
        return $this->belongsTo(CompanyOwner::class);
    }

    /**
     * Is used to show owner in Nova
     *
     */
    public function owner(): HasOneThrough
    {
        return $this->hasOneThrough(User::class, CompanyOwner::class, 'id', 'id', 'company_owner_id', 'user_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

//    public function freescoutMailboxes(): HasMany
//    {
//        return $this->hasMany(FreescoutMailbox::class);
//    }

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

    public function scopeSlug(Builder $query, $slug): Builder
    {
        return $query->where('slug', $slug);
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->doNotGenerateSlugsOnUpdate()
            ->saveSlugsTo('slug');
    }

    public function fromEmailAddress(): string
    {
        return $this->slug . '@' . Str::afterLast(config('mail.from.address'), '@');
    }

    public function replyToAddress(): string
    {
        return $this->email ?? $this->fromEmailAddress();
    }

    /**
     * Get the public url of company
     *
     * @return Attribute
     */
    protected function widgetUrl(): Attribute
    {
        return Attribute::make(
            get: fn($value) => config('app.frontend_url') . "/cal/$this->slug"
        );
    }

    /**
     * Return the state of the PayPal payment gateway in widget
     *
     * @return bool
     * @throws ModelSettingsException
     */
    public function isPaypalEnabled(): bool
    {
        if (
            !$this->settings()->get('integrations.paypal.client_id') ||
            !$this->settings()->get('integrations.paypal.client_secret')
        ) return false;

        return true;
    }

    /**
     * Return the state of the Authorize.net payment gateway in widget
     *
     * @return bool
     * @throws ModelSettingsException
     */
    public function isAuthorizeNetEnabled(): bool
    {
        if (
            $this->is_service_fees_enabled & (
                !config('authnet.api_login_id') ||
                !config('authnet.transaction_key')
            )
        ) {
            return false;
        }

        if (
            !$this->settings()->get('integrations.authorize_net.api_login_id') ||
            !$this->settings()->get('integrations.authorize_net.transaction_key')
        ) return false;

        return true;
    }

    /**
     * Return the state of the Stripe payment gateway in widget
     *
     * @return bool
     * @throws ModelSettingsException
     */
    public function isStripeEnabled(): bool
    {
        if (
            !$this->settings()->get('integrations.stripe.secret_key') ||
            !$this->settings()->get('integrations.stripe.publishable_key')
        ) return false;

        return true;
    }
}
