<?php

namespace App\Nova;

use Alexwenzel\DependencyContainer\DependencyContainer;
use Alexwenzel\DependencyContainer\HasDependencies;
use App\Http\Requests\CompanyRequest;
use App\Traits\Nova\WithFormRequestRules;
use Dniccum\PhoneNumber\PhoneNumber;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Color;
use Laravel\Nova\Fields\Email;
use Laravel\Nova\Fields\HasOneThrough;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\MorphOne;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\URL;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Panel;
use Laravel\Nova\Resource;

class Company extends Resource
{
    use WithFormRequestRules,
        HasDependencies;

    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static string $model = \App\Models\Company::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'name';

    /**
     * Is used to get validation rules from api
     *
     * @var string
     */
    public string $formRequest = CompanyRequest::class;

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'name',
    ];

    /**
     * Determine if the given resource is authorizable.
     *
     * @return bool
     */
    public static function authorizable(): bool
    {
        return false;
    }

    /**
     * Get the fields displayed by the resource.
     *
     * @param NovaRequest $request
     * @return array
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),
            Text::make('Name')->sortable()->rules($this->getRules('name')),

            BelongsTo::make('Owner', 'owner', 'App\Nova\User')->withoutTrashed()->fillUsing(function ($request, $company, $attribute, $requestAttribute) {
                $companyOwner = \App\Models\CompanyOwner::firstOrCreate(['user_id' => $request->input($requestAttribute)]);
                $company->company_owner_id = $companyOwner->id;
            })->hideWhenUpdating(),
            hasOneThrough::make('Owner', 'owner', 'App\Nova\User')->hideFromDetail(),

            Boolean::make('Enable service fees?', 'is_service_fees_enabled'),
            Boolean::make('Using own Twilio Account?', 'is_twilio_enabled'),

            // Settings
            new Panel('Settings', $this->settingsFields()),

            new Panel('Primary Contact Details', $this->primaryContactFields()),

            MorphOne::make('Address Details', 'address', Address::class),

            new Panel('Widget Style Settings', $this->widgetStyleFields()),
        ];
    }

    /**
     * Get the primary contact fields for the resource.
     *
     * @return array
     */
    protected function primaryContactFields(): array
    {
        return [
            Email::make('Email')->rules(['nullable', 'email'])->hideFromIndex()->textAlign('center'),
            PhoneNumber::make('Phone')->rules(['nullable', 'string', 'max:255'])->useMaskPlaceholder()->hideFromIndex(),
            URL::make('Website', 'site')->rules(['nullable', 'string', 'max:255'])->hideFromIndex(),
        ];
    }

    /**
     * Get the settings fields for the resource.
     *
     * @return array
     */
    protected function settingsFields(): array
    {
        return [
            Boolean::make('Enable all types of notifications for the organization?', 'settings->notifications->enabled')
                ->resolveUsing(fn($value, $company) => $company->settings()->get('notifications.enabled'))
                ->hideWhenCreating()
                ->hideFromIndex(),

            Boolean::make('Automatically close appointments?', 'settings->appointments->autocomplete->enabled')
                ->resolveUsing(fn($value, $company) => $company->settings()->get('appointments.autocomplete.enabled'))
                ->hideWhenCreating()
                ->hideFromIndex(),

            DependencyContainer::make([
                Number::make('Hours', 'settings->appointments->autocomplete->interval')->min(1)->step(1)
                    ->rules('required')
                    ->default(1)
                    ->resolveUsing(fn($value, $company) => $company->settings()->get('appointments.autocomplete.interval'))
                    ->fillUsing(function ($request, $company, $attribute, $requestAttribute) {
                        if (!$request->input('settings->appointments->autocomplete->enabled')) {
                            $company->settings()->set('appointments.autocomplete.interval', null);
                        } else {
                            $company->settings()->set('appointments.autocomplete.interval', $request->input($requestAttribute));
                        }
                    })
            ])->dependsOn('settings->appointments->autocomplete->enabled', true)->hideWhenCreating(),

            Boolean::make('Send Appointment closed notification for customers?', 'settings->appointments->completed_notify_customers')
                ->resolveUsing(fn($value, $company) => $company->settings()->get('appointments.completed_notify_customers'))
                ->hideWhenCreating()
                ->hideFromIndex(),
        ];
    }

    /**
     * Get the widget settings fields for the resource.
     *
     * @return array
     */
    protected function widgetStyleFields(): array
    {
        return [
            Color::make('Primary Color', 'settings->widget->primaryColor')
                ->hideWhenCreating()
                ->hideFromIndex()
                ->resolveUsing(fn($value, $company) => $company->settings()->get('widget.primaryColor')),
            Color::make('Text Color', 'settings->widget->textColor')
                ->hideWhenCreating()
                ->hideFromIndex()
                ->resolveUsing(fn($value, $company) => $company->settings()->get('widget.textColor'))
        ];
    }

    /**
     * Get the cards available for the request.
     *
     * @param NovaRequest $request
     * @return array
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @param NovaRequest $request
     * @return array
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @param NovaRequest $request
     * @return array
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     *
     * @param NovaRequest $request
     * @return array
     */
    public function actions(NovaRequest $request): array
    {
        return [
            Actions\CompanyChangeOwner::make($this->model())
                ->onlyOnDetail()
                ->showInline()
        ];
    }
}
