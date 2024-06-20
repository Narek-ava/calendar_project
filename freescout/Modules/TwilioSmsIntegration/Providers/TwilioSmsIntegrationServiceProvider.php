<?php

namespace Modules\TwilioSmsIntegration\Providers;

use App\Conversation;
use App\Customer;
use App\Mailbox;
use App\Misc\Helper;
use App\Thread;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Factory;
use Twilio\Exceptions\ConfigurationException;
use Twilio\Exceptions\TwilioException;
use Twilio\Rest\Client;
use Illuminate\Support\Facades\Storage;
use App\Attachment;

require_once __DIR__ . '/../vendor/autoload.php';

class TwilioSmsIntegrationServiceProvider extends ServiceProvider
{
    const CHANNEL_ID = 100;
    const CHANNEL_NAME = 'SMS';
    const MODULE_NAME = 'twiliosmsintegration';

    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = false;

    /**
     * Boot the application events.
     *
     * @return void
     */
    public function boot(): void
    {
        $this->registerConfig();
        $this->registerViews();
        $this->registerFactories();
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        $this->hooks();
    }

    /**
     * Module hooks.
     * @throws ConfigurationException|TwilioException
     */
    public function hooks()
    {
        // Add menu item
        \Eventy::addAction('mailboxes.settings.menu', function ($mailbox) {
            if (auth()->user()->isAdmin()) {
                echo \View::make(self::MODULE_NAME . '::partials/settings_menu', ['mailbox' => $mailbox])->render();
            }
        }, 35);

        // Highlight menu item
        \Eventy::addFilter('menu.selected', function ($menu) {
            $menu[self::MODULE_NAME] = ['mailboxes.' . self::MODULE_NAME . '.settings'];
            return $menu;
        });

        // Display name in badge
        \Eventy::addFilter('channel.name', function ($name, $channel) {
            if ($name || $channel !== self::CHANNEL_ID) return $name;
            return self::CHANNEL_NAME;
        }, 20, 2);

        //
        \Eventy::addAction('chat_conversation.send_reply', function (Conversation $conversation, $replies, Customer $customer) {
            if ($conversation->channel !== self::CHANNEL_ID) return;

            // If thread is draft, it means it has been undone
            $lastUserMessage = $conversation->getLastReply()->fresh();
            if ($lastUserMessage->isDraft()) return;

            $body = $lastUserMessage->body;

            // Get the latest incoming message from customer to get phone number
            $lastCustomerMessage = $conversation->threads()
                ->whereNotNull('meta')
                ->whereType(Thread::TYPE_CUSTOMER)
                ->latest()
                ->first();

            $toPhone = $lastCustomerMessage
                ? array_get($lastCustomerMessage->getMeta(self::MODULE_NAME), 'input.From')
                : $customer->first_name;

            // Your Account SID and Auth Token from twilio.com/console
            $client = new Client(
                array_get($conversation->mailbox->getMeta(self::MODULE_NAME), 'account_sid'),
                array_get($conversation->mailbox->getMeta(self::MODULE_NAME), 'auth_token')
            );

            // Extract the images source URL from the body
            preg_match_all('/<img[^>]+src="([^"]+)"/', $body, $matches);
            $imageUrls = $matches[1];

            // Move images to S3 and Replace the original image URL with the S3 URL in the message body
            foreach($imageUrls as $initialImageUrl){
                $imageUrl = html_entity_decode($initialImageUrl);
                $tmpFile = tempnam(sys_get_temp_dir(), 'download');

                $uploadedFile = new UploadedFile($tmpFile, basename($imageUrl));
                file_put_contents($uploadedFile, file_get_contents($imageUrl));

                $path = Storage::disk('s3')->putFile('inbox-attachments', $uploadedFile);
                $s3Url = Storage::disk('s3')->url($path);
                $body = str_replace($initialImageUrl, $s3Url, $body);

                unlink($uploadedFile->getPathname());
            }

            // Get text from user's message
            $text = \Helper::htmlToText($body, true);

            // Move attachments to S3 and add into mediaUrl array
            if($lastUserMessage->has_attachments)
            {
                $attachments = Attachment::whereThreadId($lastUserMessage->id)->whereEmbedded(false)->get();

                foreach($attachments as $attachment){
                    $tmpFile = tempnam(sys_get_temp_dir(), 'download');

                    $uploadedFile = new UploadedFile($tmpFile, basename($attachment->url()));
                    file_put_contents($uploadedFile, file_get_contents($attachment->url()));

                    $path = Storage::disk('s3')->putFile('inbox-attachments', $uploadedFile);
                    $s3Url = Storage::disk('s3')->url($path);

                    $mediaUrl[] = $s3Url;

                    unlink($uploadedFile->getPathname());
                }
            }
            
            $message = $client->messages->create(
                $toPhone,
                [
                    'messagingServiceSid' => array_get($conversation->mailbox->getMeta(self::MODULE_NAME), 'messaging_service_sid'),
                    'body' =>  $text,
                    'mediaUrl' =>  $mediaUrl ?? []
                ]
            );

            Helper::log(self::CHANNEL_NAME . ' Outgoing', 'Outgoing message to Twilio', [
                'to'             => $toPhone,
                'text'           => $text,
                'twilioResponse' => $message,
            ]);
        }, 20, 3);
    }

    public static function getMailboxSecret(Mailbox $mailbox): int
    {
        return crc32(config('app.key') . self::MODULE_NAME . $mailbox->id);
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register(): void
    {
        $this->registerTranslations();
    }

    /**
     * Register config.
     *
     * @return void
     */
    protected function registerConfig(): void
    {
        $this->publishes([
            __DIR__ . '/../Config/config.php' => config_path(self::MODULE_NAME . '.php'),
        ], 'config');
        $this->mergeConfigFrom(
            __DIR__ . '/../Config/config.php', self::MODULE_NAME
        );
    }

    /**
     * Register views.
     *
     * @return void
     */
    public function registerViews(): void
    {
        $viewPath = resource_path('views/modules/' . self::MODULE_NAME);

        $sourcePath = __DIR__ . '/../Resources/views';

        $this->publishes([
            $sourcePath => $viewPath
        ], 'views');

        $this->loadViewsFrom(array_merge(array_map(function ($path) {
            return $path . '/modules/' . self::MODULE_NAME;
        }, config('view.paths')), [$sourcePath]), self::MODULE_NAME);
    }

    /**
     * Register translations.
     *
     * @return void
     */
    public function registerTranslations(): void
    {
        $this->loadJsonTranslationsFrom(__DIR__ . '/../Resources/lang');
    }

    /**
     * Register an additional directory of factories.
     * @source https://github.com/sebastiaanluca/laravel-resource-flow/blob/develop/src/Modules/ModuleServiceProvider.php#L66
     */
    public function registerFactories()
    {
        if (!app()->environment('production')) {
            app(Factory::class)->load(__DIR__ . '/../Database/factories');
        }
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides(): array
    {
        return [];
    }
}
