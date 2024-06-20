<h3><strong>Available Conditions</strong></h3>
<p><strong>1) When using OR conditions and “Does not contain” / “Is not equal” be very mindful.
        Very often when people need AND they are using OR instead and get logical issues.</strong>
</p>
<p><strong>2) If you need the workflow to trigger when a new email or reply is received you need
        to add the “New / Reply / Moved” condition:</strong><br>
    <img src="{{ asset('modules/workflows/img/2022-09-09_13-26-52.png') }}" width="583"
         height="128"/>
<ul>
    <li>Customer Name</li>
    <li>Customer Email</li>
    <li>User Action — replied or added a note</li>
    <li>Conversation Type — email or phone</li>
    <li>Conversation Status — active, pending, closed, spam</li>
    <li>Assigned to User</li>
    <li>To — email To field</li>
    <li>Cc</li>
    <li>Subject</li>
    <li>Body — customer message&nbsp;or&nbsp;user note contains specific text</li>
    <li>Attachment — contains or not</li>
    <li>Customer Viewed</li>
    <li>New or Reply&nbsp;— is it a new conversation or user’s or customer’s reply.</li>
    <li>Tag(s)&nbsp;— contains specific tags (requires <b>Tags module)</b></li>
    <li>Waiting Since — for how many days or hours a customer message is waiting to be replied
        by a user. <strong>This condition triggers the workflow only if the&nbsp;last reply in
            the conversation is made by a customer and conversation’s status is ACTIVE or
            PENDING</strong></li>
    <li>Last User Reply — date of the last user reply</li>
    <li>Last Customer Reply — date of the last customer reply</li>
    <li>Date Created — date when conversation was created</li>
    <li>Custom Fields&nbsp;— check custom fields values (requires <b>Custom Fields module</b>)
    </li>
</ul>
<p>Conditions are&nbsp;case-insensitive.</p>
<p>Some conditions allow to use regexes to check values. Tools for testing regexes:&nbsp;<a
        href="http://regexpal.com/" target="_blank" rel="noopener">Regex Pal</a>&nbsp;or&nbsp;<a
        href="http://regex101.com/" target="_blank" rel="noopener">Regex101</a>. Sample regular
    expression: /^[a-zA-Z0-9]$/</p>
<h3><strong>Available Actions</strong></h3>
<ul>
    <li>Send Email Notification — to current assignee, to the last user to reply or to a
        specific user
    </li>
    <li>Email the Customer (%user.*% variables always contain Workflow user data, not the user
        triggering the workflow, assignee or any other user)
    </li>
    <li>Forward — forward conversation with a custom message&nbsp;to a third party</li>
    <li>Add a Note</li>
    <li>Change Conversation Status — active, pending, closed, or spam</li>
    <li>Assign to User</li>
    <li>Move to Mailbox</li>
    <li>Move to Deleted Folder</li>
    <li>Delete Forever</li>
    <li>Add Tag(s) — requires <b>Tags module</b></li>
    <li>Remove Tag(s)&nbsp;— requires <b>Tags
            module</b></li>
    <li>Set Custom Field — requires <b>Custom
            Fields module</b></li>
</ul>
<p>If you have <b>Custom Folders</b> module
    installed, by adding tags to conversations you can move conversations to custom folders.</p>
<p>Workflows are automatically deactivated when some entity in it’s Actions or Conditions does
    not exist anymore (for example mailbox, user or customer is deleted).</p>
<h3><strong>Workflows Examples</strong></h3>
<p><strong>Track refund requests</strong></p>
<p>When the subject line or customer message contains “refund”, you want Inbox to
    automatically add a tag and send an email to the customer.</p>
<p>
    <img
        src="{{ asset('modules/workflows/img/inbox-workflow-refund.png') }}"
        alt="" width="805" height="388">
</p>
<p>
    <img
        src="{{ asset('modules/workflows/img/inbox-workflow-refund-actions.png') }}"
        alt="" width="797" height="216">
<p><strong>Keep track of aging conversations</strong></p>
<p>When a conversation is not replied by a user more than 1 day, add a “overdue” tag and send
    email notification to the current assignee and specific user. Also using <b>Custom Folders</b>
    module you by
    assigning a tag can add conversations to the Overdue folder for example.</p>
<p>
    <img
        src="{{ asset('modules/workflows/img/inbox-workflow-overdue-sla.png') }}"
        alt="" width="807" height="327"
    >
</p>
<p>
    <img
        src="{{ asset('modules/workflows/img/inbox-workflow-overdue-actions.png') }}"
        alt="" width="798" height="217"
    >
</p>
<p><strong>Send a follow-up email to the customer after a specific time period</strong></p>
<p>
    <img
        src="{{ asset('modules/workflows/img/help-desk-workflow-follow-up.png') }}"
        alt="" width="783" height="339"
    >
</p>
<p>
    <img
        src="{{ asset('modules/workflows/img/help-desk-workflow-follow-up-action.png') }}"
        alt="" width="771" height="130"
    >
</p>
<p><strong>Trigger workflow when conversation moved from another mailbox</strong></p>
<p>By default Workflows are not triggered when conversations are moved. To let the Workflow be
    triggered when the conversation is moved from another mailbox, you need to have at least one
    “Conversation moved from another mailbox” item among Conditions.</p>
<p>
    <img
        src="{{ asset('modules/workflows/img/helpdesk-ticket-moved-workflow.png') }}"
        alt="" width="563" height="447"
    >
</p>
<h3><strong>Permissions</strong></h3>
<p>You can allow non-admin users to manage workflows in “Manage&nbsp;» Settings” or in each
    user’s profile on Permissions page.</p>
