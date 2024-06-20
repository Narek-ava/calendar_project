<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <title>{{$location->company->name}}</title>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">

    <!-- Styles -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.1.3/dist/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <!-- Default V2 theme -->
    <link href="https://unpkg.com/survey-jquery/defaultV2.min.css" type="text/css" rel="stylesheet">

    <!-- Scripts -->
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script type="text/javascript" src="https://unpkg.com/survey-jquery/survey.jquery.min.js"></script>

    {{-- pdf --}}
    <script src="https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js"></script>

    <!-- SurveyJS PDF Generator library -->
    <script src="https://unpkg.com/survey-pdf/survey.pdf.min.js"></script>

    {{-- Tinymce Editor --}}
    <script src="https://cdn.tiny.cloud/1/s6zoceyg8t1fawcsxcqokr6owxb34usxb3gc1l61c5gcjbpm/tinymce/5/tinymce.min.js" referrerpolicy="origin"></script>

    {{--    <script src="https://code.jquery.com/jquery-3.6.0.min.js"--}}
    {{--            integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>--}}

    {{--    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js"--}}
    {{--            integrity="sha512-pHVGpX7F/27yZ0ISY+VVjyULApbDlD0/X0rgGbTqCE7WFW5MezNTWG/dnhtbBuICzsd0WQPgpE4REBLv+UqChw=="--}}
    {{--            crossorigin="anonymous" referrerpolicy="no-referrer"></script>--}}
    <style>
        .body {
            min-height: 100vh;
            font-family: 'Nunito', sans-serif;
        }

        .body {
            display: -ms-flexbox;
            display: -webkit-box;
            display: flex;
            -ms-flex-align: center;
            -ms-flex-pack: center;
            -webkit-box-align: center;
            align-items: center;
            -webkit-box-pack: center;
            justify-content: center;
            padding-top: 40px;
            padding-bottom: 40px;
            background: linear-gradient(180deg,{{ $location->company->settings()->get('widget.widgetBgPattern.start') }} 0%, {{ $location->company->settings()->get('widget.widgetBgPattern.end') }} 100%);
        }

        .content {
            padding: 25px 25px 25px 25px;
            margin: 0 auto;
            background: #FFFFFF;
            width: 500px;
            justify-content: center;
            border-radius: 20px;
        }

        .content .form-control {
            position: relative;
            box-sizing: border-box;
            border-radius: 20px;
            height: 50px;
            border: 1px solid rgba(0, 0, 0, 0.42);
        }

        .content .form-control:focus {
            z-index: 2;
        }

        .form-container {
            display: flex;
            flex-direction: column;
            row-gap: 25px;
        }

        .btn-search {
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            border-radius: 20px;
            border: 0px;
            height: 50px;
        }

        .img {
            max-width: 300px;
            max-height: 100px;
        }

        .list-group {
            row-gap: 15px;
        }

        .list-group-item {
            background: linear-gradient(90deg, #0FE494 0%, #1ED18E 100%);
            border: 0px;
            border-radius: 5px;
        }
        .alert {
            border-radius: 20px;
        }
    </style>
    @yield('css')
</head>
<body class="text-center">
    <div class="body">
        <div class="content">
            @if(!Route::is('kiosk.check-in'))
                @if($location->company->logo)   
                    <img class="img mb-3" alt="" src="{{ Storage::url($location->company->logo->link) }}">
                @else 
                    <img class="img mb-3" alt="" src="{{ asset('images/default-logo.png') }}">
                @endif
            @endif
            @yield('content')
        </div>   
    </div>

@yield('javascripts')
</body>
</html>
