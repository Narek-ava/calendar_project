<?php

use App\Http\Controllers\Mailbox\ConversationController;
use App\Http\Controllers\Mailbox\TagController;
use App\Http\Controllers\Mailbox\ThreadController;

/*
 * Conversations
 */
Route::get('{mailbox}/conversations', [ConversationController::class, 'index'])->name('mailboxes.conversations.index');

Route::get('{mailbox}/conversations/{conversation}', [ConversationController::class, 'show'])
    ->name('mailboxes.conversations.show');

Route::post('{mailbox}/conversations', [ConversationController::class, 'store'])->name('mailboxes.conversations.store');

Route::match(['put', 'patch'], '{mailbox}/conversations/{conversation}', [ConversationController::class, 'update'])
    ->name('mailboxes.conversations.update');

Route::delete('{mailbox}/conversations/{conversation}', [ConversationController::class, 'destroy'])
    ->name('mailboxes.conversations.destroy');
Route::delete('{mailbox}/conversations/bulk', [ConversationController::class, 'bulkDestroy'])
    ->name('mailboxes.conversations.bulkDestroy');

Route::post('{mailbox}/conversations/{conversation}/assign', [ConversationController::class, 'assign'])
    ->name('mailboxes.conversations.assign');
Route::post('{mailbox}/conversations/assign/bulk', [ConversationController::class, 'bulkAssign'])
    ->name('mailboxes.conversations.bulkAssign');

Route::post('{mailbox}/conversations/{conversation}/status', [ConversationController::class, 'status'])
    ->name('mailboxes.conversations.status');
Route::post('{mailbox}/conversations/status/bulk', [ConversationController::class, 'bulkStatus'])
    ->name('mailboxes.conversations.bulkStatus');

Route::post('{mailbox}/conversations/{conversation}/unread', [ConversationController::class, 'unread'])
    ->name('mailboxes.conversations.unread');
Route::post('{mailbox}/conversations/unread/bulk', [ConversationController::class, 'bulkUnread'])
    ->name('mailboxes.conversations.bulkUnread');

/*
 * Threads
 */
Route::post('{mailbox}/conversations/{conversation}/threads', [ThreadController::class, 'store'])
    ->name('mailboxes.conversations.threads.store');

/*
 * Tags
 */
Route::apiResource('{mailbox}/tags', TagController::class);
