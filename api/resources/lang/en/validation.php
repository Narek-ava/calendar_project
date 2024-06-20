<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted'             => 'The :attribute must be accepted.',
    'accepted_if'          => 'The :attribute must be accepted when :other is :value.',
    'active_url'           => 'The :attribute is not a valid URL.',
    'after'                => 'The :attribute must be a date after :date.',
    'after_or_equal'       => 'The :attribute must be a date after or equal to :date.',
    'alpha'                => 'The :attribute must only contain letters.',
    'alpha_dash'           => 'The :attribute must only contain letters, numbers, dashes and underscores.',
    'alpha_num'            => 'The :attribute must only contain letters and numbers.',
    'array'                => 'The :attribute must be an array.',
    'before'               => 'The :attribute must be a date before :date.',
    'before_or_equal'      => 'The :attribute must be a date before or equal to :date.',
    'between'              => [
        'numeric' => 'The :attribute must be between :min and :max.',
        'file'    => 'The :attribute must be between :min and :max kilobytes.',
        'string'  => 'The :attribute must be between :min and :max characters.',
        'array'   => 'The :attribute must have between :min and :max items.',
    ],
    'boolean'              => 'The :attribute field must be true or false.',
    'confirmed'            => 'The :attribute confirmation does not match.',
    'current_password'     => 'The password is incorrect.',
    'date'                 => 'The :attribute is not a valid date.',
    'date_equals'          => 'The :attribute must be a date equal to :date.',
    'date_format'          => 'The :attribute does not match the format :format.',
    'different'            => 'The :attribute and :other must be different.',
    'digits'               => 'The :attribute must be :digits digits.',
    'digits_between'       => 'The :attribute must be between :min and :max digits.',
    'dimensions'           => 'The :attribute has invalid image dimensions.',
    'distinct'             => 'The :attribute field has a duplicate value.',
    'email'                => 'The :attribute must be a valid email address.',
    'ends_with'            => 'The :attribute must end with one of the following: :values.',
    'exists'               => 'The selected :attribute is invalid.',
    'file'                 => 'The :attribute must be a file.',
    'filled'               => 'The :attribute field must have a value.',
    'gt'                   => [
        'numeric' => 'The :attribute must be greater than :value.',
        'file'    => 'The :attribute must be greater than :value kilobytes.',
        'string'  => 'The :attribute must be greater than :value characters.',
        'array'   => 'The :attribute must have more than :value items.',
    ],
    'gte'                  => [
        'numeric' => 'The :attribute must be greater than or equal to :value.',
        'file'    => 'The :attribute must be greater than or equal to :value kilobytes.',
        'string'  => 'The :attribute must be greater than or equal to :value characters.',
        'array'   => 'The :attribute must have :value items or more.',
    ],
    'image'                => 'The :attribute must be an image.',
    'in'                   => 'The selected :attribute is invalid.',
    'in_array'             => 'The :attribute field does not exist in :other.',
    'integer'              => 'The :attribute must be an integer.',
    'ip'                   => 'The :attribute must be a valid IP address.',
    'ipv4'                 => 'The :attribute must be a valid IPv4 address.',
    'ipv6'                 => 'The :attribute must be a valid IPv6 address.',
    'json'                 => 'The :attribute must be a valid JSON string.',
    'lt'                   => [
        'numeric' => 'The :attribute must be less than :value.',
        'file'    => 'The :attribute must be less than :value kilobytes.',
        'string'  => 'The :attribute must be less than :value characters.',
        'array'   => 'The :attribute must have less than :value items.',
    ],
    'lte'                  => [
        'numeric' => 'The :attribute must be less than or equal to :value.',
        'file'    => 'The :attribute must be less than or equal to :value kilobytes.',
        'string'  => 'The :attribute must be less than or equal to :value characters.',
        'array'   => 'The :attribute must not have more than :value items.',
    ],
    'max'                  => [
        'numeric' => 'The :attribute must not be greater than :max.',
        'file'    => 'The :attribute must not be greater than :max kilobytes.',
        'string'  => 'The :attribute must not be greater than :max characters.',
        'array'   => 'The :attribute must not have more than :max items.',
    ],
    'mimes'                => 'The :attribute must be a file of type: :values.',
    'mimetypes'            => 'The :attribute must be a file of type: :values.',
    'min'                  => [
        'numeric' => 'The :attribute must be at least :min.',
        'file'    => 'The :attribute must be at least :min kilobytes.',
        'string'  => 'The :attribute must be at least :min characters.',
        'array'   => 'The :attribute must have at least :min items.',
    ],
    'multiple_of'          => 'The :attribute must be a multiple of :value.',
    'not_in'               => 'The selected :attribute is invalid.',
    'not_regex'            => 'The :attribute format is invalid.',
    'numeric'              => 'The :attribute must be a number.',
    'password'             => 'The password is incorrect.',
    'present'              => 'The :attribute field must be present.',
    'regex'                => 'The :attribute format is invalid.',
    'required'             => 'The :attribute field is required.',
    'required_if'          => 'The :attribute field is required when :other is :value.',
    'required_unless'      => 'The :attribute field is required unless :other is in :values.',
    'required_with'        => 'The :attribute field is required when :values is present.',
    'required_with_all'    => 'The :attribute field is required when :values are present.',
    'required_without'     => 'The :attribute field is required when :values is not present.',
    'required_without_all' => 'The :attribute field is required when none of :values are present.',
    'prohibited'           => 'The :attribute field is prohibited.',
    'prohibited_if'        => 'The :attribute field is prohibited when :other is :value.',
    'prohibited_unless'    => 'The :attribute field is prohibited unless :other is in :values.',
    'prohibits'            => 'The :attribute field prohibits :other from being present.',
    'same'                 => 'The :attribute and :other must match.',
    'size'                 => [
        'numeric' => 'The :attribute must be :size.',
        'file'    => 'The :attribute must be :size kilobytes.',
        'string'  => 'The :attribute must be :size characters.',
        'array'   => 'The :attribute must contain :size items.',
    ],
    'starts_with'          => 'The :attribute must start with one of the following: :values.',
    'string'               => 'The :attribute must be a string.',
    'timezone'             => 'The :attribute must be a valid timezone.',
    'unique'               => 'The :attribute has already been taken.',
    'uploaded'             => 'The :attribute failed to upload.',
    'url'                  => 'The :attribute must be a valid URL.',
    'uuid'                 => 'The :attribute must be a valid UUID.',
    'phone'                => 'The :attribute field contains an invalid number.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'custom-message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [

        'user.firstname' => 'firstname',
        'user.lastname'  => 'lastname',
        'user.email'     => 'email',
        'user.phone'     => 'phone',

        'schedule.*.id'     => 'numeric representation of the day of the week',
        'schedule.*.enable' => 'state of the day of the week',
        'schedule.*.start'  => 'end of the day of the week',
        'schedule.*.end'    => 'end of the day of the week',

        'shifts.*.start'  => 'shift start date',
        'shifts.*.end'    => 'shift end date',
        'shifts.*.opened' => 'shift state',

        'payments.*.datetime' => 'payment date & time',
        'payments.*.reason'   => 'payment reason',
        'payments.*.amount'   => 'payment amount',
        'payments.*.method'   => 'payment method',

        'settings.appointments.autocomplete.enabled'  => 'Automatically close appointments',
        'settings.appointments.autocomplete.interval' => 'Appointment closure interval',

        'settings.appointments.no_show_deposit.enabled' => 'No show deposit',
        'settings.appointments.no_show_deposit.percent' => 'No show deposit',

        'settings.integrations.reputation_management' => 'Reputation Management',

        'settings.integrations.gradeus.api_key'    => 'GradeUs API Key',
        'settings.integrations.gradeus.profile_id' => 'GradeUs Profile ID',

        'settings.integrations.reviewshake.api_key'       => 'Reviewshake API Key',
        'settings.integrations.reviewshake.subdomain'     => 'Reviewshake Subdomain',
        'settings.integrations.reviewshake.custom_domain' => 'Reviewshake Custom Domain',
        'settings.integrations.reviewshake.campaign'      => 'Reviewshake Campaign',
        'settings.integrations.reviewshake.client'        => 'Reviewshake Client',
        'settings.integrations.reviewshake.location_slug' => 'Reviewshake Location Slug',

        'settings.integrations.paypal.client_id'     => 'PayPal Client ID',
        'settings.integrations.paypal.client_secret' => 'PayPal Client Secret',

        'settings.integrations.stripe.secret_key'      => 'Stripe Secret Key',
        'settings.integrations.stripe.publishable_key' => 'Stripe Publishable Key',

        'settings.integrations.authorize_net.api_login_id'    => 'Authorize.net API Login ID',
        'settings.integrations.authorize_net.transaction_key' => 'Authorize.net Transaction Key',

        'settings.integrations.twilio.auth_token'  => 'Twilio Auth Token',
        'settings.integrations.twilio.account_sid' => 'Twilio Account SID',

        'settings.calendar.cell_duration'              => 'calendar cell duration',
        'settings.calendar.show_scheduled_staff'       => 'show scheduled staff',
        'settings.calendar.show_canceled_appointments' => 'show canceled appointments',
        'settings.calendar.selected_location_id'       => 'selected location',

        'settings.calendar.locations'               => 'locations',
        'settings.calendar.locations.*.id'          => 'location id',
        'settings.calendar.locations.*.services'    => 'services',
        'settings.calendar.locations.*.services.*'  => 'service id',
        'settings.calendar.locations.*.employees'   => 'staff',
        'settings.calendar.locations.*.employees.*' => 'staff id',

        'settings.widget.use_location_schedule' => 'use location schedule',
        'settings.widget.max_advance_booking'   => 'max advance booking',

        'address.address'     => 'address',
        'address.city'        => 'city',
        'address.state'       => 'state',
        'address.country'     => 'country',
        'address.postal_code' => 'postal code',
        'address.l1'          => 'address line 1',
        'address.l2'          => 'address line 2',

        'filters.locations'   => 'locations',
        'filters.report_type' => 'report type',

        'payment_details.address.address'     => 'address',
        'payment_details.address.l1'          => 'line 1',
        'payment_details.address.l2'          => 'line 2',
        'payment_details.address.city'        => 'city',
        'payment_details.address.state'       => 'state',
        'payment_details.address.postal_code' => 'zip',
        'payment_details.address.country'     => 'country',
    ],

];
