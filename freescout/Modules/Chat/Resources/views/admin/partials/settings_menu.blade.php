<li @if (Route::is('chat.settings'))class="active"@endif><a href="{{ route('chat.settings', ['mailbox_id'=>$mailbox->id]) }}"><i class="glyphicon glyphicon-modal-window"></i> {{ __('Chat') }}</a></li>