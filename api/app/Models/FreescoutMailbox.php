<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FreescoutMailbox extends Model
{
    use HasFactory;

    /**
     * From Name: name that will appear in the From field when a customer views your email.
     */
    const FROM_NAME_MAILBOX = 1;
    const FROM_NAME_USER = 2;
    const FROM_NAME_CUSTOM = 3;

    /**
     * Default Status: when you reply to a message, this status will be set by default (also applies to email integration).
     */
    const TICKET_STATUS_ACTIVE = 1;
    const TICKET_STATUS_PENDING = 2;
    const TICKET_STATUS_CLOSED = 3;

    /**
     * Email Template.
     */
    const TEMPLATE_FANCY = 1;
    const TEMPLATE_PLAIN = 2;

    /**
     * Default Assignee.
     */
    const TICKET_ASSIGNEE_ANYONE = 1;
    const TICKET_ASSIGNEE_REPLYING_UNASSIGNED = 2;
    const TICKET_ASSIGNEE_REPLYING = 3;

    /**
     * Outgoing encryption.
     */
    const OUT_ENCRYPTION_NONE = 1;
    const OUT_ENCRYPTION_SSL = 2;
    const OUT_ENCRYPTION_TLS = 3;

    /**
     * Access permissions.
     */
    const ACCESS_PERM_EDIT = 'edit';
    const ACCESS_PERM_PERMISSIONS = 'perm';
    const ACCESS_PERM_AUTO_REPLIES = 'auto';
    const ACCESS_PERM_SIGNATURE = 'sig';

    public static $access_permissions = [
        self::ACCESS_PERM_EDIT,
        self::ACCESS_PERM_PERMISSIONS,
        self::ACCESS_PERM_AUTO_REPLIES,
        self::ACCESS_PERM_SIGNATURE,
    ];

    protected $fillable = ['freescout_mailbox_id', 'name', 'email'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
