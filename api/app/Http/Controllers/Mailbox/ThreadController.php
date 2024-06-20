<?php

namespace App\Http\Controllers\Mailbox;

use App\Http\Controllers\Controller;
use App\Repositories\ThreadRepository;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;

class ThreadController extends Controller
{
    public function __construct(private ThreadRepository $repository)
    {
    }

    /**
     * @throws RequestException
     */
    public function store(Request $request, $mailbox, $conversation)
    {
        return $this->repository->create($request->all(), $mailbox, $conversation);
    }
}
