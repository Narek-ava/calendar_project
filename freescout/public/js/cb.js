$(document).ready(() => {

    // scroll to opened conversation on load
    if ($('.cb-row.active').length) $('.cb-row.active').get(0).scrollIntoView();

    // history back and forward
    window.addEventListener('popstate', event => {
        console.log(event);
        if (event.state && typeof event.state.action !== 'undefined' && event.state.action === 'conversation_view') {
            loadConversation(event.state.conversation_id, false);
        }
    });

    $('.cb-row').click(e => {
        if ($(e.target).hasClass('conv-star')) return;
        loadConversation($(e.currentTarget).data('conversation-id'));
        $('.content-2col').addClass('active');
    });

    function setGlobalAttr(attr, value)
    {
        return $("body:first").attr('data-'+attr, value);
    }

    function loadConversation(conversation_id, modifyHistory = true) {
        const $conversations = $('.cb-row');
        const $conversation = $(`.cb-row[data-conversation-id="${conversation_id}"]`);

        const payload = {
            action: 'conversation_view',
            conversation_id: conversation_id,
            global_mailbox_folder_id: isGlobalMailbox() ? getGlobalMailboxFolderId() : '',
            isGlobalMailbox: isGlobalMailbox()
        };

        fsAjax(payload, laroute.route('conversations.ajax'), function (response) {
            showAjaxResult(response);

            if (modifyHistory) {
                if (!isGlobalMailbox()) {
                    history.pushState(payload, null, response.conversation_url);
                }
                document.title = response.conversation_title_full;
            } else {
                $conversation.get(0).scrollIntoView();
            }

            $('#conv-layout').replaceWith(response.conversation_html);
            setGlobalAttr('conversation_id', conversation_id);
            var jsCode = $('#jsContent').data('js-code') + ')';
            eval(jsCode);
            $conversations.removeClass('active');
            $conversation.addClass('active');

            // Click to star binds every load, so unbind first
            $('.conv-star').unbind('click');

            initReplyForm();
            initConversation();
        });
    }

    $('body').delegate('#back-btn', 'click', (e) => {
        $('.content-2col').removeClass('active');
        $('.cb-column').css('display','');
    });
});
