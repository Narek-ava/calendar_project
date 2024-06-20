@extends('layouts.app')

@section('title_full', $conversation->getFullTitle())

@if (app('request')->input('print'))
    @section('body_class', 'body-conv print')
@else
    @section('body_class', 'body-conv')
@endif

@section('body_attrs')@parent data-conversation_id="{{ $conversation->id }}"@endsection

@section('sidebar')
    @include('partials/sidebar_menu_toggle')
    @include('mailboxes/sidebar_menu_view')
@endsection

@section('content')
    @include('partials/flash_messages')

    @if(count($conversations))
        <div class="cb-column" onScroll="handleScroll(event)">@include('conversations/conversations_simple_table')</div>
    @endif

    @include('conversations.partials.conversation')
@endsection

@section('body_bottom')
    @parent
    @include('conversations.partials.settings_modal', ['conversation' => $conversation])
@append

@include('partials/editor')

@section('javascript')
    @parent
    initReplyForm();
    initConversation();
@endsection
