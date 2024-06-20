@if (count($conversations))

    @php
        $conversations = \Eventy::filter('conversations_table.preload_table_data', $conversations);
    @endphp

    @foreach ($conversations as $simpleConversation)
        <div class="cb-row @if($simpleConversation->id === $conversation->id) active @endif"
             data-conversation-id="{{ $simpleConversation->id }}">

             <!-- Star -->
            <div class="cb-sub-row">
                <div class="cb-star">
                    <i class="glyphicon conv-star @if ($simpleConversation->isStarredByUser()) glyphicon-star @else glyphicon-star-empty @endif"
                       title="@if ($simpleConversation->isStarredByUser()){{ __("Unstar Conversation") }}@else{{ __("Star Conversation") }}@endif"></i>
                </div>

                <!-- Sender name -->
                <div class="cb-customer">
                    @if ($simpleConversation->customer_id && $simpleConversation->customer)
                        <span class="cb-customer__name">{{ $simpleConversation->customer->getFullName(true)}}</span>
                    @endif
                    @if ($simpleConversation->threads_count > 1)
                        <span class="cb-counter">{{ $simpleConversation->threads_count }}</span>
                    @endif
                    </div>
                    
                    <!-- Datetime -->
                    <div class="cb-date" data-toggle="tooltip" data-html="true" data-placement="left"
                        title="{{ $simpleConversation->getDateTitle() }}">
                        {{ $simpleConversation->getWaitingSince($folder) }}
                    </div>
                    </div>

                    <!-- Channel name -->
                    <div class="cb-sub-row">
                    <!-- Attachment indicator -->
                    @if ($simpleConversation->has_attachments)
                        <div class="cb-attachment-indicator">
                            <i class="conv-attachment-mobile glyphicon glyphicon-paperclip"></i>
                    </div>
                    @endif

                    <!-- Subject -->
                    <div class="cb-subject">
                        @if ($simpleConversation->isPhone())
                            <i class="glyphicon glyphicon-earphone"></i>
                        @endif
                        {{ $simpleConversation->getSubject() }}
                </div>

                <!-- Preview -->
                <div class="cb-preview">
                    {{ $simpleConversation->preview }}
                </div>
            </div>
    
            <div class="cb-sub-row">
                <div class="cb-channel-name">
                    @if ($simpleConversation->isChat() && $simpleConversation->getChannelName())
                        <span class="fs-tag">
                        <span class="fs-tag-name">{{ $simpleConversation->getChannelName() }}</span>
                    </span>
                    @endif
                </div>

            <!-- Custom tags or another modules actions -->
            <div class="cb-conversation-action">
                @action('conversations_table.before_subject', $simpleConversation)
                @action('conversations_table.after_subject', $simpleConversation)
            </div>
            </div>
        </div>
        @endforeach
        
@endif
