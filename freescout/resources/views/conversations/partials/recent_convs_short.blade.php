<div class="conv-sidebar-block recentConversationBlock">
    <div class="panel-group accordion accordion-empty">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a class="collapse-btn" href=".collapse-conv-recent">{{ __("Recent Conversations") }} 
                        <b class=" caret"></b>
                    </a>
                </h4>
            </div>
            <div class="collapse-conv-recent panel-collapse collapse in">
                <div class="panel-body">
                    <div class="sidebar-block-header2"><strong>{{ __("Recent Conversations") }}</strong> (<a data-toggle="collapse" href=".collapse-conv-recent">{{ __('close') }}</a>)</div>
                    <ul class="sidebar-block-list">
                        @foreach ($recent_conversations as $recent_conversation)
                            <li>
                                <a href="{{ $recent_conversation->url() }}" target="_blank" class="help-link"><i class="glyphicon @if ($recent_conversation->isPhone()) glyphicon-earphone @else glyphicon-envelope @endif"></i>{{ $recent_conversation->getSubject() }}</a>
                            </li>
                        @endforeach
                    </ul>
                    @if ($recent_conversations->hasMorePages())
                        <a href="{{ route('customers.conversations', ['id' => $customer->id, 'mailbox_id' => $recent_conversation->mailbox_id, 'type' => 'recent'])}}" class="sidebar-block-link link-blue" target="_parent">{{ __("Show more :number", ['number' => $recent_conversations->total()]) }}</a>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>