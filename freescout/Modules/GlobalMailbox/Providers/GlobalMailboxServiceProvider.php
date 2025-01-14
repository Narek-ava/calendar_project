<?php

namespace Modules\GlobalMailbox\Providers;

use App\Conversation;
use App\ConversationFolder;
use App\Folder;
use App\Mailbox;
use App\User;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Factory;

class GlobalMailboxServiceProvider extends ServiceProvider
{
    const MAILBOX_ID = -100;

    const FOLDER_INBOX = -100;
    const FOLDER_SENT = -200;

    public static $folder_types = [
        self::FOLDER_INBOX,
        //self::FOLDER_SENT,
    ];

    // Store folders for quick access.
    public static $folders = [];

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
    public function boot()
    {
        $this->registerConfig();
        $this->registerViews();
        $this->registerFactories();
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
        $this->hooks();
    }

    /**
     * Module hooks.
     */
    public function hooks()
    {
         \Eventy::addFilter('folder.type_icon', function($icon, $folder) {
             if ($folder->type == self::FOLDER_INBOX) {
                 return 'cloud';
             }
             if ($folder->type == self::FOLDER_SENT) {
                 return 'send';
             }

             return $icon;
         }, 20, 2);

        \Eventy::addFilter('folder.type_name', function($name, $folder) {
             if ($folder->type == self::FOLDER_INBOX) {
                 return __('All');
             }
             if ($folder->type == self::FOLDER_SENT) {
                 return __('Sent');
             }

            return $name;
        }, 20, 2);

        \Eventy::addFilter('mailbox.show_buttons', function($show, $mailbox) {
            if ($mailbox->id == self::MAILBOX_ID) {
                return false;
            }

            return $show;
        }, 20, 2);

        \Eventy::addFilter('folder.url', function($url, $mailbox_id, $folder) {

            if ($mailbox_id == self::MAILBOX_ID) {
                return route('globalmailbox.view.folder', ['folder_id'=>$folder->id]);
            }

            return $url;
        }, 20, 3);

        \Eventy::addFilter('mailbox.url', function($url, $mailbox) {

            if ($mailbox->id == self::MAILBOX_ID) {
                return route('globalmailbox.view.folder', ['folder_id'=>Folder::TYPE_UNASSIGNED]);
            }

            return $url;
        }, 20, 2);

        \Eventy::addFilter('folder.active_count_mine_folder', function($mine_folder, $folder, $folders) {

            if (!$mine_folder) {
                if (!$folder->mailbox_id && self::$folders) {
                    // Count all mailboxes.
                    $mine_folder = self::$folders->filter(function ($item) {
                        return $item->type == Folder::TYPE_MINE;
                    })->first();

                    if ($mine_folder) {
                        return $mine_folder;
                    }
                }
            }

            return $mine_folder;
        }, 20, 3);

        \Eventy::addFilter('folder.conversations_query', function($query_conversations, $folder, $user_id) {

            if (request()->mailbox_id && request()->mailbox_id == self::MAILBOX_ID) {
                // Substitute folder type.
                $folder->type = request()->folder_id;
                return self::getConversationsQuery($folder, $user_id);
            }

            return $query_conversations;
        }, 20, 3);

        \Eventy::addFilter('conversations.ajax_pagination_folder', function($folder, $request, $response, $user) {

            if ($request->mailbox_id == self::MAILBOX_ID) {
                $folder = new Folder();
                $folder->type = $request->folder_id;
                // Set any available mailbox.
                $folder->mailbox_id = $user->mailboxesIdsCanView()[0] ?? null;
            }

            return $folder;
        }, 20, 4);

        \Eventy::addFilter('folder.conversations_order_by', function($order_by, $folder_type) {

            if (in_array($folder_type, self::$folder_types)) {
                $order_by[] = ['last_reply_at' => 'desc'];
            }

            return $order_by;
        }, 20, 2);

        \Eventy::addFilter('dashboard.mailboxes', function($mailboxes) {

            if (count($mailboxes) <= 1 && !auth()->user()->isAdmin()) {
                return $mailboxes;
            }

            $mailbox = self::getGlobalMailbox();

            $mailboxes->prepend($mailbox);

            return $mailboxes;
        });

        \Eventy::addFilter('mailbox.main_folders', function($main_folders, $mailbox) {
            if (!$main_folders && $mailbox->id == self::MAILBOX_ID) {
                $main_folders = self::getFolders()['folders'];

                foreach ($main_folders as $i => $main_folder) {
                    if (!in_array($main_folder->type, [Folder::TYPE_UNASSIGNED, Folder::TYPE_ASSIGNED, Folder::TYPE_DRAFTS, Folder::TYPE_MINE, Folder::TYPE_STARRED])) {
                        $main_folders->forget($i);
                    }
                }

                return $main_folders->sortBy('type');
            }

            return $main_folders;
        }, 20, 2);

        \Eventy::addFilter('conversations_table.column_title_date', function($title, $folder) {
            if ($folder->type == self::FOLDER_INBOX) {
                return __('Last Updated');
            }

            return $title;
        }, 20, 2);

        \Eventy::addFilter('menu.mailboxes', function($mailboxes) {
            if (count($mailboxes) <= 1 && !auth()->user()->isAdmin()) {
                return $mailboxes;
            }
            $mailbox = self::getGlobalMailbox();

            $mailboxes->prepend($mailbox);

            return $mailboxes;
        });
    }

    public static function getGlobalMailbox()
    {
        $mailbox = new Mailbox();

        $mailbox->id = self::MAILBOX_ID;
        $mailbox->name = __('Global Mailbox');
        $mailbox->in_protocol = Mailbox::IN_PROTOCOL_IMAP;
        $mailbox->in_port = 143;
        $mailbox->in_server = 'dummy';
        $mailbox->in_username = 'dummy';
        $mailbox->in_password = 'dummy';
        $mailbox->out_server = 'dummy';

        return $mailbox;
    }

    public static function getFolders($user = null, $request_folder_type_id = null)
    {
        $folders = [];

        if (!$user) {
            $user = auth()->user();
        }

        // Get all available mailboxes.
        $mailboxes = $user->mailboxesCanView();

        $folders_structure = [];
        $folders_structure = array_merge($folders_structure, array_keys(Folder::$types));
        $folders_structure[] = \GlobalMailbox::FOLDER_INBOX;

        $folder = null;

        // By default we display Inbox folder
        if (empty($request_folder_type_id)) {
            $request_folder_type_id = \GlobalMailbox::FOLDER_INBOX;
        }

        if (!in_array($request_folder_type_id, $folders_structure)) {
            abort(404);
        }

        foreach ($mailboxes as $mailbox) {

            $mailbox_folders = $mailbox->getAssesibleFolders();

            foreach ($folders_structure as $folders_type_id) {
                if (!isset($folders[$folders_type_id])) {
                    $folders[$folders_type_id] = new Folder();
                }
                // Get folder by type
                $folder_existing = $mailbox_folders->filter(function ($item) use ($folders_type_id) {
                    return $item->type == $folders_type_id;
                })->first();

                if (!$folder_existing) {
                    $folders[$folders_type_id]->id = $folders_type_id;
                } else {
                    $folders[$folders_type_id]->id = $folder_existing->type;
                }
                $folders[$folders_type_id]->type = $folders_type_id;

                // Counters.
                switch ($folders_type_id) {
                    
                    case \GlobalMailbox::FOLDER_INBOX:
                    case \GlobalMailbox::FOLDER_SENT:
                        // Do nothing.
                        if (!isset($folders[\GlobalMailbox::FOLDER_INBOX])) {
                            $folders[\GlobalMailbox::FOLDER_INBOX] = new Folder();
                        }
                        break;

                    case Folder::TYPE_UNASSIGNED:
                    case Folder::TYPE_ASSIGNED:
                        if ($folder_existing) {
                            $folders[$folders_type_id]->active_count += $folder_existing->active_count;
                            $folders[$folders_type_id]->total_count += $folder_existing->total_count;

                            // Add to Inbox.
                            // if (!isset($folders[\GlobalMailbox::FOLDER_INBOX])) {
                            //     $folders[\GlobalMailbox::FOLDER_INBOX] = new Folder();
                            // }
                            // $folders[\GlobalMailbox::FOLDER_INBOX]->active_count += $folder_existing->active_count;
                            // $folders[\GlobalMailbox::FOLDER_INBOX]->total_count += $folder_existing->total_count;
                        }
                        break;

                    default:
                        if ($folder_existing) {
                            $folders[$folders_type_id]->active_count += $folder_existing->active_count;
                            $folders[$folders_type_id]->total_count += $folder_existing->total_count;
                        }
                        break;
                }

                if ($request_folder_type_id == $folders_type_id) {
                    $folder = $folders[$folders_type_id];
                }
            }
        }

        return [
            'folders' => collect($folders),
            'folder' => $folder,
            'mailboxes' => $mailboxes,
        ];
    }

    public static function getConversationsQuery($folder, $user, $mailbox_ids = [], $q = null, $conversationId = null)
    {
        if (is_int($user)) {
            $user = User::find($user);
        }
        if (empty($mailbox_ids)) {
            $mailbox_ids = $user->mailboxesIdsCanView();
        }
        if ($folder->type == self::FOLDER_INBOX) {
            // Inbox.
            $query_conversations = Conversation::whereIn('mailbox_id', $mailbox_ids)
                ->where('state', Conversation::STATE_PUBLISHED);

        //} elseif ($folder->type == self::FOLDER_SENT) {


        } elseif ($folder->type == Folder::TYPE_MINE) {
            // Get conversations from personal folder
            $query_conversations = Conversation::where('user_id', $user->id)
                ->whereIn('status', [Conversation::STATUS_ACTIVE, Conversation::STATUS_PENDING])
                ->where('state', Conversation::STATE_PUBLISHED);

        } elseif ($folder->type == Folder::TYPE_ASSIGNED) {

            // Assigned - do not show my conversations
            $query_conversations = 
                // This condition also removes from result records with user_id = null
                Conversation::whereIn('mailbox_id', $mailbox_ids)
                ->where('user_id', '<>', $user->id)
                ->where('state', Conversation::STATE_PUBLISHED);

        } elseif ($folder->type == Folder::TYPE_STARRED) {
            $starred_conversation_ids = ConversationFolder::join('folders', 'conversation_folder.folder_id', '=', 'folders.id')
                        ->whereIn('folders.mailbox_id', $mailbox_ids)
                        ->where('folders.user_id', $user->id)
                        ->where('folders.type', Folder::TYPE_STARRED)
                        ->pluck('conversation_folder.conversation_id');
            $query_conversations = Conversation::whereIn('id', $starred_conversation_ids);

        } elseif ($folder->isIndirect()) {

            // Conversations are connected to folder via conversation_folder table.
            $query_conversations = Conversation::select('conversations.*')
                ->join('conversation_folder', 'conversations.id', '=', 'conversation_folder.conversation_id')
                ->join('folders', 'conversation_folder.folder_id', '=', 'folders.id')
                ->whereIn('folders.mailbox_id', $mailbox_ids)
                ->where('folders.type', $folder->type);

            if ($folder->type != Folder::TYPE_DRAFTS) {
                $query_conversations->where('state', Conversation::STATE_PUBLISHED);
            }

        } elseif ($folder->type == Folder::TYPE_DELETED) {
            $query_conversations = Conversation::whereIn('mailbox_id', $mailbox_ids)
                ->where('state', Conversation::STATE_DELETED);

        } else {
            // Get all folders of this type.
            $folder_ids = Folder::whereIn('mailbox_id', $mailbox_ids)
                ->where('type', $folder->type)
                ->pluck('id');
            $query_conversations = Conversation::whereIn('folder_id', $folder_ids)
                ->where('state', Conversation::STATE_PUBLISHED);
        }
        if ($q) {
            $conversations = self::getConversationsIdDuringSearch($q);
            $query_conversations = $query_conversations
                ->whereIn('conversations.id', $conversations);
        }
        if ($conversationId) {
            $query_conversations->where('id', $conversationId);
        }
        return $query_conversations;
    }

    public static function getConversationsIdDuringSearch(string $q)
    {
        $like = '%'.mb_strtolower($q).'%';
        return Conversation::where('conversations.subject', 'ilike', $like)
            ->orWhere('conversations.customer_email', 'ilike', $like)
            ->orWhere('conversations.number', (int)$q)
            ->orWhere('conversations.id', (int)$q)
            ->leftJoin('threads', 'conversations.id', '=', 'threads.conversation_id')
            ->where('threads.body', 'ilike', $like)
            ->orWhere('threads.from', 'ilike', $like)
            ->orWhere('threads.to', 'ilike', $like)
            ->orWhere('threads.cc', 'ilike', $like)
            ->orWhere('threads.bcc', 'ilike', $like)
            ->groupBy('conversations.id')
            ->pluck('conversations.id');
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->registerTranslations();
    }

    /**
     * Register config.
     *
     * @return void
     */
    protected function registerConfig()
    {
        $this->publishes([
            __DIR__.'/../Config/config.php' => config_path('globalmailbox.php'),
        ], 'config');
        $this->mergeConfigFrom(
            __DIR__.'/../Config/config.php', 'globalmailbox'
        );
    }

    /**
     * Register views.
     *
     * @return void
     */
    public function registerViews()
    {
        $viewPath = resource_path('views/modules/globalmailbox');

        $sourcePath = __DIR__.'/../Resources/views';

        $this->publishes([
            $sourcePath => $viewPath
        ],'views');

        $this->loadViewsFrom(array_merge(array_map(function ($path) {
            return $path . '/modules/globalmailbox';
        }, \Config::get('view.paths')), [$sourcePath]), 'globalmailbox');
    }

    /**
     * Register translations.
     *
     * @return void
     */
    public function registerTranslations()
    {
        $this->loadJsonTranslationsFrom(__DIR__ .'/../Resources/lang');
    }

    /**
     * Register an additional directory of factories.
     * @source https://github.com/sebastiaanluca/laravel-resource-flow/blob/develop/src/Modules/ModuleServiceProvider.php#L66
     */
    public function registerFactories()
    {
        if (! app()->environment('production')) {
            app(Factory::class)->load(__DIR__ . '/../Database/factories');
        }
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [];
    }
}
