<?php

namespace Database\Seeders\EndToEnd;

use App\Models\Role;
use App\Models\Service;
use App\Models\User;
use App\Services\SeederService;
use App\Services\SubscriptionLimitsService;
use Carbon\CarbonImmutable;
use Carbon\CarbonPeriod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;

class UserSeeder extends Seeder
{
    /**
     * @param SeederService $seederService
     */
    public function __construct(private readonly SeederService $seederService)
    {
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $realUsers = [
            ['email' => 'anton@beetsoft.com', 'firstname' => 'Anton', 'lastname' => 'K'],
            ['email' => 'arukosuev@beetsoft.com', 'firstname' => 'Andrey', 'lastname' => 'R'],
            ['email' => 'rbelyh@beetsoft.com', 'firstname' => 'Rostislav', 'lastname' => 'B'],
            ['email' => 'kyledmclean@gmail.com', 'firstname' => 'Kyle', 'lastname' => 'M'],
            ['email' => 'alexeykuzmenko@beetsoft.com', 'firstname' => 'Alexey', 'lastname' => 'K'],
        ];
        User::insert(Arr::map($realUsers, fn($user) => [...User::factory()->makeOne($user)->toArray(), 'can_impersonate' => true]));

        $users = [
            [
                'user'          => [
                    'info' => [
                        'email'     => 'user1@cbtr.qa',
                        'firstname' => 'Magnus',
                        'lastname'  => 'Jennings',
                        'phone'     => '321-555-0001',
                    ]
                ],
                'company_owner' => [
                    'subscription_type' => null
                ],
                'companies'     => [
                    [
                        'info'         => [
                            'name'  => 'CBTR World',
                            'email' => 'company1@cbtr.me',
                            'phone' => '321-555-0001',
                            'site'  => 'https://company1.cbtr.qa',
                        ],
                        'settings'     => [
                            'integrations' => [
                                'paypal'        => [
                                    'client_id'     => 'AR3QiXr0CfknPm9A8zxiq2KG02OdtfeMWZCYb_7Xqcl2GSomDNe4blx2zQIzkFgkSawht13-xjWT8e2P',
                                    'client_secret' => 'EEvg4Pmu4fva9OJ0FB3vusd_cQkth8LzU9shgfdv4827G2BIKamm2JF60nBc1ck2AouH_KHiGzXzoMG0',
                                ],
                                'authorize_net' => [
                                    'api_login_id'    => '8WH87eqrY',
                                    'transaction_key' => '9c7N3X8J5eyxD724',
                                ],
                                'stripe'        => [
                                    'secret_key'      => 'sk_test_51J2vJsHo87dDYX5eUfBTydJwlePBYTeJiVV8Xj70CgqqPcd6YfamxpeMUyOv24VoGiFeyuLfwRJuyvDgUHqIm4fR00OXPQfmUb',
                                    'publishable_key' => 'pk_test_51J2vJsHo87dDYX5eAK5O1SahUq94E7vAaWEiejpXT2kmFKXRqp64NKFjc9raLeZuvPXeDEhnApKULaMtc1ufMo1n00FORfPjVQ',
                                ],
                            ],
                        ],
                        'address'      => [
                            'address'     => '100 North Lubec Road, Lubec, Maine 04652, United States',
                            'l1'          => '100 North Lubec Road',
                            'l2'          => null,
                            'city'        => 'Lubec',
                            'state'       => 'Maine',
                            'postal_code' => '04652',
                        ],
                        'employees'    => [
                            [
                                'user'     => [
                                    'email'     => 'user1-employee1@cbtr.qa',
                                    'firstname' => 'Charlotte',
                                    'lastname'  => 'Nitzsche',
                                    'phone'     => '321-555-0011',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'District Research Coordinator'
                                    ],
                                    'role'      => Role::ADMIN_ROLE,
                                    'locations' => [0, 1, 2, 3],
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'user1-employee2@cbtr.qa',
                                    'firstname' => 'Bella',
                                    'lastname'  => 'Waters',
                                    'phone'     => '321-555-0021',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'Lead Paradigm Manager'
                                    ],
                                    'role'      => Role::MANAGER_ROLE,
                                    'locations' => [0, 1, 2, 3],
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'user1-employee3@cbtr.qa',
                                    'firstname' => 'Terry',
                                    'lastname'  => 'Bosco',
                                    'phone'     => '321-555-0031',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'Direct Ideation Planner'
                                    ],
                                    'role'      => Role::PROVIDER_ROLE,
                                    'locations' => [0, 1, 2, 3],
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'user1-employee4@cbtr.qa',
                                    'firstname' => 'Ronnie',
                                    'lastname'  => 'Marvin',
                                    'phone'     => '321-555-0041',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'Product Markets Administrator'
                                    ],
                                    'role'      => Role::FRONTDESK_ROLE,
                                    'locations' => [0, 1, 2, 3],
                                ]
                            ],
                            [
                                // User from another company to create global appointment
                                'user'     => [
                                    'email' => 'user2@cbtr.qa',
                                ],
                                'employee' => [
                                    'role'      => Role::MANAGER_ROLE,
                                    'locations' => [0, 1, 2, 3],
                                ]
                            ],
                        ],
                        'locations'    => [
                            [
                                'info'    => [
                                    'name'       => 'North Office',
                                    'phone'      => '321-555-0101',
                                    'time_zone'  => 'America/Chicago',
                                    'is_primary' => true,
                                ],
                                'address' => [
                                    'address'     => '101 North Lubec Road, Lubec, Maine 04652, United States',
                                    'l1'          => '101 North Lubec Road',
                                    'l2'          => null,
                                    'city'        => 'Lubec',
                                    'state'       => 'Maine',
                                    'postal_code' => '04652',
                                ]
                            ],
                            [
                                'info'    => [
                                    'name'       => 'South Office',
                                    'phone'      => '321-555-0102',
                                    'time_zone'  => 'America/Chicago',
                                    'is_primary' => true,
                                ],
                                'address' => [
                                    'address'     => '102 Stevens Street, Shinglehouse, Pennsylvania 16748, United States',
                                    'l1'          => '102 Stevens Street',
                                    'l2'          => null,
                                    'city'        => 'Shinglehouse',
                                    'state'       => 'Pennsylvania',
                                    'postal_code' => '16748',
                                ]
                            ],
                            [
                                'info'    => [
                                    'name'       => 'West Office',
                                    'phone'      => '321-555-0103',
                                    'time_zone'  => 'America/Chicago',
                                    'is_primary' => true,
                                ],
                                'address' => [
                                    'address'     => '103 West Bull River Road, Lehi, Utah 84043, United States',
                                    'l1'          => '103 West Bull River Road',
                                    'l2'          => null,
                                    'city'        => 'Lehi',
                                    'state'       => 'Utah',
                                    'postal_code' => '84043',
                                ]
                            ],
                            [
                                'info'    => [
                                    'name'       => 'East Office',
                                    'phone'      => '321-555-0104',
                                    'time_zone'  => 'America/Chicago',
                                    'is_primary' => true,
                                ],
                                'address' => [
                                    'address'     => '104 East Side Drive, Alton Bay, New Hampshire 03810, United States',
                                    'l1'          => '104 East Side Drive',
                                    'l2'          => null,
                                    'city'        => 'Alton Bay',
                                    'state'       => 'New Hampshire',
                                    'postal_code' => '03810',
                                ]
                            ],
                        ],
                        'services'     => [
                            [
                                'info'      => [
                                    'name'                   => 'Free Service',
                                    'description'            => 'Free Service Appointment booking and application processing. To book, click here, or call: (212) 253-4170; www.mfservice.org. For the current email address of your choice, please visit the Services and Applications page on the left. Please note: This service is available from 9am to 5pm each day except on weekends. Call 800-331-2555 or visit www.fservice.org for hours.',
                                    'payment_type'           => Service::FREE_PAYMENT_TYPE,
                                    'duration'               => 10,
                                    'interval'               => 20,
                                    'advance_booking_buffer' => 30,
                                    'sorting_order'          => 0,
                                ],
                                'employees' => [1, 2, 3, 4, 5],
                                'locations' => [0, 1, 2, 3],
                            ],
                            [
                                'info'      => [
                                    'name'                   => 'Paid Service',
                                    'description'            => 'What is a paid service booking? A paid service booking is a booking application or contract which is a copy of your payment and is made online as soon as you order a payment, unless you cancel a booking prior to purchase. For more information, see our Frequently Asked Questions page. For more information on paid services please see the "Contact Us" page on our website.',
                                    'payment_type'           => Service::PAID_PAYMENT_TYPE,
                                    'price'                  => '15',
                                    'duration'               => 28,
                                    'interval'               => 14,
                                    'advance_booking_buffer' => 30,
                                    'sorting_order'          => 1,
                                ],
                                'employees' => [1, 2, 3, 4, 5],
                                'locations' => [0, 1, 2, 3],
                            ],
                            [
                                'info'      => [
                                    'name'                   => 'Prebooking One Day Service',
                                    'description'            => 'What is a paid service booking? A paid service booking is a booking application or contract which is a copy of your payment and is made online as soon as you order a payment, unless you cancel a booking prior to purchase. For more information, see our Frequently Asked Questions page. For more information on paid services please see the "Contact Us" page on our website.',
                                    'payment_type'           => Service::PAID_PAYMENT_TYPE,
                                    'price'                  => '15',
                                    'duration'               => 30,
                                    'interval'               => 30,
                                    'advance_booking_buffer' => 1440,
                                    'sorting_order'          => 1,
                                ],
                                'employees' => [1, 2, 3, 4],
                                'locations' => [0, 1, 2, 3],
                            ],
                            [
                                'info'      => [
                                    'name'                   => 'Variably Availability Service',
                                    'description'            => 'What is a paid service booking? A paid service booking is a booking application or contract which is a copy of your payment and is made online as soon as you order a payment, unless you cancel a booking prior to purchase. For more information, see our Frequently Asked Questions page. For more information on paid services please see the "Contact Us" page on our website.',
                                    'payment_type'           => Service::PAID_PAYMENT_TYPE,
                                    'price'                  => '15',
                                    'duration'               => 10,
                                    'interval'               => 0,
                                    'advance_booking_buffer' => 30,
                                    'sorting_order'          => 1,
                                    'schedule'               => [
                                        ['id' => '0', 'enable' => false],
                                        ['id' => '1', 'enable' => true],
                                        ['id' => '2', 'enable' => false],
                                        ['id' => '3', 'enable' => true],
                                        ['id' => '4', 'enable' => false],
                                        ['id' => '5', 'enable' => true],
                                        ['id' => '6', 'enable' => false],
                                    ]
                                ],
                                'employees' => [1, 2, 3, 4],
                                'locations' => [0, 1, 2, 3],
                            ],
                            [
                                'info'      => [
                                    'name'                   => 'Deposit Service',
                                    'description'            => 'Your reservation will be paid in full upon arrival. However, you will receive an email confirming the reservation before the appointment will begin (appointment confirmation will be used in place of payment until you arrive on the scheduled date).',
                                    'payment_type'           => Service::PREPAY_PAYMENT_TYPE,
                                    'price'                  => '13',
                                    'prepay'                 => '4',
                                    'duration'               => 60,
                                    'interval'               => 30,
                                    'advance_booking_buffer' => 30,
                                    'sorting_order'          => 2,
                                ],
                                'employees' => [1, 2, 3, 4, 5],
                                'locations' => [0, 1, 2, 3],
                            ],
                        ],
                        'customers'    => [
                            [
                                'info'    => [
                                    'firstname'  => 'Margaret',
                                    'lastname'   => 'Gibson',
                                    'email'      => 'company1-customer1@cbtr.qa',
                                    'phone'      => '321-555-1111',
                                    'birth_date' => '1991-11-08',
                                ],
                                'address' => [
                                    'address'     => '001 Customer Way, Irving, Texas 75039, United States',
                                    'l1'          => '001 Customer Way',
                                    'l2'          => null,
                                    'city'        => 'Irving',
                                    'state'       => 'Texas',
                                    'postal_code' => '75039',
                                ]
                            ],
                        ],
                        'appointments' => [
                            [
                                'service'  => 'Paid Service',
                                'location' => 'North Office',
                                'employee' => 'user2@cbtr.qa',
                                'customer' => 'company1-customer1@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(10, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(10, 29, 59),
                                ],
                            ],
                            [
                                'service'  => 'Paid Service',
                                'location' => 'North Office',
                                'employee' => 'user2@cbtr.qa',
                                'customer' => 'company1-customer1@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(12, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(14, 59, 59),
                                ],
                            ]
                        ]
                    ],
                    [
                        'info'         => [
                            'name'  => 'Butter Barber Shop',
                            'email' => 'company1-1@cbtr.qa',
                            'phone' => '321-555-1001',
                            'site'  => 'https://company1-1.cbtr.qa',
                        ],
                        'address'      => [
                            'address'     => '200 North Lubec Road, Lubec, Maine 04652, United States',
                            'l1'          => '200 North Lubec Road',
                            'l2'          => null,
                            'city'        => 'Lubec',
                            'state'       => 'Maine',
                            'postal_code' => '04652',
                        ],
                        'employees'    => [
                            [
                                'user'     => [
                                    'email'     => 'user1-employee1-1@cbtr.qa',
                                    'firstname' => 'Logan',
                                    'lastname'  => 'Evans',
                                    'phone'     => '321-555-0001',
                                ],
                                'employee' => [
                                    'info' => [
                                        'self_book' => false,
                                    ],
                                    'role' => Role::ADMIN_ROLE
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'user1-employee1-2@cbtr.qa',
                                    'firstname' => 'Anthony',
                                    'lastname'  => 'I',
                                    'phone'     => '321-555-0002',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'schedule' => [
                                            ['id'     => '0',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '1',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '2',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-08-29 08:30',
                                             'enable' => true],
                                            ['id'     => '3',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-23 08:30',
                                             'enable' => true],
                                            ['id'     => '4',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-11-03 08:30',
                                             'enable' => true],
                                            ['id'     => '5',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-06-20 08:30',
                                             'enable' => true],
                                            ['id'     => '6',
                                             'end'    => '2022-11-03 14:00',
                                             'start'  => '2022-05-17 07:00',
                                             'enable' => true],
                                        ],
                                    ],
                                    'role'      => Role::MANAGER_ROLE,
                                    'locations' => [0],
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'user1-employee1-3@cbtr.qa',
                                    'firstname' => 'Billie',
                                    'lastname'  => 'R',
                                    'phone'     => '321-555-0003',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'background_color'  => 'FFC107',
                                        'is_shifts_enabled' => true,
                                        'shifts'            => function () {
                                            // Every third Monday of month
                                            $period = CarbonPeriod::create(Carbon::now()->startOfMonth(), '1 month', Carbon::now()->addMonths(4));
                                            $period->setDateClass(CarbonImmutable::class);

                                            return iterator_to_array($period->map(function (CarbonImmutable $date) {
                                                $now = Carbon::parse("third Monday of $date");
                                                return [
                                                    'start'  => $now->setTime(8, 30)->toDateTimeString(),
                                                    'end'    => $now->setTime(14, 30)->toDateTimeString(),
                                                    'opened' => true
                                                ];
                                            }));
                                        },
                                        'schedule'          => [
                                            ['id'     => '0',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '1',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '2',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-08-29 08:30',
                                             'enable' => true],
                                            ['id'     => '3',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-23 08:30',
                                             'enable' => true],
                                            ['id'     => '4',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-11-03 08:30',
                                             'enable' => true],
                                            ['id'     => '5',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-06-20 08:30',
                                             'enable' => true],
                                            ['id'     => '6',
                                             'end'    => '2022-11-03 14:00',
                                             'start'  => '2022-05-17 07:00',
                                             'enable' => true],
                                        ],
                                    ],
                                    'role'      => Role::MANAGER_ROLE,
                                    'locations' => [0],
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'user1-employee1-4@cbtr.qa',
                                    'firstname' => 'Cesare',
                                    'lastname'  => 'S',
                                    'phone'     => '321-555-0004',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'background_color'  => 'D84315',
                                        'is_shifts_enabled' => true,
                                        'shifts'            => function () {
                                            // On Wednesday every even week
                                            $now = Carbon::now()->previous('Wednesday');
                                            // We need only even weeks
                                            if ($now->weekOfYear % 2 !== 0) $now = $now->addWeek();
                                            $period = CarbonPeriod::create($now, '2 week', Carbon::now()->addYear());
                                            $period->setDateClass(CarbonImmutable::class);

                                            return iterator_to_array($period->map(function (CarbonImmutable $date) {
                                                return [
                                                    'start'  => $date->setTime(8, 30)->toDateTimeString(),
                                                    'end'    => $date->setTime(18, 0)->toDateTimeString(),
                                                    'opened' => true
                                                ];
                                            }));
                                        },
                                        'schedule'          => [
                                            ['id'     => '0',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '1',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '2',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-08-29 08:30',
                                             'enable' => false],
                                            ['id'     => '3',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-23 08:30',
                                             'enable' => false],
                                            ['id'     => '4',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-11-03 08:30',
                                             'enable' => false],
                                            ['id'     => '5',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-06-20 08:30',
                                             'enable' => false],
                                            ['id'     => '6',
                                             'end'    => '2022-11-03 14:00',
                                             'start'  => '2022-05-17 07:00',
                                             'enable' => false],
                                        ],
                                    ],
                                    'role'      => Role::MANAGER_ROLE,
                                    'locations' => [0],
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'user1-employee1-5@cbtr.qa',
                                    'firstname' => 'Danny',
                                    'lastname'  => 'R',
                                    'phone'     => '321-555-0005',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'background_color'  => '673AB7',
                                        'is_shifts_enabled' => true,
                                        'shifts'            => function () {
                                            // Every third Monday of month
                                            $period = CarbonPeriod::create(Carbon::now()->startOfMonth(), '1 month', Carbon::now()->addMonths(4));
                                            $period->setDateClass(CarbonImmutable::class);

                                            return iterator_to_array($period->map(function (CarbonImmutable $date) {
                                                $now = Carbon::parse("third Monday of $date");
                                                return [
                                                    'start'  => $now->setTime(8, 30)->toDateTimeString(),
                                                    'end'    => $now->setTime(14, 30)->toDateTimeString(),
                                                    'opened' => true
                                                ];
                                            }));
                                        },
                                        'schedule'          => [
                                            ['id'     => '0',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '1',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '2',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-08-29 08:30',
                                             'enable' => true],
                                            ['id'     => '3',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-23 08:30',
                                             'enable' => true],
                                            ['id'     => '4',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-11-03 08:30',
                                             'enable' => true],
                                            ['id'     => '5',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-06-20 08:30',
                                             'enable' => true],
                                            ['id'     => '6',
                                             'end'    => '2022-11-03 14:00',
                                             'start'  => '2022-05-17 07:00',
                                             'enable' => true],
                                        ],
                                    ],
                                    'role'      => Role::MANAGER_ROLE,
                                    'locations' => [0],
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'user1-employee1-6@cbtr.qa',
                                    'firstname' => 'Terry',
                                    'lastname'  => 'M',
                                    'phone'     => '321-555-0006',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'background_color' => '00C853',
                                        'schedule'         => [
                                            ['id'     => '0',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '1',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-17 08:30',
                                             'enable' => false],
                                            ['id'     => '2',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-08-29 08:30',
                                             'enable' => true],
                                            ['id'     => '3',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-05-23 08:30',
                                             'enable' => true],
                                            ['id'     => '4',
                                             'end'    => '2022-04-27 18:00',
                                             'start'  => '2022-11-03 08:30',
                                             'enable' => true],
                                            ['id'     => '5',
                                             'end'    => '2022-08-27 18:00',
                                             'start'  => '2022-06-20 08:30',
                                             'enable' => true],
                                            ['id'     => '6',
                                             'end'    => '2022-11-03 14:00',
                                             'start'  => '2022-05-17 07:00',
                                             'enable' => true],
                                        ],
                                    ],
                                    'role'      => Role::MANAGER_ROLE,
                                    'locations' => [0],
                                ]
                            ],
                            [
                                // User from another company to create global appointment
                                'user'     => [
                                    'email' => 'user2@cbtr.qa',
                                ],
                                'employee' => [
                                    'role'      => Role::MANAGER_ROLE,
                                    'locations' => [0],
                                ]
                            ],
                        ],
                        'locations'    => [
                            [
                                'info'    => [
                                    'name'       => 'Butter Barber Shop',
                                    'phone'      => '321-555-1002',
                                    'time_zone'  => 'America/Chicago',
                                    'is_primary' => true,
                                    'schedule'   => [
                                        ['id'     => '0',
                                         'end'    => '2022-08-27 18:00',
                                         'start'  => '2022-05-17 08:30',
                                         'enable' => false],
                                        ['id'     => '1',
                                         'end'    => '2022-04-27 18:00',
                                         'start'  => '2022-05-17 08:30',
                                         'enable' => true],
                                        ['id'     => '2',
                                         'end'    => '2022-04-27 18:00',
                                         'start'  => '2022-08-29 08:30',
                                         'enable' => true],
                                        ['id'     => '3',
                                         'end'    => '2022-04-27 18:00',
                                         'start'  => '2022-05-23 08:30',
                                         'enable' => true],
                                        ['id'     => '4',
                                         'end'    => '2022-04-27 18:00',
                                         'start'  => '2022-11-03 08:30',
                                         'enable' => true],
                                        ['id'     => '5',
                                         'end'    => '2022-08-27 18:00',
                                         'start'  => '2022-06-20 08:30',
                                         'enable' => true],
                                        ['id'     => '6',
                                         'end'    => '2022-11-03 14:00',
                                         'start'  => '2022-05-17 07:00',
                                         'enable' => true],
                                    ],
                                ],
                                'address' => [
                                    'address'     => '200 North Lubec Road, Lubec, Maine 04652, United States',
                                    'l1'          => '200 North Lubec Road',
                                    'l2'          => null,
                                    'city'        => 'Lubec',
                                    'state'       => 'Maine',
                                    'postal_code' => '04652',
                                ]
                            ]
                        ],
                        'services'     => [
                            ['info'      => [
                                'name'                   => 'Haircut',
                                'payment_type'           => Service::PAID_PAYMENT_TYPE,
                                'duration'               => 30,
                                'interval'               => 0,
                                'price'                  => 27,
                                'advance_booking_buffer' => 60,
                                'sorting_order'          => 0,
                                'schedule'               => [
                                    ['id' => 0, 'enable' => false],
                                    ['id' => 1, 'enable' => true],
                                    ['id' => 2, 'enable' => true],
                                    ['id' => 3, 'enable' => true],
                                    ['id' => 4, 'enable' => true],
                                    ['id' => 5, 'enable' => true],
                                    ['id' => 6, 'enable' => true],
                                ],
                            ],
                             'employees' => [2, 3, 4, 5, 6, 7],
                             'locations' => [0]],
                            ['info'      => [
                                'name'                   => 'Beard Trim',
                                'payment_type'           => Service::PAID_PAYMENT_TYPE,
                                'duration'               => 30,
                                'interval'               => 0,
                                'price'                  => 27,
                                'advance_booking_buffer' => 60,
                                'sorting_order'          => 2,
                                'schedule'               => [
                                    ['id' => 0, 'enable' => true],
                                    ['id' => 1, 'enable' => true],
                                    ['id' => 2, 'enable' => true],
                                    ['id' => 3, 'enable' => true],
                                    ['id' => 4, 'enable' => true],
                                    ['id' => 5, 'enable' => true],
                                    ['id' => 6, 'enable' => false],
                                ],
                            ],
                             'employees' => [2, 3, 4, 5, 6, 7],
                             'locations' => [0]],
                            ['info'      => [
                                'name'                   => 'Straight Razor Shave',
                                'payment_type'           => Service::PAID_PAYMENT_TYPE,
                                'duration'               => 30,
                                'interval'               => 0,
                                'price'                  => 35,
                                'advance_booking_buffer' => 60,
                                'sorting_order'          => 3,
                                'schedule'               => [
                                    ['id' => 0, 'enable' => true],
                                    ['id' => 1, 'enable' => true],
                                    ['id' => 2, 'enable' => true],
                                    ['id' => 3, 'enable' => true],
                                    ['id' => 4, 'enable' => true],
                                    ['id' => 5, 'enable' => true],
                                    ['id' => 6, 'enable' => true],
                                ],
                            ],
                             'employees' => [3, 5, 6, 7],
                             'locations' => [0]],
                            ['info'      => [
                                'name'                   => 'Haircut & Beard Trim',
                                'payment_type'           => Service::PAID_PAYMENT_TYPE,
                                'duration'               => 45,
                                'interval'               => 0,
                                'price'                  => 47,
                                'advance_booking_buffer' => 60,
                                'sorting_order'          => 1,
                                'schedule'               => [
                                    ['id' => 0, 'enable' => true],
                                    ['id' => 1, 'enable' => true],
                                    ['id' => 2, 'enable' => true],
                                    ['id' => 3, 'enable' => true],
                                    ['id' => 4, 'enable' => true],
                                    ['id' => 5, 'enable' => true],
                                    ['id' => 6, 'enable' => false],
                                ],
                            ],
                             'employees' => [2, 3, 4, 5, 6, 7],
                             'locations' => [0]],
                            ['info'      => [
                                'name'                   => 'Haircut, Beard Trim and Razor Lining',
                                'payment_type'           => Service::PAID_PAYMENT_TYPE,
                                'duration'               => 60,
                                'interval'               => 0,
                                'price'                  => 60,
                                'advance_booking_buffer' => 60,
                                'sorting_order'          => 4,
                                'schedule'               => [
                                    ['id' => 0, 'enable' => true],
                                    ['id' => 1, 'enable' => true],
                                    ['id' => 2, 'enable' => true],
                                    ['id' => 3, 'enable' => true],
                                    ['id' => 4, 'enable' => true],
                                    ['id' => 5, 'enable' => true],
                                    ['id' => 6, 'enable' => false],
                                ],
                            ],
                             'employees' => [3, 5, 6, 7],
                             'locations' => [0]
                            ],
                        ],
                        'customers'    => [
                            [
                                'info'    => [
                                    'firstname'  => 'Margaret',
                                    'lastname'   => 'Gibson',
                                    'email'      => 'company1-customer1@cbtr.qa',
                                    'phone'      => '321-555-1111',
                                    'birth_date' => '1991-11-08',
                                ],
                                'address' => [
                                    'address'     => '001 Customer Way, Irving, Texas 75039, United States',
                                    'l1'          => '001 Customer Way',
                                    'l2'          => null,
                                    'city'        => 'Irving',
                                    'state'       => 'Texas',
                                    'postal_code' => '75039',
                                ]
                            ],
                            [
                                'info'    => [
                                    'firstname'  => 'Jaxson',
                                    'lastname'   => 'Young',
                                    'email'      => 'company1-customer2@cbtr.qa',
                                    'phone'      => '321-555-1112',
                                    'birth_date' => '1999-01-16',
                                ],
                                'address' => [
                                    'address'     => '002 Customer Way, Irving, Texas 75039, United States',
                                    'l1'          => '002 Customer Way',
                                    'l2'          => null,
                                    'city'        => 'Irving',
                                    'state'       => 'Texas',
                                    'postal_code' => '75039',
                                ]
                            ],
                            [
                                'info'    => [
                                    'firstname'  => 'Octavia',
                                    'lastname'   => 'Bennet',
                                    'email'      => 'company1-customer3@cbtr.qa',
                                    'phone'      => '321-555-1113',
                                    'birth_date' => '1989-03-02',
                                ],
                                'address' => [
                                    'address'     => '003 Customer Way, Irving, Texas 75039, United States',
                                    'l1'          => '003 Customer Way',
                                    'l2'          => null,
                                    'city'        => 'Irving',
                                    'state'       => 'Texas',
                                    'postal_code' => '75039',
                                ]
                            ],
                        ],
                        'appointments' => [
                            // Anthony
                            [
                                'service'  => 'Haircut',
                                'location' => 'Butter Barber Shop',
                                'employee' => 'user1-employee1-2@cbtr.qa',
                                'customer' => 'company1-customer2@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(11, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(15, 59, 59),
                                ],
                            ],
                            // Terry
                            [
                                'service'  => 'Haircut',
                                'location' => 'Butter Barber Shop',
                                'employee' => 'user1-employee1-6@cbtr.qa',
                                'customer' => 'company1-customer2@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(9, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(9, 29, 59),
                                ],
                            ],
                            [
                                'service'  => 'Haircut',
                                'location' => 'Butter Barber Shop',
                                'employee' => 'user1-employee1-6@cbtr.qa',
                                'customer' => 'company1-customer2@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(11, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(12, 29, 59),
                                ],
                            ],
                            [
                                'service'  => 'Haircut',
                                'location' => 'Butter Barber Shop',
                                'employee' => 'user1-employee1-6@cbtr.qa',
                                'customer' => 'company1-customer2@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(14, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(15, 59, 59),
                                ],
                            ],
                            [
                                'service'  => 'Haircut',
                                'location' => 'Butter Barber Shop',
                                'employee' => 'user1-employee1-6@cbtr.qa',
                                'customer' => 'company1-customer2@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(17, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(17, 29, 59),
                                ],
                            ],
                            // Danny
                            [
                                'service'  => 'Haircut',
                                'location' => 'Butter Barber Shop',
                                'employee' => 'user1-employee1-5@cbtr.qa',
                                'customer' => 'company1-customer2@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(12, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(12, 59, 59),
                                ],
                            ],
                            [
                                'service'  => 'Haircut',
                                'location' => 'Butter Barber Shop',
                                'employee' => 'user1-employee1-5@cbtr.qa',
                                'customer' => 'company1-customer2@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(13, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(13, 59, 59),
                                ],
                            ],
                            [
                                'service'  => 'Haircut',
                                'location' => 'Butter Barber Shop',
                                'employee' => 'user1-employee1-5@cbtr.qa',
                                'customer' => 'company1-customer2@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(14, 00, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(14, 59, 59),
                                ],
                            ],
                            // Nannie
                            [
                                'service'  => 'Haircut',
                                'location' => 'Butter Barber Shop',
                                'employee' => 'user2@cbtr.qa',
                                'customer' => 'company1-customer2@cbtr.qa',
                                'data'     => [],
                                'slot'     => [
                                    'start_at' => Carbon::now('America/Chicago')->setTime(10, 30, 00),
                                    'end_at'   => Carbon::now('America/Chicago')->setTime(10, 59, 59),
                                ],
                            ],
                        ]
                    ],
                ],
            ],
            [
                'user'          => [
                    'info' => [
                        'email'     => 'user2@cbtr.qa',
                        'firstname' => 'Nannie',
                        'lastname'  => 'Hussain',
                        'phone'     => '321-555-0002',
                    ],
                ],
                'company_owner' => [
                    'subscription_type' => SubscriptionLimitsService::SINGLE_USER_TYPE
                ],
                'companies'     => [
                    [
                        'info'      => [
                            'name'  => "Nannie Hussain's Company",
                            'email' => 'company2@cbtr.qa',
                            'phone' => '321-555-0002',
                            'site'  => 'https://company2.cbtr.qa',
                        ],
                        'address'   => [
                            'address'     => '123 South Street, East Dennis, Massachusetts 02660, United States',
                            'l1'          => '123 South Street',
                            'l2'          => null,
                            'city'        => 'East Dennis',
                            'state'       => 'Massachusetts',
                            'postal_code' => '02660',
                        ],
                        'locations' => [
                            [
                                'info'    => [
                                    'name'       => 'HeadQuarter',
                                    'phone'      => '321-555-0001',
                                    'time_zone'  => 'America/Chicago',
                                    'is_primary' => true,
                                ],
                                'address' => [
                                    'address'     => '101 North Lubec Road, Lubec, Maine 04652, United States',
                                    'l1'          => '101 North Lubec Road',
                                    'l2'          => null,
                                    'city'        => 'Lubec',
                                    'state'       => 'Maine',
                                    'postal_code' => '04652',
                                ]
                            ],
                        ],
                    ]
                ]
            ],
            [
                'user'          => [
                    'info' => [
                        'email'     => 'user3@cbtr.qa',
                        'firstname' => 'Jody',
                        'lastname'  => 'Fisher',
                        'phone'     => '321-555-0003',
                    ],
                ],
                'company_owner' => [
                    'subscription_type' => SubscriptionLimitsService::ORGANIZATION_TYPE
                ],
                'companies'     => [
                    [
                        'info'      => [
                            'name'  => "Jody Fisher's Newly Created Company Company",
                            'email' => 'unnfilledcompany@cbtr.qa',
                            'phone' => '321-555-0101',
                            'site'  => 'https://unfilledcompany.cbtr.qa',
                        ],
                        'address'   => [
                            'address'     => '123 East Main Street, Adena, Ohio 43901, United States',
                            'l1'          => '123 East Main Street',
                            'l2'          => null,
                            'city'        => 'Adena',
                            'state'       => 'Ohio',
                            'postal_code' => '43901',
                        ],
                        'locations' => [
                            [
                                'info'    => [
                                    'name'       => "Jody Fisher's Company Location",
                                    'phone'      => '321-555-0001',
                                    'time_zone'  => 'America/Chicago',
                                    'is_primary' => true,
                                ],
                                'address' => [
                                    'address'     => '101 North Lubec Road, Lubec, Maine 04652, United States',
                                    'l1'          => '101 North Lubec Road',
                                    'l2'          => null,
                                    'city'        => 'Lubec',
                                    'state'       => 'Maine',
                                    'postal_code' => '04652',
                                ]
                            ],
                        ],
                    ],
                    [
                        'info'      => [
                            'name'  => "Jody Fisher's Completed Company",
                            'email' => 'completedcompany@cbtr.qa',
                            'phone' => '321-555-0202',
                            'site'  => 'https://completedcompany.cbtr.qa',
                        ],
                        'address'   => [
                            'address'     => '123 East Main Street, Adena, Ohio 43901, United States',
                            'l1'          => '123 East Main Street',
                            'l2'          => null,
                            'city'        => 'Adena',
                            'state'       => 'Ohio',
                            'postal_code' => '43901',
                        ],
                        'locations' => [
                            [
                                'info'    => [
                                    'name'       => 'HeadQuarter',
                                    'phone'      => '321-555-0001',
                                    'time_zone'  => 'America/Chicago',
                                    'is_primary' => true,
                                ],
                                'address' => [
                                    'address'     => '101 North Lubec Road, Lubec, Maine 04652, United States',
                                    'l1'          => '101 North Lubec Road',
                                    'l2'          => null,
                                    'city'        => 'Lubec',
                                    'state'       => 'Maine',
                                    'postal_code' => '04652',
                                ]
                            ],
                            [
                                'info'    => [
                                    'name'       => 'Main Office',
                                    'phone'      => '321-555-0002',
                                    'time_zone'  => 'America/Chicago',
                                    'is_primary' => true,
                                ],
                                'address' => [
                                    'address'     => '101 North Lubec Road, Lubec, Maine 04652, United States',
                                    'l1'          => '101 North Lubec Road',
                                    'l2'          => null,
                                    'city'        => 'Lubec',
                                    'state'       => 'Maine',
                                    'postal_code' => '04652',
                                ],
                            ]
                        ],
                        'employees' => [
                            [
                                'user'     => [
                                    'email'     => 'charlotten-fisher@cbtr.qa',
                                    'firstname' => 'Charlotte',
                                    'lastname'  => 'Nitzsche',
                                    'phone'     => '321-555-0011',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'District Research Coordinator'
                                    ],
                                    'role'      => Role::ADMIN_ROLE,
                                    'locations' => [0, 1]
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'terryb-fisher@cbtr.qa',
                                    'firstname' => 'Terry',
                                    'lastname'  => 'Bosco',
                                    'phone'     => '321-555-0021',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'Lead Paradigm Manager'
                                    ],
                                    'role'      => Role::MANAGER_ROLE,
                                    'locations' => [0, 1]
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'bellaw-fisher@cbtr.qa',
                                    'firstname' => 'Bella',
                                    'lastname'  => 'Waters',
                                    'phone'     => '321-555-0031',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'Direct Ideation Planner'
                                    ],
                                    'role'      => Role::PROVIDER_ROLE,
                                    'locations' => [0, 1]
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'ronniem-fisher@cbtr.qa',
                                    'firstname' => 'Ronnie',
                                    'lastname'  => 'Marvin',
                                    'phone'     => '321-555-0041',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'Product Markets Administrator'
                                    ],
                                    'role'      => Role::FRONTDESK_ROLE,
                                    'locations' => [0, 1]
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'rostob-fisher@cbtr.qa',
                                    'firstname' => 'Rostislav',
                                    'lastname'  => 'Belykh',
                                    'phone'     => '321-555-0041',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'AFK'
                                    ],
                                    'role'      => Role::FRONTDESK_ROLE,
                                    'locations' => [0, 1]
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'alexeyk-fisher@cbtr.qa',
                                    'firstname' => 'Alexey',
                                    'lastname'  => 'Kuzmenko',
                                    'phone'     => '321-555-0041',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'He walks your dog'
                                    ],
                                    'role'      => Role::PROVIDER_ROLE,
                                    'locations' => [0, 1]
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'antonk-fisher@cbtr.qa',
                                    'firstname' => 'Anton',
                                    'lastname'  => 'Kuzmenko',
                                    'phone'     => '321-555-0041',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'Designer'
                                    ],
                                    'role'      => Role::PROVIDER_ROLE,
                                    'locations' => [0, 1]
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'vyacheslavz-fisher@cbtr.qa',
                                    'firstname' => 'Vyacheslav',
                                    'lastname'  => 'Zolotykh',
                                    'phone'     => '321-555-0041',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'SENIOR PHP BACKEND DEVELOPER'
                                    ],
                                    'role'      => Role::FRONTDESK_ROLE,
                                    'locations' => [0, 1]
                                ]
                            ],
                            [
                                'user'     => [
                                    'email'     => 'nikolaya-fisher@cbtr.qa',
                                    'firstname' => 'Nikolay',
                                    'lastname'  => 'Amoseev',
                                    'phone'     => '321-555-0041',
                                ],
                                'employee' => [
                                    'info'      => [
                                        'profession_title' => 'HR Recruitment'
                                    ],
                                    'role'      => Role::PROVIDER_ROLE,
                                    'locations' => [0, 1]
                                ]
                            ],
                        ]
                    ]
                ]
            ]
        ];

        $this->seederService->seed($users);
    }
}
