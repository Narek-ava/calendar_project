<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class MailgunIncomingEmail extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['payload', 'is_processed', 'is_unknown_mailbox', 'processed_at'];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'payload' => 'array',
    ];

    /*
     * Backward capability
     */
    public function getReplyTo()
    {
        return Arr::get($this->payload, 'From');
    }

    public function getMessageId()
    {
        return Arr::get($this->payload, 'Message-Id');
    }

    public function getReferences()
    {
        return Arr::get($this->payload, 'References');
    }

    public function getHeader()
    {
        return Arr::get($this->payload, 'message-headers');
    }

    public function getSubject()
    {
        return Arr::get($this->payload, 'Subject');
    }

    public function getTo()
    {
        return Arr::get($this->payload, 'To');
    }

    public function getFrom()
    {
        return Arr::get($this->payload, 'From');
    }

    public function getCc()
    {
        return Arr::get($this->payload, 'Cc');
    }

    public function getBcc()
    {
        return Arr::get($this->payload, 'Bcc');
    }

    public function getBodyHtml()
    {
        return Arr::get($this->payload, 'body-html');
    }

    public function getBodyPlain()
    {
        return Arr::get($this->payload, 'body-plain');
    }

    public function getSender()
    {
        return Arr::get($this->payload, 'sender');
    }

    public function getRecipient()
    {
        return Arr::get($this->payload, 'recipient');
    }

    public function getUploadedAttachments()
    {
        return Arr::get($this->payload, 'uploaded-attachments', []);
    }
}
