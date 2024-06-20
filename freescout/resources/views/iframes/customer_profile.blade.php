<div id="customerInfo">
<div class="conv-customer-header custHeaderBlock"></div>
<div class="convCustomerBlock">
    <div class="conv-customer-block conv-sidebar-block convSidebarBlock">
        @include('customers/profile_snippet', ['customer' => $customer, 'main_email' => $conversation->customer_email, 'conversation' => $conversation])
        <div class="dropdown customer-trigger" data-toggle="tooltip" title="{{ __("Settings") }}" data-placement="bottom">
            <a href="javascript:void(0)" class="dropdown-toggle glyphicon glyphicon-cog" data-toggle="dropdown" ></a>
            <ul class="dropdown-menu dropdown-menu-right customerSettings" role="menu">
                <li role="presentation"><a href="{{ route('customers.update', ['id' => $customer->id]) }}" tabindex="-1" role="menuitem">{{ __("Edit Profile") }}</a></li>
                @if (!$conversation->isChat())
                    <li role="presentation"><a href="#" onclick="changeCustomer()" >{{ __("Change Customer") }}</a></li>
                @endif
                {{ \Eventy::action('conversation.customer.menu', $customer, $conversation) }}
                {{-- {{ \Eventy::action('customer_profile.menu', $customer, $conversation) }} --}}
            </ul>
        </div>
    </div>
    @if (count($recent_conversations))
        @include('conversations/partials/recent_convs_short')
    @endif
    @if (count($appointments))
        @include('conversations/partials/upcoming_appointments')
    @endif
    @if (count($prev_conversations))
        @include('conversations/partials/prev_convs_short') 
    @endif
    @if (count($followers))
        @include('conversations/partials/followers')
    @endif
</div>
</div>