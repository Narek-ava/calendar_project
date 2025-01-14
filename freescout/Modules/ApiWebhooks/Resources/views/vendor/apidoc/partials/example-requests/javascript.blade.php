```javascript
const url = new URL("{{ rtrim($baseUrl, '/') }}/{{ ltrim($route['boundUri'], '/') }}");
@if(count($route['cleanQueryParameters']))

    let params = {
    @foreach($route['cleanQueryParameters'] as $parameter => $value)
        "{{ $parameter }}": "{{ $value }}",
    @endforeach
    };
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
@endif

let headers = {
@foreach($route['headers'] as $header => $value)
    "{{$header}}": "{{$value}}",
@endforeach
@if(!array_key_exists('Accept', $route['headers']))
    "Accept": "application/hal+json",
@endif
@if(!array_key_exists('Content-Type', $route['headers']))
    "Content-Type": "application/json; charset=UTF-8",
@endif
}
@if(count($route['bodyParameters']))
@php
    foreach($route['cleanBodyParameters'] as $param_name => $param_value) {
        if (!empty($param_value[0]) && ($param_value[0] == '{' || $param_value[0] == '[')) {
            $route['cleanBodyParameters'][$param_name] = json_decode($param_value);
        }
    }
@endphp
let body = {!! json_encode($route['cleanBodyParameters'], JSON_PRETTY_PRINT) !!}
@endif

fetch(url, {
    method: "{{$route['methods'][0]}}",
    headers: headers,
@if(count($route['bodyParameters']))
    body: body
@endif
})
    .then(response => response.json())
    .then(json => console.log(json));
```
