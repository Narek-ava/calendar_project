<?php

namespace App\Nova;

use Dniccum\PhoneNumber\PhoneNumber;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Date;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;

class Customer extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static string $model = \App\Models\Customer::class;

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'firstname', 'lastname', 'email', 'phone'
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
     * Get the value that should be displayed to represent the resource.
     *
     * @return string
     */
    public function title(): string
    {
        return implode(' ', [$this->firstname, $this->lastname]);
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
            Text::make('Firstname')->sortable()->required()->showOnPreview(),
            Text::make('Lastname')->sortable(),
            Text::make('Email')->sortable()->required()->rules(['nullable', 'required_without:phone', 'email']),
            PhoneNumber::make('Phone')->sortable()->required()->rules(['nullable', 'required_without:email', 'string', 'max:255'])->useMaskPlaceholder(),
            Date::make('Birth Date')->sortable(),
            Textarea::make('Note'),
            BelongsTo::make('Company')->sortable(),
            DateTime::make('Created At')->filterable()->showOnPreview()->onlyOnDetail(),
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
    public function actions(NovaRequest $request)
    {
        return [];
    }
}
