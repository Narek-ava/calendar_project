<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\SelectGoogleCalendarsRequest;
use App\Http\Resources\Account\Google\GoogleAccountResource;
use App\Models\Google\GoogleAccount;
use App\Services\Exceptions\UserException;
use App\Services\GoogleService;
use Arr;
use Google\Service\Exception as GoogleException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Throwable;
use function Sentry\captureException;

class GoogleAccountController extends Controller
{
    /**
     * @param GoogleService $googleService
     */
    public function __construct(private readonly GoogleService $googleService)
    {
    }

    /**
     * @param Request $request
     * @return Response
     */
    public function store(Request $request): Response
    {
        try {
            $this->googleService->authenticate($request->get('code'));
            $googleAccount = $this->googleService->service('Oauth2')->userinfo->get();

            // Check we have all the scopes granted
            $accessToken = $this->googleService->getAccessToken();
            $grantedScopes = Arr::get($accessToken, 'scope');

            if (!Str::of($grantedScopes)->containsAll($this->googleService->getScopes())) {
                throw new UserException('All the scopes must be granted, please try again.', 400);
            }

            auth()->user()->googleAccounts()->updateOrCreate(
                ['google_id' => $googleAccount->id],
                ['name' => $googleAccount->email, 'token' => $accessToken]
            );
        } catch (GoogleException $exception) {
            captureException($exception);
            return response(['message' => Arr::get($exception->getErrors(), '0.message')], $exception->getCode());
        } catch (Throwable $exception) {
            captureException($exception);
            return response(['message' => $exception->getMessage()], 400);
        }

        return response(['message' => 'Google Account Attached']);
    }

    /**
     * @param Request $request
     * @return Response
     */
    public function authUrl(Request $request): Response
    {
        return response(['url' => $this->googleService->createAuthUrl()]);
    }

    /**
     * @return Response
     */
    public function destroy(): Response
    {
        $googleAccount = auth()->user()->googleAccounts()->firstOrFail();
        $googleAccount->calendars->each->delete();
        $googleAccount->delete();

        $this->googleService->revokeToken($googleAccount->token);

        return response(['message' => 'Google Account Detached']);
    }

    /**
     * @param SelectGoogleCalendarsRequest $request
     * @param GoogleAccount $googleAccount
     * @return Response
     */
    public function selectCalendars(SelectGoogleCalendarsRequest $request, GoogleAccount $googleAccount): Response
    {
        foreach ($request->validated('calendars') as $calendar) {
            $googleAccount->calendars()->where('id', Arr::get($calendar, 'id'))->update($calendar);
        }

        return response(['message' => 'Settings updated successfully.']);
    }
}
