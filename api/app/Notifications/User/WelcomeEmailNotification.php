<?php

namespace App\Notifications\User;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Throwable;

class WelcomeEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct()
    {
    }

    /**
     * Determine if the notification should be sent.
     *
     * @param mixed $notifiable
     * @param string $channel
     * @return bool
     * @throws Throwable
     */
    public function shouldSend(mixed $notifiable, string $channel): bool
    {
        return true;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param User $notifiable
     * @return array
     */
    public function via(User $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param User $notifiable
     * @return MailMessage
     */
    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Thank you for subscribing to Chilled Butter!')
            ->markdown('emails.user.welcome-email');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param User $notifiable
     * @return array
     */
    public function toArray(User $notifiable): array
    {
        return [];
    }
}
