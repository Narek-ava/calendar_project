<?php

namespace App\Nova;

use Dniccum\PhoneNumber\PhoneNumber;
use Illuminate\Validation\Rules;
use Laravel\Nova\Fields\BelongsToMany;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Gravatar;
use Laravel\Nova\Fields\HasManyThrough;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\MorphToMany;
use Laravel\Nova\Fields\Password;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Vyuldashev\NovaPermission\Permission;
use Vyuldashev\NovaPermission\PermissionBooleanGroup;
use Vyuldashev\NovaPermission\Role;
use Vyuldashev\NovaPermission\RoleBooleanGroup;
use Vyuldashev\NovaPermission\RoleSelect;

class User extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static string $model = \App\Models\User::class;

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id', 'firstname', 'lastname', 'email', 'phone'
    ];

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

            Gravatar::make()->maxWidth(50),

            Boolean::make('Can Impersonate?', 'can_impersonate'),

            Text::make('FirstName')
                ->sortable()
                ->rules('required', 'max:255'),

            Text::make('LastName')
                ->sortable()
                ->rules('required', 'max:255'),

            PhoneNumber::make('Phone')->nullable()->useMaskPlaceholder()->sortable(),

            Text::make('Email')
                ->sortable()
                ->rules('required', 'email', 'max:254')
                ->creationRules('unique:users,email')
                ->updateRules('unique:users,email,{{resourceId}}'),

            Password::make('Password')
                ->onlyOnForms()
                ->creationRules('required', Rules\Password::defaults())
                ->updateRules('nullable', Rules\Password::defaults()),

//            HasManyThrough::make('Companies')

//            MorphToMany::make('Roles', 'roles', \Vyuldashev\NovaPermission\Role::class),
//            MorphToMany::make('Permissions', 'permissions', \Vyuldashev\NovaPermission\Permission::class),

//            RoleSelect::make('Role', 'roles'),

//            RoleBooleanGroup::make('Roles'),
//            PermissionBooleanGroup::make('Permissions'),
        ];
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
        return [];
    }
}
