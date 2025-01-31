<?php

namespace App\Console\Commands;

use App\Attachment;
use App\Conversation;
use App\Customer;
use App\Email;
use App\Events\ConversationCustomerChanged;
use App\Events\CustomerCreatedConversation;
use App\Events\CustomerReplied;
use App\Events\UserReplied;
use App\Mailbox;
use App\MailgunIncomingEmail;
use App\Misc\MailHelper;
use App\Option;
use App\SendLog;
use App\Subscription;
use App\Thread;
use App\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Storage;
use Throwable;

class FetchEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'freescout:fetch-emails {--days=3} {--unseen=1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch emails from mailboxes addresses';

    /**
     * Current mailbox.
     *
     * Used to process emails sent to multiple mailboxes.
     */
    public $mailbox;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @param $string
     * @param $verbosity
     * @return void
     */
    public function info($string, $verbosity = null): void
    {
        $date = Carbon::now();
        parent::info("[$date] $string", $verbosity);
    }

    /**
     * @param $string
     * @param null $verbosity
     * @return void
     */
    public function error($string, $verbosity = null): void
    {
        $date = Carbon::now();
        parent::error("[$date] $string", $verbosity);
    }

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle(): void
    {
//        \DB::table('emails')->truncate();
//        \DB::table('threads')->truncate();
//        \DB::table('conversations')->truncate();
//        \DB::table('customers')->truncate();
//        \DB::table('attachments')->truncate();

        $now = time();
        Option::set('fetch_emails_last_run', $now);

        $unprocessedEmails = MailgunIncomingEmail::query()->where('is_processed', false)->orderBy('created_at');
        $this->info("Start, messages being processed: {$unprocessedEmails->count()}");

        // Run
        $progressBar = $this->output->createProgressBar($unprocessedEmails->count());
        $progressBar->setFormat('debug');
        $progressBar->start();

        $unprocessedEmails->chunk(100, function ($mailgunEmails) use ($progressBar) {
            foreach ($mailgunEmails as $mailgunEmail) {

                try {
                    $this->processMailgunEmail($mailgunEmail);
                } catch (Throwable $e) {
                    $this->error($e->getMessage());
                }

                $mailgunEmail->update(['is_processed' => true, 'processed_at' => Carbon::now()]);
                $progressBar->advance();
            }
        });

        $progressBar->finish();
        $this->output->newLine();
        $this->info("Finished");

        Option::set('fetch_emails_last_successful_run', $now);

        // Middleware Terminate handler is not launched for commands,
        // so we need to run processing subscription events manually
        Subscription::processEvents();
    }

    private function processMailgunEmail(MailgunIncomingEmail $mailgunEmail)
    {
        $this->output->newLine();

        $messageId = $mailgunEmail->getMessageId();
        $recipient = $mailgunEmail->getRecipient();
        $from = $mailgunEmail->getFrom();

        $this->info("Message-Id: $messageId, for recipient: $recipient, from: $from");

        $mailbox = Mailbox::query()->where('email', $recipient)->first();
        if (!$mailbox) {
            $this->error('Mailbox not found');
            $mailgunEmail->update(['is_unknown_mailbox' => true, 'is_processed' => true, 'processed_at' => Carbon::now()]);
            return;
        }

        $this->processMessage($mailbox, $mailgunEmail);
    }

    public function processMessage(Mailbox $mailbox, MailgunIncomingEmail $mailgunEmail)
    {
        $from = Arr::first(mailparse_rfc822_parse_addresses($mailgunEmail->getFrom()));
        $from = Arr::get($from, 'address');

        $message_id = $mailgunEmail->getMessageId();

        // Detect prev thread
        $is_reply = false;
        $prev_thread = null;
        $user_id = null;
        $user = null; // for user reply only
        $message_from_customer = true;
        $in_reply_to = $mailgunEmail->getReplyTo();
        $references = $mailgunEmail->getReferences();
        $attachments = $mailgunEmail->getUploadedAttachments();
        $html_body = '';

        // Is it a bounce message
        $is_bounce = false;

        // Determine previous Message-ID
        $prev_message_id = '';
        if ($in_reply_to) {
            $prev_message_id = $in_reply_to;
        } elseif ($references) {
            if (!is_array($references)) {
                $references = array_filter(preg_split('/[, <>]/', $references));
            }
            // Find first non-empty reference
            if (is_array($references)) {
                foreach ($references as $reference) {
                    if (!empty(trim($reference))) {
                        $prev_message_id = trim($reference);
                        break;
                    }
                }
            }
        }

        // Some mail service providers change Message-ID of the outgoing email,
        // so we are passing Message-ID in marker in body.
        $reply_prefixes = [
            MailHelper::MESSAGE_ID_PREFIX_NOTIFICATION,
            MailHelper::MESSAGE_ID_PREFIX_REPLY_TO_CUSTOMER,
            MailHelper::MESSAGE_ID_PREFIX_AUTO_REPLY,
        ];

        // Try to get previous message ID from marker in body.
        if (!$prev_message_id || !preg_match('/^(' . implode('|', $reply_prefixes) . ')\-(\d+)\-/', $prev_message_id)) {
            $html_body = $mailgunEmail->getBodyHtml();
            $marker_message_id = MailHelper::fetchMessageMarkerValue($html_body);

            if ($marker_message_id) {
                $prev_message_id = $marker_message_id;
            }
        }

        // Bounce detection.
        $bounced_message_id = null;
//        if ($message->hasAttachments()) {
//            // Detect bounce by attachment.
//            // Check all attachments.
//            foreach ($attachments as $attachment) {
//                if (!empty(Attachment::$types[$attachment->getType()]) && Attachment::$types[$attachment->getType()] == Attachment::TYPE_MESSAGE
//                ) {
//                    if (
//                        // Checking the name will lead to mistakes if someone attaches a file with such name.
//                        // Dashes are converted to space.
//                        //in_array(strtoupper($attachment->getName()), ['RFC822', 'DELIVERY STATUS', 'DELIVERY STATUS NOTIFICATION', 'UNDELIVERED MESSAGE'])
//                    preg_match('/delivery-status/', strtolower($attachment->content_type))
//                        // 7.3.1 The Message/rfc822 (primary) subtype. A Content-Type of "message/rfc822" indicates that the body contains an encapsulated message, with the syntax of an RFC 822 message
//                        //|| $attachment->content_type == 'message/rfc822'
//                    ) {
//                        $is_bounce = true;
//
//                        $this->line('[' . date('Y-m-d H:i:s') . '] Bounce detected by attachment content-type: ' . $attachment->content_type);
//
//                        // Try to get Message-ID of the original email.
//                        if (!$bounced_message_id) {
//                            //print_r(MailHelper::parseHeaders($attachment->getContent()));
//                            $bounced_message_id = MailHelper::getHeader($attachment->getContent(), 'message_id');
//                        }
//                    }
//                }
//            }
//        }
        $message_header = $mailgunEmail->getHeader();

        // Check Content-Type header.
        if (!$is_bounce && $message_header) {
            if (MailHelper::detectBounceByHeaders($message_header)) {
                $is_bounce = true;
            }
        }
        // Check message's From field.
        if (!$is_bounce) {
            if ($from) {
                $original_from = $this->formatEmailList($from);
                $original_from = $original_from[0];
                $is_bounce = preg_match('/^mailer\-daemon@/i', $original_from);
                if ($is_bounce) {
                    $this->line('[' . date('Y-m-d H:i:s') . '] Bounce detected by From header: ' . $original_from);
                }
            }
        }
        // Check Return-Path header
        if (!$is_bounce && preg_match("/^Return\-Path: <>/i", $message_header)) {
            $this->line('[' . date('Y-m-d H:i:s') . '] Bounce detected by Return-Path header.');
            $is_bounce = true;
        }


        if ($is_bounce && !$bounced_message_id) {
//            foreach ($attachments as $attachment_msg) {
//                // 7.3.1 The Message/rfc822 (primary) subtype. A Content-Type of "message/rfc822" indicates that the body contains an encapsulated message, with the syntax of an RFC 822 message
//                if ($attachment_msg->content_type == 'message/rfc822') {
//                    $bounced_message_id = MailHelper::getHeader($attachment_msg->getContent(), 'message_id');
//                    if ($bounced_message_id) {
//                        break;
//                    }
//                }
//            }
        }

        // Is it a message from Customer or User replied to the notification
        preg_match('/^' . MailHelper::MESSAGE_ID_PREFIX_NOTIFICATION . "\-(\d+)\-(\d+)\-/", $prev_message_id, $m);

        if (!$is_bounce && !empty($m[1]) && !empty($m[2])) {
            // Reply from User to the notification
            $prev_thread = Thread::find($m[1]);
            $user_id = $m[2];
            $user = User::find($user_id);
            $message_from_customer = false;
            $is_reply = true;

            if (!$user) {
                $this->error('User not found: ' . $user_id);
                return;
            }
            $this->line('[' . date('Y-m-d H:i:s') . '] Message from: User');
        } else {
            // Message from Customer or User replied to his reply to notification
            $this->line('[' . date('Y-m-d H:i:s') . '] Message from: Customer');

            if (!$is_bounce) {
                if ($prev_message_id) {
                    $prev_thread_id = '';

                    // Customer replied to the email from user
                    preg_match('/^' . MailHelper::MESSAGE_ID_PREFIX_REPLY_TO_CUSTOMER . "\-(\d+)\-/", $prev_message_id, $m);
                    if (!empty($m[1])) {
                        $prev_thread_id = $m[1];
                    }

                    // Customer replied to the auto reply
                    if (!$prev_thread_id) {
                        preg_match('/^' . MailHelper::MESSAGE_ID_PREFIX_AUTO_REPLY . "\-(\d+)\-/", $prev_message_id, $m);
                        if (!empty($m[1])) {
                            $prev_thread_id = $m[1];
                        }
                    }

                    if ($prev_thread_id) {
                        $prev_thread = Thread::find($prev_thread_id);
                    } else {
                        // Customer replied to his own message
                        $prev_thread = Thread::where('message_id', $prev_message_id)->first();
                    }

                    // Reply from user to his reply to the notification
                    if (!$prev_thread
                        && ($prev_thread = Thread::where('message_id', $prev_message_id)->first())
                        && $prev_thread->created_by_user_id
                        && $prev_thread->created_by_user->hasEmail($from)
                    ) {
                        $user_id = $user->id;
                        $message_from_customer = false;
                        $is_reply = true;
                    }
                }
                if (!empty($prev_thread)) {
                    $is_reply = true;
                }
            }
        }

        // Make sure that prev_thread belongs to the current mailbox.
        // It may happen when forwarding conversation for example.
        if ($prev_thread) {
            if ($prev_thread->conversation->mailbox_id != $mailbox->id) {
                $prev_thread = null;
                $is_reply = false;
            }
        }

        // Get body
        if (!$html_body) {
            // Get body and do not replace :cid with images base64
            $html_body = $mailgunEmail->getBodyHtml();
        }
        if ($html_body) {
            $body = $this->separateReply($html_body, true, $is_reply);
        } else {
            $body = $mailgunEmail->getBodyPlain();
            $body = $this->separateReply($body, false, $is_reply);
        }

        $subject = $mailgunEmail->getSubject();

        // Convert subject encoding
        if (preg_match('/=\?[a-z\d-]+\?[BQ]\?.*\?=/i', $subject)) {
            $subject = iconv_mime_decode($subject, ICONV_MIME_DECODE_CONTINUE_ON_ERROR, 'UTF-8');
        }

        $to = $this->formatEmailList($mailgunEmail->getTo());
        $cc = $this->formatEmailList($mailgunEmail->getCc());
        $bcc = $this->formatEmailList($mailgunEmail->getBcc());

        // Create customers
        $emails = array_filter([
            $mailgunEmail->getFrom(),
            $mailgunEmail->getReplyTo(),
            $mailgunEmail->getTo(),
            $mailgunEmail->getCc(),
            $mailgunEmail->getBcc(),
        ]);

        $this->createCustomers($emails, $mailbox->getEmails());

        $data = \Eventy::filter('fetch_emails.data_to_save', [
            'mailbox'               => $mailbox,
            'message_id'            => $message_id,
            'prev_thread'           => $prev_thread,
            'from'                  => $from,
            'to'                    => $to,
            'cc'                    => $cc,
            'bcc'                   => $bcc,
            'subject'               => $subject,
            'body'                  => $body,
            'attachments'           => $attachments,
            'message'               => $mailgunEmail,
            'is_bounce'             => $is_bounce,
            'message_from_customer' => $message_from_customer,
            'user'                  => $user,
        ]);

        $new_thread = null;
        if ($message_from_customer) {
            if (\Eventy::filter('fetch_emails.should_save_thread', true, $data) !== false) {
                // SendAutoReply listener will check bounce flag and will not send an auto reply if this is an auto responder.
                $new_thread = $this->saveCustomerThread($mailbox, $data['message_id'], $data['prev_thread'], $data['from'], $data['to'], $data['cc'], $data['bcc'], $data['subject'], $data['body'], $data['attachments'], $data['message']->getHeader());
            } else {
                $this->line('[' . date('Y-m-d H:i:s') . '] Hook fetch_emails.should_save_thread returned false. Skipping message.');
                return;
            }
        } else {
            // Check if From is the same as user's email.
            // If not we send an email with information to the sender.
            if (!$user->hasEmail($from)) {
                $this->error("Sender address {$from} does not match " . $user->getFullName() . " user email: " . $user->email . ". Add " . $user->email . " to user's Alternate Emails in the users's profile to allow the user reply from this address.");

                // Send "Unable to process your update email" to user
                \App\Jobs\SendEmailReplyError::dispatch($from, $user, $mailbox)->onQueue('emails');

                return;
            }

            if (\Eventy::filter('fetch_emails.should_save_thread', true, $data) !== false) {
                $new_thread = $this->saveUserThread($data['mailbox'], $data['message_id'], $data['prev_thread'], $data['user'], $data['from'], $data['to'], $data['cc'], $data['bcc'], $data['body'], $data['attachments'], $data['message']->getHeader());
            } else {
                $this->line('[' . date('Y-m-d H:i:s') . '] Hook fetch_emails.should_save_thread returned false. Skipping message.');
                return;
            }
        }

        if ($new_thread) {
            $this->line('[' . date('Y-m-d H:i:s') . '] Thread successfully created: ' . $new_thread->id);

            // If it was a bounce message, save bounce data.
            if ($message_from_customer && $is_bounce) {
                $this->saveBounceData($new_thread, $bounced_message_id, $from);
            }
        } else {
            $this->error('Error occurred processing message');
        }
    }

    public function saveBounceData($new_thread, $bounced_message_id, $from)
    {
        // Try to find bounced thread by Message-ID.
        $bounced_thread = null;
        if ($bounced_message_id) {
            $prefixes = [
                MailHelper::MESSAGE_ID_PREFIX_REPLY_TO_CUSTOMER,
                MailHelper::MESSAGE_ID_PREFIX_AUTO_REPLY,
            ];
            preg_match('/^(' . implode('|', $prefixes) . ')\-(\d+)\-/', $bounced_message_id, $matches);
            if (!empty($matches[2])) {
                $bounced_thread = Thread::find($matches[2]);
            }
        }

        $status_data = [
            'is_bounce' => true,
        ];
        if ($bounced_thread) {
            $status_data['bounce_for_thread'] = $bounced_thread->id;
            $status_data['bounce_for_conversation'] = $bounced_thread->conversation_id;
        }

        $new_thread->updateSendStatusData($status_data);
        $new_thread->save();

        // Update status of the original message and create log record.
        if ($bounced_thread) {
            $bounced_thread->send_status = SendLog::STATUS_DELIVERY_ERROR;

            $status_data = [
                'bounced_by_thread'       => $new_thread->id,
                'bounced_by_conversation' => $new_thread->conversation_id,
                // todo.
                // 'bounce_info' => [
                // ]
            ];

            $bounced_thread->updateSendStatusData($status_data);
            $bounced_thread->save();

            // Bounces can be soft and hard, for now log both as STATUS_DELIVERY_ERROR.
            SendLog::log($bounced_thread->id, null, $from, SendLog::MAIL_TYPE_EMAIL_TO_CUSTOMER, SendLog::STATUS_DELIVERY_ERROR, $bounced_thread->created_by_customer_id, null, 'Message bounced');
        }
    }

    /**
     * Save email from customer as thread.
     */
    public function saveCustomerThread($mailbox, $message_id, $prev_thread, $from, $to, $cc, $bcc, $subject, $body, $attachments, $headers)
    {
        // Find conversation
        $new = false;
        $conversation = null;
        $prev_customer_id = null;
        $now = date('Y-m-d H:i:s');
        $conv_cc = $cc;

        // Customers are created before with email and name
        $customer = Customer::create($from);
        if ($prev_thread) {
            $conversation = $prev_thread->conversation;

            // If reply came from another customer: change customer, add original as CC.
            // If FreeScout will not change the customer, the reply will be shown
            // as coming from the original customer (not the real sender) and cause confusion.
            if ($conversation->customer_id != $customer->id) {
                $prev_customer_id = $conversation->customer_id;
                $prev_customer_email = $conversation->customer_email;

                // Do not add to CC emails from the original's BCC
                if (!in_array($conversation->customer_email, $conversation->getBccArray())) {
                    $conv_cc[] = $conversation->customer_email;
                }
                $conversation->customer_id = $customer->id;
            }
        } else {
            // Create conversation
            $new = true;

            $conversation = new Conversation();
            $conversation->type = Conversation::TYPE_EMAIL;
            $conversation->state = Conversation::STATE_PUBLISHED;
            $conversation->subject = $subject;
            $conversation->setPreview($body);
            $conversation->mailbox_id = $mailbox->id;
            $conversation->customer_id = $customer->id;
            $conversation->created_by_customer_id = $customer->id;
            $conversation->source_via = Conversation::PERSON_CUSTOMER;
            $conversation->source_type = Conversation::SOURCE_TYPE_EMAIL;
        }

        // Update has_attachments only if email has attachments AND conversation hasn't has_attachments already set
        // Prevent to set has_attachments value back to 0 if the new reply doesn't have any attachment
        if (!$conversation->has_attachments && count($attachments)) {
            $conversation->has_attachments = true;
        }

        // Save extra recipients to CC, but do not add the mailbox itself as a CC.
        $conversation->setCc(array_merge($conv_cc, array_diff($to, $mailbox->getEmails())));
        // BCC should keep BCC of the first email,
        // so we change BCC only if it contains emails.
        if ($bcc) {
            $conversation->setBcc($bcc);
        }
        $conversation->customer_email = $from;
        // Reply from customer makes conversation active
        $conversation->status = Conversation::STATUS_ACTIVE;
        $conversation->last_reply_at = $now;
        $conversation->last_reply_from = Conversation::PERSON_CUSTOMER;
        // Reply from customer to deleted conversation should undelete it.
        if ($conversation->state == Conversation::STATE_DELETED) {
            $conversation->state = Conversation::STATE_PUBLISHED;
        }
        // Set folder id
        $conversation->updateFolder();
        $conversation->save();

        // Thread
        $thread = new Thread();
        $thread->conversation_id = $conversation->id;
        $thread->user_id = $conversation->user_id;
        $thread->type = Thread::TYPE_CUSTOMER;
        $thread->status = $conversation->status;
        $thread->state = Thread::STATE_PUBLISHED;
        $thread->message_id = $message_id;
        $thread->headers = collect(json_decode($headers))->map(fn($item) => implode(': ', $item))->implode(PHP_EOL);;
        $thread->body = $body;
        $thread->from = $from;
        $thread->setTo($to);
        $thread->setCc($cc);
        $thread->setBcc($bcc);
        $thread->source_via = Thread::PERSON_CUSTOMER;
        $thread->source_type = Thread::SOURCE_TYPE_EMAIL;
        $thread->customer_id = $customer->id;
        $thread->created_by_customer_id = $customer->id;
        if ($new) {
            $thread->first = true;
        }
        $thread->save();

        $saved_attachments = $this->saveAttachments($attachments, $thread->id);
        if ($saved_attachments) {
            $thread->has_attachments = true;

            // After attachments saved to the disk we can replace cids in body (for PLAIN and HTML body)
            $thread->body = $this->replaceCidsWithAttachmentUrls($thread->body, $saved_attachments);

            $thread->save();
        }

        // Update conversation here if needed.
        if ($new) {
            $conversation = \Eventy::filter('conversation.created_by_customer', $conversation, $thread, $customer);
        } else {
            $conversation = \Eventy::filter('conversation.customer_replied', $conversation, $thread, $customer);
        }
        // save() will check if something in the model has changed. If it hasn't it won't run a db query.
        $conversation->save();

        // Update folders counters
        $conversation->mailbox->updateFoldersCounters();

        if ($new) {
            event(new CustomerCreatedConversation($conversation, $thread));
            \Eventy::action('conversation.created_by_customer', $conversation, $thread, $customer);
        } else {
            event(new CustomerReplied($conversation, $thread));
            \Eventy::action('conversation.customer_replied', $conversation, $thread, $customer);
        }

        // Conversation customer changed
        if ($prev_customer_id) {
            event(new ConversationCustomerChanged($conversation, $prev_customer_id, $prev_customer_email, null, $customer));
        }

        return $thread;
    }

    /**
     * Save email reply from user as thread.
     */
    public function saveUserThread($mailbox, $message_id, $prev_thread, $user, $from, $to, $cc, $bcc, $body, $attachments, $headers)
    {
        $conversation = null;
        $now = date('Y-m-d H:i:s');
        $user_id = $user->id;

        $conversation = $prev_thread->conversation;
        // Determine assignee
        // maybe we need to check mailbox->ticket_assignee here, maybe not
        if (!$conversation->user_id) {
            $conversation->user_id = $user_id;
        }

        // Save extra recipients to CC
        $conversation->setCc(array_merge($cc, $to));
        $conversation->setBcc($bcc);

        // Respect mailbox settings for "Status After Replying
        $prev_status = $conversation->status;
        $conversation->status = $mailbox->ticket_status;
        if ($conversation->status != $mailbox->ticket_status) {
            \Eventy::action('conversation.status_changed', $conversation, $user, true, $prev_status);
        }
        $conversation->last_reply_at = $now;
        $conversation->last_reply_from = Conversation::PERSON_USER;
        $conversation->user_updated_at = $now;
        // Set folder id
        $conversation->updateFolder();
        $conversation->save();

        // Update folders counters
        $conversation->mailbox->updateFoldersCounters();

        // Thread
        $thread = new Thread();
        $thread->conversation_id = $conversation->id;
        $thread->user_id = $conversation->user_id;
        $thread->type = Thread::TYPE_MESSAGE;
        $thread->status = $conversation->status;
        $thread->state = Thread::STATE_PUBLISHED;
        $thread->message_id = $message_id;
        $thread->headers = collect(json_decode($headers))->map(fn($item) => implode(': ', $item))->implode(PHP_EOL);;
        $thread->body = $body;
        $thread->from = $from;
        // To must be customer's email
        $thread->setTo([$conversation->customer_email]);
        $thread->setCc($cc);
        $thread->setBcc($bcc);
        $thread->source_via = Thread::PERSON_USER;
        $thread->source_type = Thread::SOURCE_TYPE_EMAIL;
        $thread->customer_id = $conversation->customer_id;
        $thread->created_by_user_id = $user_id;
        $thread->save();

        $saved_attachments = $this->saveAttachments($attachments, $thread->id);
        if ($saved_attachments) {
            $thread->has_attachments = true;

            // After attachments saved to the disk we can replace cids in body (for PLAIN and HTML body)
            $thread->body = $this->replaceCidsWithAttachmentUrls($thread->body, $saved_attachments);

            $thread->save();
        }

        event(new UserReplied($conversation, $thread));
        \Eventy::action('conversation.user_replied', $conversation, $thread);

        return $thread;
    }

    /**
     * Save attachments from email.
     *
     * @param array $attachments
     * @param int $thread_id
     *
     * @return bool
     */
    public function saveAttachments($email_attachments, $thread_id)
    {
        $created_attachments = [];
        foreach ($email_attachments as $email_attachment) {
            $created_attachment = Attachment::create(
                $email_attachment['name'],
                Storage::disk('s3')->mimeType($email_attachment['path']),
                false,
                Storage::disk('s3')->get($email_attachment['path']),
                '',
                false,
                $thread_id
            );
            if ($created_attachment) {
                $created_attachments[] = [
                    'imap_attachment' => $email_attachment,
                    'attachment'      => $created_attachment,
                ];

                // remove tmp attachment from disk
                Storage::disk('s3')->delete($email_attachment['path']);
            }
        }

        return $created_attachments;
    }

    /**
     * Separate reply in the body.
     *
     * @param string $body
     *
     * @return string
     */
    public function separateReply($body, $is_html, $is_reply)
    {
        $cmp_reply_length_desc = function ($a, $b) {
            if (mb_strlen($a) == mb_strlen($b)) {
                return 0;
            }

            return (mb_strlen($a) < mb_strlen($b)) ? -1 : 1;
        };

        $result = '';

        if ($is_html) {
            // Extract body content from HTML
            // Split by <html>
            $htmls = [];
            preg_match_all("/<html[^>]*>(.*?)<\/html>/is", $body, $htmls);

            if (empty($htmls[0])) {
                $htmls[0] = [$body];
            }
            foreach ($htmls[0] as $html) {
                // One body.
                $dom = new \DOMDocument();
                libxml_use_internal_errors(true);
                $dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
                libxml_use_internal_errors(false);
                $bodies = $dom->getElementsByTagName('body');
                if ($bodies->length == 1) {
                    $body_el = $bodies->item(0);
                    $html = $dom->saveHTML($body_el);
                }
                preg_match("/<body[^>]*>(.*?)<\/body>/is", $html, $matches);
                if (count($matches)) {
                    $result .= $matches[1];
                }
            }
            if (!$result) {
                $result = $body;
            }
        } else {
            $result = nl2br($body);
        }

        // This is reply, we need to separate reply text from old text
        if ($is_reply) {
            // Check all separators and choose the shortest reply
            $reply_bodies = [];
            $reply_separators = MailHelper::$alternative_reply_separators;

            if (!empty($this->mailbox->before_reply)) {
                $reply_separators[] = $this->mailbox->before_reply;
            }

            foreach ($reply_separators as $reply_separator) {
                if (\Str::startsWith($reply_separator, 'regex:')) {
                    $regex = preg_replace("/^regex:/", '', $reply_separator);
                    $parts = preg_split($regex, $result);
                } else {
                    $parts = explode($reply_separator, $result);
                }
                if (count($parts) > 1) {
                    // Check if past contains any real text.
                    $text = \Helper::htmlToText($parts[0]);
                    $text = trim($text);
                    $text = preg_replace('/^\s+/mu', '', $text);

                    if ($text) {
                        $reply_bodies[] = $parts[0];
                    }
                }
            }
            if (count($reply_bodies)) {
                usort($reply_bodies, $cmp_reply_length_desc);

                return $reply_bodies[0];
            }
        }

        return $result;
    }

    public function replaceCidsWithAttachmentUrls($body, $attachments)
    {
//        foreach ($attachments as $attachment) {
//            if ($attachment['imap_attachment']->id && (isset($attachment['imap_attachment']->img_src) || strlen($attachment['imap_attachment']->content ?? ''))) {
//                $body = str_replace('cid:' . $attachment['imap_attachment']->id, $attachment['attachment']->url(), $body);
//            }
//        }

        return $body;
    }

    /**
     * Convert email object to plain emails.
     *
     * @param $obj_list
     *
     * @return array
     */
    public function formatEmailList($obj_list): array
    {
        if (!is_array($obj_list)) $obj_list = [$obj_list];

        foreach ($obj_list as &$item) {
            $item = Email::sanitizeEmail($item);
        }

        return $obj_list;
    }

    /**
     * Create customers from emails.
     *
     * @param $emails
     * @param $exclude_emails
     */
    public function createCustomers($emails, $exclude_emails)
    {
        foreach ($emails as $item) {
            $item = Arr::first(mailparse_rfc822_parse_addresses($item));

            $name_parts = explode(' ', Arr::get($item, 'display'), 2);
            $data = ['first_name' => Arr::get($name_parts, 0), 'last_name' => Arr::get($name_parts, 1)];

            Customer::create(Arr::get($item, 'address'), $data);
        }
    }
}
