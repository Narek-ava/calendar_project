<td>
    @if ($person)
        {{ __(':person is @mentioned in a conversation', ['person' => $person]) }}
    @else
        {{ __("I'm @mentioned in a conversation") }}
    @endif 
</td>
<td class="subscriptions-email"><input type="checkbox" @include('users/is_subscribed', ['medium' => App\Subscription::MEDIUM_EMAIL, 'event' => \Mentions::EVENT_I_AM_MENTIONED]) name="subscriptions[{{ App\Subscription::MEDIUM_EMAIL }}][]" value="{{ \Mentions::EVENT_I_AM_MENTIONED }}"></td>
<td class="subscriptions-browser"><input type="checkbox" @include('users/is_subscribed', ['medium' => App\Subscription::MEDIUM_BROWSER, 'event' => \Mentions::EVENT_I_AM_MENTIONED]) name="subscriptions[{{ App\Subscription::MEDIUM_BROWSER }}][]" value="{{ \Mentions::EVENT_I_AM_MENTIONED }}"></td>
<td class="subscriptions-mobile"><input type="checkbox" @include('users/is_subscribed', ['medium' => App\Subscription::MEDIUM_MOBILE, 'event' => \Mentions::EVENT_I_AM_MENTIONED]) name="subscriptions[{{ App\Subscription::MEDIUM_MOBILE }}][]" @if (!$mobile_available) disabled="disabled" @endif value="{{ \Mentions::EVENT_I_AM_MENTIONED }}"></td>
</tr>