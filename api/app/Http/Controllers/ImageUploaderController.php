<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImageUploaderRequest;
use App\Models\Image;
use App\Services\ImageUploaderService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use JetBrains\PhpStorm\ArrayShape;
use Storage;

class ImageUploaderController extends Controller
{
    public function __construct(public ImageUploaderService $imageUploaderService)
    {
    }

    /**
     * @param ImageUploaderRequest $request
     * @return array
     */
    #[ArrayShape(['link' => "string", 'preview' => "string"])]
    public function __invoke(ImageUploaderRequest $request): array
    {
        $link = $this->imageUploaderService->upload('images', $request->file('image'));

        return [
            'link'    => $link,
            'preview' => Storage::url($link),
        ];
    }

    /**
     * @param Request $request
     * @return Response
     */
    public function destroy(Request $request): Response
    {
        if ($image = Image::find($request->image)) $this->imageUploaderService->delete($image);
        return response(['message' => 'Image successfully deleted']);
    }

    /**
     * Deletes image uploaded to Storage but not attached to entity
     * To remove image from entity use destroy() method instead
     *
     * @param Request $request
     * @return Response
     */
    public function destroyByLink(Request $request): Response
    {
        // Do not delete attached images to entity
        if (!Image::whereLink($request->input('link'))->exists()) Storage::delete($request->input('link'));

        return response(['message' => 'Image successfully deleted']);
    }
}
