<?php

namespace App\Http\Controllers\Mailbox;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mailbox\Tag\TagRequest;
use App\Repositories\TagRepository;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Response;

class TagController extends Controller
{
    public function __construct(private TagRepository $repository)
    {
    }

    public function index(int $mailbox): Response
    {
        try {
            return response($this->repository->list($mailbox));
        } catch (RequestException $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function show(int $mailbox, int $tag): Response
    {
        try {
            return response($this->repository->show($mailbox, $tag));
        } catch (RequestException $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function store(TagRequest $request, int $mailbox): Response
    {
        try {
            return response($this->repository->create($mailbox, $request->all()));
        } catch (RequestException $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function update(TagRequest $request, int $mailbox, int $tag): Response
    {
        try {
            return response($this->repository->update($mailbox, $tag, $request->all()));
        } catch (RequestException $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }

    public function destroy(int $mailbox, int $tag): Response
    {
        try {
            return response($this->repository->destroy($mailbox, $tag));
        } catch (RequestException $e) {
            return response(['message' => $e->getMessage()], $e->getCode());
        }
    }
}
