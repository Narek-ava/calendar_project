<?php

namespace App\Http\Controllers\Mailbox;

use App\Http\Controllers\Controller;
use App\Repositories\ConversationRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ConversationController extends Controller
{
    /**
     * @authenticated
     * @param ConversationRepository $repository
     */
    public function __construct(
        private ConversationRepository $repository
    ) {
    }

    /**
     * @throws Exception
     */
    public function index(Request $request, $mailbox): Response
    {
        try {
            return response($this->repository->list($mailbox, $request->all()));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function show(Request $request, $mailbox, $conversation): Response
    {
        try {
            return response($this->repository->show($mailbox, $conversation));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function store(Request $request, $mailbox): Response
    {
        try {
            return response($this->repository->create($mailbox, $request->all()));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function update(Request $request, $mailbox, $conversation): Response
    {
        try {
            return response($this->repository->update($mailbox, $conversation, $request->all()));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function destroy($mailbox, $conversation): Response
    {
        try {
            return response($this->repository->destroy($mailbox, $conversation));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function bulkDestroy(Request $request, $mailbox): Response
    {
        try {
            return response($this->repository->bulkDestroy($mailbox, $request->all()));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function assign(Request $request, $mailbox, $conversation): Response
    {
        try {
            return response($this->repository->assign($mailbox, $conversation, $request->all()));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function bulkAssign(Request $request, $mailbox): Response
    {
        try {
            return response($this->repository->bulkAssign($mailbox, $request->all()));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function status(Request $request, $mailbox, $conversation): Response
    {
        try {
            return response($this->repository->status($mailbox, $conversation, $request->all()));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function bulkStatus(Request $request, $mailbox): Response
    {
        try {
            return response($this->repository->bulkStatus($mailbox, $request->all()));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function unread($mailbox, $conversations)
    {
        try {
            return response($this->repository->unread($mailbox, $conversations));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function bulkUnread(Request $request, $mailbox, $conversations)
    {
        try {
            return response($this->repository->bulkUnread($mailbox, $conversations, $request->all()));
        } catch (Exception $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }
}
