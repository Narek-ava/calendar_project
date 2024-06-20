<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\CustomerService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Throwable;

class ImportCustomers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'customers:import';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import customers to production DB from url to given company';

    public function __construct(private readonly CustomerService $customerService)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return bool|void
     */
    public function handle()
    {
        if (!$this->confirm('Are you sure? This action will change the production DB')) return false;

        // Ask for company
        $company = Company::query()->findOrFail($this->ask('ID of company for importing'));
        if (!$this->confirm("To this $company->name?")) return false;

        // Ask for customers
        $url = $this->ask('URL to CSV with customers?');
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            $this->error('Given URL is not valid');
            return false;
        }

        $this->output->title('Fetching file...');

        $customersData = $this->getCustomerData($company, file_get_contents($url));
        if (!$customersDataCount = count($customersData)) return false;

        $this->output->title("Customers found: $customersDataCount");

        // Run
        $progressBar = $this->output->createProgressBar($customersDataCount);
        $progressBar->setFormat('debug');
        $progressBar->start();

        if (app()->isLocal()) {
            $filename = "{$company->slug}-skipped-customers.csv";
            @unlink($filename);

            $fp = fopen($filename, 'w');
            fputcsv($fp, ['firstname', 'lastname', 'phone', 'email']);
        }

        foreach ($customersData as $customerData) {
            try {
                $customer = $this->customerService->getCustomer($company, $customerData);
                if (!$customer) {
                    $this->customerService->createCustomer($company, $customerData);
                } else {
                    if (app()->isLocal()) {
                        fputcsv($fp, [
                            'firstname' => $customerData['firstname'] ?? '',
                            'lastname'  => $customerData['lastname'] ?? '',
                            'phone'     => $customerData['phone'] ?? '',
                            'email'     => $customerData['email'] ?? '',
                        ]);
                    }
                }
            } catch (Throwable $exception) {
                $this->output->error($exception->getMessage());
                dump($customerData, $exception);
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
    }

    /**
     * @param Company $company
     * @param string $csvString
     * @return array
     */
    private function getCustomerData(Company $company, string $csvString): array
    {
        return match ($company->slug) {
            'sorrentinos-barber-shop' => self::getCustomerDataSorrentinos($csvString),
            'the-honorable-society'   => self::getCustomerDataTHS($csvString),
            default                   => []
        };
    }

    /**
     * @param string $csvString
     * @return array
     */
    private function getCustomerDataSorrentinos(string $csvString): array
    {
        try {
            $customersData = str_getcsv($csvString, "\n");

            $columns = array_map(fn($col) => Str::of($col)->snake('')
                ->replace('mobile', 'phone')
                ->replace('createdat', 'birth_date'), explode(',', $customersData[0]));
            array_shift($customersData); // remove column names

            // explode, generate array and clear empty values
            array_walk($customersData, fn(&$row) => $row = $this->prepareCustomerData(
                array_filter(
                    array_combine($columns, explode(',', $row))
                )
            ));

            return $customersData;
        } catch (Throwable) {
            $this->output->error('Wrong csv file');
            return [];
        }
    }

    /**
     * @param string $csvString
     * @return array
     */
    private function getCustomerDataTHS(string $csvString): array
    {
        try {
            $customersData = str_getcsv($csvString, "\n");
            array_shift($customersData); // remove column names

            return Arr::map($customersData, function ($row) {
                list($firstname, $lastname, $phone, $email) = explode(',', $row);

                return $this->prepareCustomerData(array_filter(
                    ['firstname' => $firstname, 'lastname' => $lastname, 'phone' => $phone, 'email' => $email]
                ));
            });
        } catch (Throwable $exception) {
            $this->output->error("Wrong csv file, {$exception->getMessage()}");
            return [];
        }
    }

    /**
     * @param array $data
     * @return array
     */
    private function prepareCustomerData(array $data): array
    {
        if (isset($data['birth_date'])) {
            $data['birth_date'] = Carbon::parse($data['birth_date'])->toDateString();
            $data['created_at'] = $data['birth_date'];
            $data['updated_at'] = $data['birth_date'];
        }

        if (isset($data['email'])) $data['email'] = $this->clearEmail($data['email']);
        if (isset($data['phone'])) $data['phone'] = $this->clearPhone($data['phone']);

        return $data;
    }

    /**
     * @param string $email
     * @return mixed
     */
    private function clearEmail(string $email): string
    {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        return Str::lower($email);
    }

    /**
     * @param string $phone
     * @return string|null
     */
    private function clearPhone(string $phone): ?string
    {
        $phone = Str::of($phone)
            ->replace(['+1'], '') // +1 555-555-5305
            ->ltrim('1') //  remove "1" from start of 15555558846 -> 5555558846
            ->replaceMatches('/[^0-9]+/', '')
            ->trim()
            ->toString();

        if (strlen($phone) < 9) $phone = null;

        return $phone;
    }
}
