<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmployeeCreated extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(
        private Company $company,
        private User    $user,
        private string  $password
    )
    {
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this
            ->from($this->company->fromEmailAddress(), $this->company->name)
            ->replyTo($this->company->replyToAddress(), $this->company->name)
            ->markdown('emails.employee.created', [
                'company'  => $this->company,
                'user'     => $this->user,
                'password' => $this->password,
                'logo'     => $this->company->email_logo,
                'logoAlt'  => $this->company->name,
            ]);
    }
}
