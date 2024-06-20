<?php

namespace App\Services;

use App\Models\Image;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Intervention\Image\Image as InterventionImage;
use Intervention\Image\ImageManager;
use Storage;

final class ImageUploaderService
{
    private array $thumbnailsConfig = [
        'medium' => [
            'width'   => '800',
            'height'  => '600',
            'quality' => '60',
        ],
        'small'  => [
            'width'   => '400',
            'height'  => '300',
            'quality' => '30',
        ],
    ];

    public function __construct(private ImageManager $manager)
    {
        $this->manager = new ImageManager(['driver' => 'imagick']);
    }

    /**
     * @param string $path
     * @param UploadedFile $file
     * @return string
     */
    public function upload(string $path, UploadedFile $file): string
    {
        $fileName = Str::random(40);
        $fileExtension = $file->extension();
        $filePath = $file->getRealPath();
        $fullPath = "$path/$fileName.$fileExtension";

        $this->makeThumbnail($path, $fileName, $fileExtension, $this->manager->make($filePath));

        if (Storage::put($fullPath, (string)$this->manager->make($filePath)->encode(null, 75))) return $fullPath;

        return false;
    }

    public function makeThumbnail(string $path, string $fileName, string $fileExtension, InterventionImage $interventionImage): void
    {
        foreach ($this->thumbnailsConfig as $resolution => $config) {
            $interventionImageThumbnail = $interventionImage->widen(
                Arr::get($config, 'width'),
                fn($constraint) => $constraint->upsize()
            );

            Storage::put(
                "$path/$fileName@$resolution.$fileExtension",
                (string)$interventionImageThumbnail->encode(null, Arr::get($config, 'quality'))
            );
        }
    }

    public function delete(Image $image): ?bool
    {
        Storage::delete($image->link);

        return $image->delete();
    }
}
