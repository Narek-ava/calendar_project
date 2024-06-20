<?php

namespace App\Traits;

use AshAllenDesign\ShortURL\Classes\Builder;
use AshAllenDesign\ShortURL\Models\ShortURL;
use Str;
use Throwable;

trait WithShortUrl
{
    /**
     * @param string $type
     * @return string|null
     */
    public function getShortURL(string $type = 'widgetUrl'): ?string
    {
        if (!method_exists($this, $type) || !is_string($this->$type)) return null;

        $shortURL = ShortURL::findByDestinationURL($this->$type)->first();
        if (!$shortURL) $shortURL = $this->generateUrl($this->$type);

        return $shortURL->default_short_url;
    }

    /**
     * @param ShortURL $shortURL
     * @return void
     */
    private function updateUrl(ShortURL $shortURL): void
    {
        // Since the library does not allow to set app url we need to replace BE url to FE url
        // Nginx reverse proxy is configured to handle such urls
        $shortURL->updateQuietly([
            'default_short_url' => Str::replace(config('app.url'), config('app.frontend_short_url'), $shortURL->default_short_url)
        ]);
    }

    /**
     * @param string $url
     * @return ShortURL
     */
    private function generateUrl(string $url): ShortURL
    {
        $shortURL = false;

        do {
            try {
                $builder = new Builder();
                $shortURL = $builder->destinationUrl($url)->make();
            } catch (Throwable) {
            }
        } while (!$shortURL);

        $this->updateUrl($shortURL);

        return $shortURL;
    }
}
