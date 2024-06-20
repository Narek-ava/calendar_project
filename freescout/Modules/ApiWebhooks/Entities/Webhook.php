<?php

namespace App;

namespace Modules\ApiWebhooks\Entities;

use Modules\ApiWebhooks\Entities\WebhookLog;
use Illuminate\Database\Eloquent\Model;
use Zttp\Zttp;

class Webhook extends Model
{
    const MAX_ATTEMPTS = 10;

    public static $events = [
        'convo.assigned',
        'convo.created',
        'convo.deleted',
        //'convo.merged',
        'convo.moved',
        'convo.status',
        //'convo.tags',
        'convo.customer.reply.created',
        'convo.agent.reply.created',
        'convo.note.created',
        'customer.created',
        'customer.updated',
    ];

    public $timestamps = false;

    protected $casts = [
        'events' => 'array',
    ];

    public static function getAllEvents()
    {
        return self::$events;
    }

    public static function getSecretKey()
    {
        return md5(config('app.key').'webhook_key');
    }

    public function run($event, $data, $webhook_log_id = null)
    {
        $options = ['connect_timeout' => 30]; // seconds

        //foreach ($data as $key => $entity) {
        $params = \ApiWebhooks::formatEntity($data);
        //}

        $this->last_run_time = date('Y-m-d H:i:s');

        try {
            $response = Zttp::withHeaders([
                    'Content-Type' => 'application/hal+json',
                    'X-FreeScout-Event' => $event,
                    'X-FreeScout-Signature' => self::sign(json_encode($params)),
                ])
                ->withOptions($options)
                ->post($this->url, $params);
        } catch (\Exception $e) {
            
            //if (!$webhook_log_id) {
                $this->last_run_error = $e->getMessage();
                $this->save();
            //}

            WebhookLog::add($this, $event, 0, $params, $e->getMessage(), $webhook_log_id);
            return false;
        }

        // https://guzzle3.readthedocs.io/http-client/response.html
        if ($response->status() >= 200 && $response->status() <= 299) {

            $this->last_run_error = '';
            $this->save();
            
            return true;
        } else {
            $error = 'Response status code: '.$response->status();
            //if (!$webhook_log_id) {
                $this->last_run_error = $error;
                $this->save();
            //}

            WebhookLog::add($this, $event, $response->status(), $params, $error, $webhook_log_id);
            return false;
        }
    }

    public static function sign($data)
    {
        if (!function_exists('hash_hmac')) {
            \Log::error('Could not sign webhook request. Please install "hash" extension in your PHP.');
            return '';
        }
        
        return base64_encode(hash_hmac('sha1', $data, self::getSecretKey(), true));
    }

    public static function create($data)
    {
        $webhook = null;

        if (!empty($data['url']) && !empty($data['events'])) {

            $events = $data['events'];    
            if (!is_array($events)) {
                if (is_string($events)) {
                    $events = explode(',', $events);
                } else {
                    return null;
                }
            }

            // Remove non-existing events.
            foreach ($events as $i => $event) {
                if (!in_array($event, self::$events)) {
                    unset($events[$i]);
                }
            }
            if (!$events) {
                return null;
            }

            $webhook = new \Webhook();
            $webhook->url = $data['url'];
            $webhook->events = $events;
            $webhook->save();

            \ApiWebhooks::clearWebhooksCache();
        }

        return $webhook;
    }
}
