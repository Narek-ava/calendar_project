<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\Company;
use App\Services\SeederService;
use Arr;
use Carbon\CarbonImmutable;
use Glorand\Model\Settings\Exceptions\ModelSettingsException;
use Illuminate\Console\Command;

class SeedDemoAppointments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed-demo-appointments {company-slug} : The slug of the company to seed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed appointments for demo to given company';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @param SeederService $seederService
     * @return void
     * @throws ModelSettingsException
     */
    public function handle(SeederService $seederService): void
    {
        $company = Company::whereSlug($this->argument('company-slug'))->firstOrFail();

        $company->settings()->set('notifications.enabled', false);
        $company->save();

        $appointmentsData = $this->appointmentsData();
        $this->info("Star seeding appointments for: $company->slug, total: " . count($appointmentsData));
        $seederService->seedAppointments($company, $appointmentsData);

        $blockTimesData = $this->blockTimesData();
        $this->info("Star seeding block times for: $company->slug, total: " . count($blockTimesData));
        $seederService->seedBlockTimes($company, $blockTimesData);
    }

    /**
     * @return array[]
     */
    private function appointmentsData(): array
    {
        $appointments = [];

        // Until Next monday
        $end = CarbonImmutable::parse('Next Sunday')->shiftTimezone('America/Chicago')->endOfDay();
        $days = CarbonImmutable::now()->shiftTimezone('America/Chicago')->startOfDay()->toPeriod($end);

        $locationNames = [
            'Chilled Butter Barbershop',
        ];

        $serviceNames = [
            'Haircut',
            'Beard Shave',
        ];

        $employeeEmails = [
            'provider@chilledbutter.com',
            'barber@chilledbutter.com',
            'hulk@chilledbutter.com',
        ];

        $customerEmails = [
            'abomination@chilledbutter.com',
            'imronan@chilledbutter.com',
            'mysterio@chilledbutter.com',
        ];

        $statuses = [
            // Increase chance of random
            ...array_fill(0, 5, Appointment::ACTIVE_STATUS),
            ...Appointment::$statuses
        ];

        foreach ($days as $date) {
            array_push($appointments,
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(9, 00, 00),
                        'end_at'   => $date->setTime(9, 29, 59),
                    ],
                    'status'   => Arr::random($statuses),

                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(9, 30, 00),
                        'end_at'   => $date->setTime(9, 59, 59),
                    ],
                    'status'   => Arr::random($statuses),
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(10, 00, 00),
                        'end_at'   => $date->setTime(10, 59, 59),
                    ],
                    'status'   => Arr::random($statuses),

                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(11, 00, 00),
                        'end_at'   => $date->setTime(11, 59, 59),
                    ],
                    'status'   => Arr::random($statuses),
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(12, 00, 00),
                        'end_at'   => $date->setTime(12, 29, 59),
                    ],
                    'status'   => Arr::random($statuses),
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(12, 30, 00),
                        'end_at'   => $date->setTime(12, 59, 59),
                    ],
                    'status'   => Arr::random($statuses),
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(13, 00, 00),
                        'end_at'   => $date->setTime(13, 59, 59),
                    ],
                    'status'   => Arr::random($statuses),
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(14, 00, 00),
                        'end_at'   => $date->setTime(14, 59, 59),
                    ],
                    'status'   => Arr::random($statuses),
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(15, 00, 00),
                        'end_at'   => $date->setTime(15, 29, 59),
                    ],
                    'status'   => Arr::random($statuses),
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(15, 30, 00),
                        'end_at'   => $date->setTime(15, 59, 59),
                    ],
                    'status'   => Appointment::CANCELED_STATUS,
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(15, 30, 00),
                        'end_at'   => $date->setTime(15, 59, 59),
                    ],
                    'status'   => Appointment::ACTIVE_STATUS,
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(16, 00, 00),
                        'end_at'   => $date->setTime(16, 29, 59),
                    ],
                    'status'   => Arr::random($statuses),
                ],
                [
                    'service'  => Arr::random($serviceNames),
                    'location' => Arr::random($locationNames),
                    'employee' => Arr::random($employeeEmails),
                    'customer' => Arr::random($customerEmails),
                    'slot'     => [
                        'start_at' => $date->setTime(17, 00, 00),
                        'end_at'   => $date->setTime(17, 59, 59),
                    ],
                    'status'   => Arr::random($statuses),
                ],
            );
        }

        return $appointments;
    }

    /**
     * @return array[]
     */
    private function blockTimesData(): array
    {
        return [];
    }
}
