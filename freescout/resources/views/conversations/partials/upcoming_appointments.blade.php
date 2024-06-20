<div class="conv-sidebar-block upcomingAppointmentsBlock">
    <div class="panel-group accordion accordion-empty">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">
                    <a class="collapse-btn" href=".collapse-conv-upcoming">{{ __("Upcoming Appointments") }} 
                        <b class=" caret"></b>
                    </a>
                </h4>
            </div>
            <div class="collapse-conv-upcoming panel-collapse collapse in">
                <div class="panel-body">
                    <div class="sidebar-block-header2"><strong>{{ __("Upcoming Appointments") }}</strong> (<a data-toggle="collapse" href=".collapse-conv-upcoming">{{ __('close') }}</a>)</div>
                    <ul class="sidebar-block-list">
                        @foreach ($appointments as $appointment)
                            <li class="appointmentItem">
                                <i class="glyphicon glyphicon-calendar"></i>
                                {{ $appointment['service']['name'] }} {{ $appointment['start_at'] }}
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>