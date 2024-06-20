<?php

namespace App\Models;

use App\Casts\AppointmentDate;
use App\Models\Google\GoogleEvent;
use App\Traits\AuditableImpersonated;
use App\Traits\Filterable;
use App\Traits\FilterByRole;
use App\Traits\UsesUuid;
use App\Traits\WithShortUrl;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Google\Service\Calendar\Event as GoogleCalendarEvent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use JetBrains\PhpStorm\ArrayShape;
use OwenIt\Auditing\Contracts\Auditable;
use Spatie\IcalendarGenerator\Components\Calendar as SpatieCalendar;
use Spatie\IcalendarGenerator\Components\Event as SpatieCalendarEvent;
use Spatie\IcalendarGenerator\Enums\EventStatus;
use Spatie\IcalendarGenerator\Enums\ParticipationStatus;
use Spatie\IcalendarGenerator\Properties\TextProperty;
use Throwable;

class Appointment extends Model implements Auditable
{
    use HasFactory;
    use SoftDeletes;
    use Filterable;
    use UsesUuid;
    use FilterByRole;
    use AuditableImpersonated;
    use WithShortUrl;

    public const APPOINTMENT_TYPE = 'appointment';
    public const BLOCKED_TIME_TYPE = 'blocked_time';

    public const ACTIVE_STATUS = 'active';
    public const COMPLETED_STATUS = 'completed';
    public const CANCELED_STATUS = 'canceled';

    public const CASH_PAYMENT_METHOD = 'cash';
    public const CREDIT_CARD_PAYMENT_METHOD = 'credit_card';
    public const VENMO_PAYMENT_METHOD = 'venmo';
    public const ZELLE_PAYMENT_METHOD = 'zelle';
    public const PAYPAL_PAYMENT_METHOD = 'paypal';
    public const AUTHORIZE_NET_PAYMENT_METHOD = 'authorize_net';
    public const STRIPE_PAYMENT_METHOD = 'stripe';
    public const GIFT_CARD_PAYMENT_METHOD = 'gift_card';
    public const OTHER_PAYMENT_METHOD = 'other';

    public const CUSTOMER_CANCELED_CANCEL_REASON = 'customer_canceled';
    public const CUSTOMER_NO_SHOW_CANCEL_REASON = 'customer_no_show';
    public const STAFF_CANCELED_CANCEL_REASON = 'staff_canceled';

    public const DEPOSIT_PAYMENT_REASON = 'deposit';
    public const SERVICE_PAYMENT_REASON = 'service';
    public const GRATUITY_PAYMENT_REASON = 'gratuity';
    public const OTHER_PAYMENT_REASON = 'other';

    public const SERVICE_BALANCE_REPORT_TYPE = 'service_balance';
    public const DETAILED_TRANSACTIONS_REPORT_TYPE = 'detailed_transactions';

    public static array $types = [
        self::APPOINTMENT_TYPE,
        self::BLOCKED_TIME_TYPE,
    ];

    public static array $statuses = [
        self::ACTIVE_STATUS,
        self::COMPLETED_STATUS,
        self::CANCELED_STATUS,
    ];

    public static array $paymentMethods = [
        self::CASH_PAYMENT_METHOD,
        self::CREDIT_CARD_PAYMENT_METHOD,
        self::VENMO_PAYMENT_METHOD,
        self::ZELLE_PAYMENT_METHOD,
        self::PAYPAL_PAYMENT_METHOD,
        self::AUTHORIZE_NET_PAYMENT_METHOD,
        self::STRIPE_PAYMENT_METHOD,
        self::GIFT_CARD_PAYMENT_METHOD,
        self::OTHER_PAYMENT_METHOD,
    ];

    public static array $paymentReasons = [
        self::DEPOSIT_PAYMENT_REASON,
        self::SERVICE_PAYMENT_REASON,
        self::GRATUITY_PAYMENT_REASON,
        self::OTHER_PAYMENT_REASON,
    ];

    public static array $cancelReasons = [
        self::CUSTOMER_CANCELED_CANCEL_REASON,
        self::CUSTOMER_NO_SHOW_CANCEL_REASON,
        self::STAFF_CANCELED_CANCEL_REASON,
    ];

    public static array $reportTypes = [
        self::SERVICE_BALANCE_REPORT_TYPE,
        self::DETAILED_TRANSACTIONS_REPORT_TYPE,
    ];

    public const MAX_IMAGES = 5;

    protected $fillable = [
        'employee_id',
        'location_id',
        'service_id',
        'customer_id',
        'start_at',
        'end_at',
        'payment_type',
        'payment_method',
        'fixed_price',
        'price',
        'prepay',
        'status',
        'type',
        'note',
        'cancel_reason',
        'private_note',
        'payments',
        'is_checked_in',
        'is_notifications_enabled',
        'time_zone',
        'waiver_answers',
        'waiver_pdf'
    ];

    protected $attributes = [
        'type'   => self::APPOINTMENT_TYPE,
        'status' => self::ACTIVE_STATUS,
    ];

    protected $casts = [
        'start_at'                 => AppointmentDate::class,
        'end_at'                   => AppointmentDate::class,
        'price'                    => 'decimal:2',
        'prepay'                   => 'decimal:2',
        'fixed_price'              => 'boolean',
        'payments'                 => 'collection',
        'is_checked_in'            => 'boolean',
        'is_notifications_enabled' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function companyTrashed(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id')->withTrashed();
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function employeeTrashed(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id')->withTrashed();
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function serviceTrashed(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id')->withTrashed();
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function locationTrashed(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id')->withTrashed();
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function customerTrashed(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id')->withTrashed();
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'resource');
    }

    /**
     * @return HasOne
     */
    public function googleEvent(): HasOne
    {
        return $this->hasOne(GoogleEvent::class);
    }

    public function scopeWhereService(Builder $query, int $id): Builder
    {
        return $query->where('service_id', $id);
    }

    public function scopeWhereStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereStatus(self::ACTIVE_STATUS);
    }

    private static function slotMap(CarbonPeriod $workingHours, int $slotSize, string $unit = 'minutes'): Collection
    {
        return collect(CarbonImmutable::parse($workingHours->getStartDate())
            ->toPeriod($workingHours->getEndDate(), $slotSize, $unit)->toArray());
    }

    /**
     * @throws Throwable
     */
    #[ArrayShape([
        'employee' => "\App\Models\Employee",
        'start_at' => "\Carbon\CarbonImmutable",
        'end_at'   => "\Carbon\CarbonImmutable",
        'occupied' => 'bool',
    ])]
    private static function makeSlot(CarbonImmutable $startAt, Location $location, Employee $employee, Service $service, int $slotSize, Collection $globalAppointments): array
    {
        $today = CarbonImmutable::now($location->time_zone);

        $workingHours = $employee->settings()->get('widget.use_location_schedule') ?
            $employee->workingHours($startAt, $location) : $employee->workingHours($startAt);

        $endAt = $startAt->addMinutes($slotSize)->subSecond();

        $isEmployeeOccupied = !$workingHours || $startAt < $workingHours->getStartDate()
            || $endAt > $workingHours->getEndDate();

        $data = [
            'employee' => $employee,
            'start_at' => $startAt,
            'end_at'   => $endAt,
        ];

        $inAdvanceBuffer = $startAt->diffInMinutes($today) < $service->advance_booking_buffer ?? 0;

//        $isAppointmentsOccupied = (bool)$employee->appointments->first(function (self $appointment) use ($startAt, $endAt, $employee) {
        // TODO: Performance must be measured and replaced with https://laravel.com/docs/9.x/collections#method-lazy
        $isAppointmentsOccupied = $globalAppointments->first(function (self $appointment) use ($startAt, $endAt, $employee) {
            return
                in_array($appointment->employee_id, $employee->user->employees->pluck('id')->toArray())
                && $appointment->start_at_local <= $endAt
                && $appointment->end_at_local >= $startAt;
        });

        $hasGoogleEvents = $employee->settings()->get('widget.accounting_google_events') &&
            $employee->user->googleEvents()
                ->where('started_at', '<=', $endAt->utc())
                ->where('ended_at', '>=', $startAt->utc())
                ->count() > 0;

        $data['occupied'] =
            $startAt->lessThan($today) ||
            $inAdvanceBuffer ||
            $isAppointmentsOccupied ||
            $isEmployeeOccupied ||
            $hasGoogleEvents;

        if (request()->get('debug-mode-on') || app()->isLocal()) {
            $data['debug'] = [
                'location_time_zone'             => $location->time_zone,
                'now'                            => [
                    'zoned' => Carbon::now($location->time_zone)->toAtomString(),
                    'utc'   => Carbon::now()->toAtomString(),
                ],
                'start_at'                       => [
                    'zoned' => $startAt->toAtomString(),
                    'utc'   => $startAt->utc()->toAtomString(),
                ],
                'end_at'                         => [
                    'zoned' => $endAt->toAtomString(),
                    'utc'   => $endAt->utc()->toAtomString(),
                ],
                'location_working_hours'         => $location->workingHours($startAt)?->toDatePeriod(),
                'employee_use_location_schedule' => $employee->settings()->get('widget.use_location_schedule'),
                'employee_is_shifts_enabled'     => $employee->is_shifts_enabled,
                'employee_working_hours'         => $employee->workingHours($startAt)?->toDatePeriod(),
                'used_working_hours'             => $workingHours?->toDatePeriod(),
                'occupied_reason'                => [
                    'in_past'                    => $startAt->lessThan($today),
                    'advance_booking_buffer'     => $inAdvanceBuffer,
                    'employee_has_appointment'   => $isAppointmentsOccupied,
                    'employee_non_working_hours' => $isEmployeeOccupied,
                    'has_google_events'          => $hasGoogleEvents,
                ],
                'advance_booking_buffer'         => $service->advance_booking_buffer ?? 0,
            ];
        }

        return $data;
    }

    /**
     * @param string $date
     * @param Model|Service $service
     * @param Model|Location $location
     * @param Model|Employee|null $employee
     * @return Collection
     * @throws Throwable
     */
    public static function availableSlots(string $date, Model|Service $service, Model|Location $location, Model|Employee $employee = null): Collection
    {
        $date = CarbonImmutable::parse($date)->shiftTimezone($location->time_zone);
        $availableSlots = collect();

        // Working hours
        if ($employee) {
            $workingHours = $employee->settings()->get('widget.use_location_schedule') ?
                $employee->workingHours($date, $location) : $employee->workingHours($date);
        } else {
            $workingHours = $location->workingHours($date);
        }

        if (
            ($service->schedule && collect($service->schedule)->firstWhere('id', $date->dayOfWeek)['enable'] === false) ||
            !$workingHours
        ) {
            return $availableSlots;
        }

        $slotSize = $service->duration + $service->interval;
        $slots = self::slotMap($workingHours, $slotSize);

//        $withReservedAppointments = function (HasMany $query, CarbonPeriod $locationWorkingHours) {
//            $start = $locationWorkingHours->getStartDate()->setTimezone('UTC')->toDateString();
//            $end = $locationWorkingHours->getEndDate()->setTimezone('UTC')->toDateString();
//            $query->active()
//                ->whereDate('start_at', '>=', $start)
//                ->whereDate('start_at', '<=', $end);
//        };

        $filterBeyondTimeSlot = function ($slot, $workingHours) {
            return Carbon::parse($slot['start_at'])->format('H:i:s') <= $workingHours->getEndDate()->format('H:i:s')
                && Carbon::parse($slot['end_at'])->format('H:i:s') <= $workingHours->getEndDate()->format('H:i:s');
        };

        if ($employee) {
            // Get users' appointments from all his employees for given date(UTC)
            $globalAppointments = Appointment::active()
                ->whereHas('company')
                ->whereIn('employee_id', $employee->user->employees->pluck('id'))
                ->where('start_at', '>=', $date->startOfDay()->utc())
                ->where('start_at', '<=', $date->endOfDay()->utc())
                ->get();

            $employee = $employee->load([
//                'appointments' => function (HasMany $query) use ($employee, $withReservedAppointments, $locationWorkingHours) {
//                    $query->orWhereIn('appointments.employee_id', $employee->user->employees->pluck('id'));
//                    return $withReservedAppointments($query, $locationWorkingHours);
//                },
                'user',
            ]);

            return $slots->map(function (CarbonImmutable $startAt) use ($location, $employee, $service, $slotSize, $globalAppointments) {
                return self::makeSlot($startAt, $location, $employee, $service, $slotSize, $globalAppointments);
            })->filter(fn($slot) => $filterBeyondTimeSlot($slot, $workingHours));
        }

        $employees = $service->employees($location)->with([
//            'appointments' => fn(HasMany $query) => $withReservedAppointments($query, $locationWorkingHours),
            'user',
        ])->get();

        // Get users' appointments from all his employees for given date(UTC)
        $globalAppointments = Appointment::active()
            ->whereHas('company')
            ->whereIn('employee_id', $employees->pluck('user.employees.*.id')->flatten())
            ->where('start_at', '>=', $date->startOfDay()->utc())
            ->where('start_at', '<=', $date->endOfDay()->utc())
            ->get();

        return $slots
            ->flatMap(function (CarbonImmutable $startAt) use ($location, $employees, $service, $slotSize, $workingHours, $filterBeyondTimeSlot, $globalAppointments) {
                return $employees
                    ->map(function (Employee $employee) use ($location, $service, $startAt, $slotSize, $globalAppointments) {
                        $slot = self::makeSlot($startAt, $location, $employee, $service, $slotSize, $globalAppointments);
                        $slot['_key'] = $slot['start_at']->format('Y-m-d H:i:s');

                        return $slot;
                    })
                    ->filter(fn($slot) => $filterBeyondTimeSlot($slot, $workingHours));
            })
            ->groupBy('_key')->map(function (Collection $slots) {
                $randomSlots = $slots->where('occupied', false);
                $slot = $randomSlots->count() ? $randomSlots->random() : $slots->first();

                unset($slot['_key']);

                return $slot;
            })
            ->values();
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
            Role::PROVIDER_ROLE => $query->where('employee_id', $user->employee->id),
            default             => $query
        };
    }

    /**
     * Check is start date today using TZ from location
     *
     * @return bool
     */
    public function isStartToday(): bool
    {
        return $this->startAtLocal->isSameDay(Carbon::now($this->location->time_zone));
    }

    /**
     * Get the appointment's start date in its location tz.
     *
     * @return Attribute
     */
    protected function startAtLocal(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $this->start_at->setTimezone($this->location->time_zone),
        );
    }

    /**
     * Get the appointment's start date in its customer tz.
     *
     * @return Attribute
     */
    protected function startAtCustomer(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $this->start_at->setTimezone($this->time_zone ?? $this->location->time_zone),
        );
    }

    /**
     * Get the appointment's end date in its location tz.
     *
     * @return Attribute
     */
    protected function endAtLocal(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $this->end_at->setTimezone($this->location->time_zone),
        );
    }

    /**
     * Get the appointment's end date in its location tz.
     *
     * @return Attribute
     */
    protected function endAtCustomer(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $this->end_at->setTimezone($this->time_zone ?? $this->location->time_zone),
        );
    }

    /**
     * @return bool
     */
    public function isInReschedulingOrCancelingInterval(): bool
    {
        if (!$this->serviceTrashed->is_reschedule_enabled) return false;
        return $this->start_at->diffInMinutes() >= $this->serviceTrashed->rescheduling_interval;
    }

    /**
     * @param string $recipientType
     * @return SpatieCalendar
     */
    public function generateICal(string $recipientType = 'customer'): SpatieCalendar
    {
        $eventStatus = $this->status === self::ACTIVE_STATUS ? EventStatus::confirmed() : EventStatus::cancelled();
        $description = view("ical.appointment.$recipientType.description")->with('appointment', $this);

        $event = SpatieCalendarEvent::create()
            ->description($description->render())
            ->uniqueIdentifier("$this->uuid@" . config('app.frontend_url'))
            ->period($this->start_at, $this->end_at->ceilMinute())
            ->status($eventStatus)
            ->organizer($this->company->fromEmailAddress(), $this->company->name)
            ->attendee($this->company->fromEmailAddress(), "{$this->company->name} - {$this->serviceTrashed->name}", ParticipationStatus::accepted())
            ->alertMinutesBefore(15)
            ->url($this->getShortURL());

        // Recipient related fields
        if ($recipientType === 'customer') {
            $event
                ->name("{$this->employeeTrashed->user->full_name}: {$this->serviceTrashed->name} ({$this->customerTrashed->full_name})")
                ->attendee($this->customerTrashed->email, $this->customerTrashed->firstname, ParticipationStatus::accepted());

        } else {
            $event
                ->name("{$this->customerTrashed->full_name}: {$this->serviceTrashed->name} ({$this->employeeTrashed->user->full_name})")
                ->attendee($this->employeeTrashed->user->email, $this->employeeTrashed->user->full_name, ParticipationStatus::accepted());
        }

        // Service related fields
        if (!$this->serviceTrashed->is_virtual) {
            $event
                ->address($this->locationTrashed->address->full)
                ->addressName($this->locationTrashed->name);
        }

        return SpatieCalendar::create()->productIdentifier('')
            ->appendProperty(TextProperty::create('METHOD', 'REQUEST'))
            ->event($event);
    }

    /**
     * "Thanks" Spatie for all the private properties in Event
     *
     * @return GoogleCalendarEvent
     */
    public function generateGoogleEvent(): GoogleCalendarEvent
    {
        $eventData = [
            'start'              => ['dateTime' => $this->start_at],
            'end'                => ['dateTime' => $this->end_at->ceilMinute()],
            'organizer'          => ['displayName' => $this->company->name, 'email' => $this->company->fromEmailAddress()],
            'attendees'          => [
                [
                    'displayName'    => "{$this->company->name}",
                    'email'          => $this->company->fromEmailAddress(),
                    'responseStatus' => 'accepted',
                    'organizer'      => true,
                ],
                [
                    'displayName'    => $this->employeeTrashed->user->full_name,
                    'email'          => $this->employeeTrashed->user->email,
                    'responseStatus' => 'accepted'
                ],
            ],
            'extendedProperties' => [
                'private' => ['appointment_id' => $this->id], // is used to attach event to appointment
            ]
        ];

        if ($this->type === self::BLOCKED_TIME_TYPE) {
            Arr::set($eventData, 'summary', "Block Time: {$this->company->name} - {$this->employeeTrashed->user->full_name}");
        } else {
            Arr::set($eventData, 'summary', "{$this->customerTrashed->full_name}: {$this->serviceTrashed->name} ({$this->employeeTrashed->user->full_name})");
            Arr::set($eventData, 'description', view("ical.appointment.employee.description")->with('appointment', $this)->render());
            if (!$this->serviceTrashed->is_virtual) Arr::set($eventData, 'location', $this->locationTrashed->address->full);
        }

        return new GoogleCalendarEvent($eventData);
    }

    /**
     * Get the public url of appointment
     *
     * @return Attribute
     */
    protected function backofficeUrl(): Attribute
    {
        return Attribute::make(
            get: fn($value) => config('app.frontend_url') . "/calendar/organization/$this->company_id/appointment/$this->id/email/{$this->employeeTrashed->user->email}"
        );
    }

    /**
     * Get the public url of appointment
     *
     * @return Attribute
     */
    protected function widgetUrl(): Attribute
    {
        return Attribute::make(
            get: fn($value) => "{$this->company->widgetUrl}/booking/$this->uuid"
        );
    }

    /**
     * Get the public url of tva room for virtual appointment
     *
     * @return Attribute
     */
    protected function tvaUrl(): Attribute
    {
        return Attribute::make(
            get: fn($value) => config('app.frontend_url') . "/tva/room/$this->uuid"
        );
    }
}
