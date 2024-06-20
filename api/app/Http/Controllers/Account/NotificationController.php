<?php

namespace App\Http\Controllers\Account;

use App\Events\NotificationsListUpdatedEvent;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\Employee\UncompletedAppointmentReminderNotification;
use App\Notifications\Employee\UpcomingAppointmentReminderNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function __invoke(): Collection
    {
        /** @var $user User */
        $user = auth()->user();

        return $user
            ->notifications()
            // TODO: Tmp disabled, notifications on FE side should be properly displayed
            ->whereNotIn('type', [
                UpcomingAppointmentReminderNotification::class,
                UncompletedAppointmentReminderNotification::class
            ])
            ->when($user->context_company_id, fn(Builder $query) => $query->where('data->company->id', $user->context_company_id))
            ->limit(30)
            ->get();
    }

    public function markAllRead()
    {
        broadcast(new NotificationsListUpdatedEvent(auth()->user()->id))->toOthers();
        auth()->user()->unreadNotifications->markAsRead();
    }

    public function markRead(DatabaseNotification $notification): void
    {
        broadcast(new NotificationsListUpdatedEvent(auth()->user()->id))->toOthers();
        $notification->markAsRead();
    }
}
