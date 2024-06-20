<?php

namespace App\Http\Controllers\Kiosk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kiosk\SearchRequest;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Location;
use Carbon\Carbon;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Storage;

class KioskController extends Controller
{

    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $middlewares = ['web'];
        if (!app()->isLocal()) array_push($middlewares, 'signed');

        $this->middleware($middlewares);
    }

    /**
     * @param Request $request
     * @param Location $location
     * @return View
     */
    public function search(Request $request, Location $location): View
    {
        return view('kiosk.form')->with('location', $location);
    }

    /**
     * @param SearchRequest $request
     * @param Location $location
     * @return RedirectResponse|View
     */
    public function results(SearchRequest $request, Location $location): RedirectResponse|View
    {
        $customer = Customer::whereCompanyOwnerId($location->company->companyOwner->id)
            ->where(function (Builder $query) use ($request) {
                foreach (['firstname', 'lastname'] as $column) {
                    foreach (explode(' ', $request->get('name')) as $word) {
                        $query->orWhere($column, 'ilike', "%$word%");
                    }
                }
            })
            ->where(function (Builder $query) use ($request) {
                $query
                    ->where('email', $request->get('q'))
                    ->orWhere('phone', preg_replace('/\D/', '', $request->get('q')));
            })
            ->first();

        if (!$customer) return back()->withInput()->with(['customerNotFound' => true]);

        $appointments = $customer
            ->appointments()
            ->active()
            ->whereIsCheckedIn(false)
            ->whereType(Appointment::APPOINTMENT_TYPE)
            ->whereLocationId($location->id)
            ->where('start_at', '>=', Carbon::now($location->time_zone)->startOfDay()->utc())
            ->where('start_at', '<=', Carbon::now($location->time_zone)->endOfDay()->utc())
            ->orderByDesc('start_at')
            ->get();

        return view('kiosk.results', [
            'location'     => $location,
            'appointments' => $appointments,
            'customer'     => $customer,
        ]);
    }

    /**
     * @param Request $request
     * @param Location $location
     * @param Appointment $appointment
     * @return RedirectResponse|View
     */
    public function checkIn(Request $request, Location $location, Appointment $appointment): RedirectResponse|View
    {
        if ($appointment->company->waiver_data && $appointment->service->is_waiver_enabled) {
            return view('kiosk.formQuestionnaire')->with(['appointment'=> $appointment, 'location' => $location]);
        }
        $appointment->update(['is_checked_in' => true]);
        return redirect()->signedRoute('kiosk.search', $location)->with(['checkedIn' => true]);
    }

    /**
     * @param Request $request
     * @param Location $location
     * @param Appointment $appointment
     * @return JsonResponse
     */
    public function saveSurveyData(Request $request, Location $location, Appointment $appointment): JsonResponse
    {
        $pdfData = base64_decode( $request->input('dataurl'));
        $filename = uniqid('pdf_', true) . '.pdf';

        Storage::disk('s3')->put('pdf/' . $filename, $pdfData);

        $URL = Storage::disk('s3')->url('pdf/' . $filename);
        $appointment->update([
            'waiver_pdf' => $URL,
            'waiver_answers' => $request->input('data'),
            'is_checked_in' => true
        ]);

        session()->flash('checkedIn', true);
        $signedUrl = URL::signedRoute('kiosk.search', $location);

        return response()->json(['redirect' => $signedUrl], 200);
    }
}
