<?php

namespace Modules\GlobalMailbox\Http\Controllers;

use App\Conversation;
use App\Customer;
use App\Folder;
use App\Mailbox;
use App\Thread;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;

class GlobalMailboxController extends Controller
{
    const PREV_CONVERSATIONS_LIMIT = 5;

    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * View mailbox.
     */
    public static function view($request_folder_type_id = null, $conversation, $isRequestAjax = null)
    {
        $user = auth()->user();

        $conversations = [];
        
        $folders_data = \GlobalMailbox::getFolders($user, $request_folder_type_id);

        $folders = $folders_data['folders'];
        $folder = $folders_data['folder'];
        $mailboxes = $folders_data['mailboxes'];

        \GlobalMailbox::$folders = $folders;

        $query_conversations = \GlobalMailbox::getConversationsQuery($folder, $user, $mailboxes->pluck('id'));
        $conversations = $folder->queryAddOrderBy($query_conversations)->paginate(Conversation::DEFAULT_LIST_SIZE);

        $mailbox = new Mailbox();
        $mailbox->id = \GlobalMailbox::MAILBOX_ID;
        $mailbox->name = __('Global Mailbox');

        if (($conversations->first() || $conversation) && !in_array($folder->type, [Folder::TYPE_DRAFTS, Folder::TYPE_STARRED])) {
            $lastVisitedConversation = $folder->id == session()->get('global_mailbox_folder_id')
                    ? $folder->queryAddOrderBy($query_conversations)->find(session()->get('conversation_id'))
                    : $conversations->first();
            $viewDetails = GlobalMailboxController::getViewDetails($conversations, $conversation ?? $lastVisitedConversation ?? $conversations->first(), $mailbox, $folders, $folder, $isRequestAjax);
            return view($viewDetails['template'], $viewDetails); 
        }
        return view('mailboxes/view', [
            'mailbox'       => $mailbox,
            'folders'       => $folders,
            'folder'        => $folder,
            'conversations' => $conversations,
            'params'        => [
                'show_mailbox' => true,
                'target_blank' => true,
            ],
        ]);
    }

    public static function getViewDetails($conversations, $conversation, $mailbox, $folders, $folder, $isRequestAjax)
    {
        $customer = $conversation->customer_cached;
        $user = auth()->user();

        // To let other parts of the app easily access.
        \Helper::setGlobalEntity('conversation', $conversation);
        \Helper::setGlobalEntity('mailbox', $mailbox);

        if ($user->isAdmin()) {
            $mailbox->fetchUserSettings($user->id);
        }

        // Mark notifications as read
        $mark_read_result = $user->unreadNotifications()->where('data', 'like', '%"conversation_id":'.$conversation->id.'%')->update(['read_at' => now()]);
        if ($mark_read_result) {
            $user->clearWebsiteNotificationsCache();
        }

        $after_send = $user->mailboxSettings($conversation->mailbox_id)->after_send;

        // Detect customers and emails to which user can reply
        $to_customers = [];
        // Add all customer emails
        $customer_emails = [];
        $distinct_emails = [];

        // Add emails of customers from whom there were replies in the conversation
        $prev_customers_emails = [];
        if ($conversation->customer_email) {
            $prev_customers_emails = Thread::select('from', 'customer_id')
                ->where('conversation_id', $conversation->id)
                ->where('type', Thread::TYPE_CUSTOMER)
                ->where('from', '<>', $conversation->customer_email)
                ->groupBy(['from', 'customer_id'])
                ->get();
        }

        foreach ($prev_customers_emails as $prev_customer) {
            if (!in_array($prev_customer->from, $distinct_emails) && $prev_customer->customer && $prev_customer->from) {
                $to_customers[] = [
                    'customer' => $prev_customer->customer,
                    'email'    => $prev_customer->from,
                ];
                $distinct_emails[] = $prev_customer->from;
            }
        }

        // Add customer email(s) if there more than one or if there are other emails in threads.
        if ($customer) {
            $customer_emails = $customer->emails;
        }
        if (count($customer_emails) > 1 || count($to_customers)) {
            foreach ($customer_emails as $customer_email) {
                $to_customers[] = [
                    'customer' => $customer,
                    'email'    => $customer_email->email,
                ];
                $distinct_emails[] = $customer_email->email;
            }
        }

        // To (for new conversation draft only).
        $to = [];
        $emails = Conversation::sanitizeEmails($conversation->customer_email);
        // Get customers info for emails.
        if (count($emails)) {
            $to = Customer::emailsToCustomers($emails);
        }

        // Exclude mailbox emails from $to_customers.
        $mailbox_emails = $mailbox->getEmails();
        foreach ($to_customers as $key => $to_customer) {
            if (in_array($to_customer['email'], $mailbox_emails)) {
                unset($to_customers[$key]);
            }
        }

        // Previous conversations
        $prev_conversations = [];
        if ($customer) {
            $prev_conversations = $mailbox->conversations()
                                    ->where('customer_id', $customer->id)
                                    ->where('id', '<>', $conversation->id)
                                    ->where('status', '!=', Conversation::STATUS_SPAM)
                                    ->where('state', Conversation::STATE_PUBLISHED)
                                    ->orderBy('created_at', 'desc')
                                    ->paginate(self::PREV_CONVERSATIONS_LIMIT);
        }

        $template = 'conversations/view';
        if ($conversation->state == Conversation::STATE_DRAFT) {
            $template = 'conversations/create';
        }

        $exclude_array = $conversation->getExcludeArray($mailbox);

        // Get data for creating a phone conversation.
        $name = [];
        $phone = '';
        $to_email = [];
        if ($customer) {
            if ($customer->getFullName()) {
                $name = [$customer->id => $customer->getFullName()];
            }
            $last_phone = array_last($customer->getPhones());
            if (!empty($last_phone)) {
                $phone = $last_phone['value'];
            }

            if ($conversation->customer_email) {
                $customer_email = $conversation->customer_email;
            } else {
                $customer_email = $customer->getMainEmail();
            }
            if ($customer_email) {
                $to_email = [$customer_email];
            }
        }

        \App\Events\RealtimeConvView::dispatchSelf($conversation->id, $user, false);

        // Get viewers.
        $viewers = [];
        $conv_view = \Cache::get('conv_view');
        if ($conv_view && !empty($conv_view[$conversation->id])) {
            $viewing_users = User::whereIn('id', array_keys($conv_view[$conversation->id]))->get();
            foreach ($viewing_users as $viewer) {
                if (isset($conv_view[$conversation->id][$viewer->id]['r']) && $viewer->id != $user->id) {
                    $viewers[] = [
                        'user'     => $viewer,
                        'replying' => (int)$conv_view[$conversation->id][$viewer->id]['r']
                    ];
                }
            }
            // Show replying first.
            usort($viewers, function($a, $b) {
                return $b['replying'] <=> $a['replying'];
            });
        }

        $is_following = $conversation->isUserFollowing($user->id);

        \Eventy::action('conversation.view.start', $conversation);

        if ($isRequestAjax) $template = 'conversations/partials/conversation';

        return [
            'conversation'       => $conversation,
            'mailbox'            => $mailbox,
            'customer'           => $customer,
            'threads'            => $conversation->threads()->orderBy('created_at', 'desc')->get(),
            'folder'             => $folder,
            'folders'            => $folders,
            'after_send'         => $after_send,
            'to'                 => $to,
            'to_customers'       => $to_customers,
            'prev_conversations' => $prev_conversations,
            'cc'                 => $conversation->getCcArray($exclude_array),
            'bcc'                => [],
            'name'               => $name,
            'phone'              => $phone,
            'to_email'           => $to_email,
            'viewers'            => $viewers,
            'is_following'       => $is_following,
            'conversations'      => $conversations,
            'template'           => $template
        ];
    }
    
}
