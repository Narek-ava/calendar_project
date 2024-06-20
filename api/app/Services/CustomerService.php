<?php

namespace App\Services;

use App\Events\CustomerCreatedEvent;
use App\Models\Address;
use App\Models\Company;
use App\Models\Customer;
use App\Models\CustomerContact;
use DB;
use Event;

final class CustomerService
{
    public function createCustomer(Company $company, array $data)
    {
        return DB::transaction(function () use ($company, $data) {
            $customer = $company->companyOwner->customers()->create($data);
            $customer->address()->save(new Address($data['address'] ?? []));

            // Is used to distinguish which company customer is attached
            $customer->company()->associate($company);
            $customer->save();

            if (isset($data['email'])) {
                $customer->contacts()->create([
                    'type'  => CustomerContact::EMAIL_TYPE,
                    'value' => $data['email'],
                ]);
            }

            if (isset($data['phone'])) {
                $customer->contacts()->create([
                    'type'  => CustomerContact::PHONE_TYPE,
                    'value' => $data['phone'],
                ]);
            }

            if (isset($data['contacts'])) {
                $customer->contacts()->upsert($data['contacts']);
            }

            Event::dispatch(new CustomerCreatedEvent($customer));

            return $customer;
        });
    }

    public function updateCustomer(Customer $customer, array $data)
    {
        return DB::transaction(function () use ($customer, $data) {
            $customer->update($data);
            $customer->address()->update($data['address']);

            if (isset($data['contacts'])) {
                foreach ($data['contacts'] as $contact) {
                    if ($contact['id']) {
                        CustomerContact::query()->where('id', $contact['id'])->update($contact);
                    } else {
                        CustomerContact::query()->create($contact);
                    }
                }
            }

            return $customer;
        });
    }

    /**
     * @param Company $company
     * @param array $data
     * @return Customer|null
     */
    public function getCustomer(Company $company, array $data): Customer|null
    {
        $customer = null;

        if (isset($data['email']) && !isset($data['phone'])) {
            $customer = $company->customers()->withTrashed()->where('email', $data['email'])->first();
        }

        if (!isset($data['email']) && isset($data['phone'])) {
            $customer = $company->customers()->withTrashed()->where('phone', $data['phone'])->first();
        }

        if (isset($data['email']) && isset($data['phone'])) {
            $customer = $company->customers()->withTrashed()
                ->where('phone', $data['phone'])
                ->orWhere('email', $data['email'])
                ->first();
        }

        return $customer;
    }

    /**
     * @param Company $company
     * @param array $data
     * @return Customer
     */
    public function getOrCreateCustomer(Company $company, array $data): Customer
    {
        $customer = $this->getCustomer($company, $data);
        if (!$customer) $customer = $this->createCustomer($company, $data);
        return $customer;
    }
}
