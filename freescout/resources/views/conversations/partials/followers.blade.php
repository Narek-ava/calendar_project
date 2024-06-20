
<div class="conv-sidebar-block followConversationBlock">
    <div class="panel-group accordion accordion-empty">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a class="collapse-btn" href=".collapse-conv-follow">{{ __("Followers") }} 
                        <b class="caret"></b>
                    </a>
                </h4>
            </div>
            <div class="collapse-conv-follow panel-collapse collapse in">
                <div class="panel-body">
                    <div class="sidebar-block-header2"><strong>{{ __("Followers") }}</strong> (<a data-toggle="collapse" href=".collapse-conv-follow">{{ __('close') }}</a>)</div>
                    <ul class="sidebar-block-list">
                        @foreach ($followers as $follower)
                            <li>
                                <a class="help-link"><i class="glyphicon glyphicon-bell"></i>{{$follower->user->first_name . ' ' . $follower->user->last_name}}</a>
                            </li> 
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

