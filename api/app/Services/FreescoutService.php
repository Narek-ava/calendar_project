<?php

namespace App\Services;

use GuzzleHttp\Promise\PromiseInterface;
use Http;
use Illuminate\Http\Client\Response;

final class FreescoutService
{
    private array $headers = [
        'X-Requested-With' => 'XMLHttpRequest',
        'Content-Type' => 'application/json',
    ];

    public function get(string $url, $query = null): PromiseInterface|Response
    {
        return Http::withHeaders($this->headers)->get($this->url($url), $query)->throw();
    }

    public function post(string $url, $query = null): PromiseInterface|Response
    {
        return Http::withHeaders($this->headers)->post($this->url($url), $query)->throw();
    }

    public function patch(string $url, $query = null): PromiseInterface|Response
    {
        return Http::withHeaders($this->headers)->patch($this->url($url), $query)->throw();
    }

    public function delete(string $url, $query = null): PromiseInterface|Response
    {
        return Http::withHeaders($this->headers)->delete($this->url($url), $query)->throw();
    }

    public function setUser($userId): self
    {
        $this->headers['X-FreeScout-User'] = $userId;

        return $this;
    }

    private function url(string $url): string
    {
        return config('services.freescout.api_base_url') . $url;
    }
}
