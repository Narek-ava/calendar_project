<?php

namespace App\Http\Controllers\Mailbox;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mailbox\StoreMailboxRequest;
use App\Http\Requests\Mailbox\UpdateMailboxRequest;
use App\Repositories\MailboxRepository;
use Illuminate\Http\Request;

class MailboxController extends Controller
{
    /**
     * @authenticated
     * @param MailboxRepository $repository
     */
    public function __construct(
        private MailboxRepository $repository
    ) {
    }

    public function index(Request $request)
    {
        return $this->repository->list();
    }

    public function show(Request $request, $mailbox)
    {
        return $this->repository->show($mailbox);
    }

    public function store(StoreMailboxRequest $request)
    {
        return $this->repository->create($request->validated());
    }

    public function update(UpdateMailboxRequest $request, $mailbox)
    {
        return $this->repository->update($request->validated(), $mailbox);
    }

    public function destroy($mailbox)
    {
        return $this->repository->destroy($mailbox);
    }
}
