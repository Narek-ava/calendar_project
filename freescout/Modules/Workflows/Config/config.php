<?php

return [
    'name' => 'Workflows',
//	'process_cron' => env('WORKFLOWS_PROCESS_CRON', '*/30 * * * *'), // every 30 minutes
	'process_cron' => env('WORKFLOWS_PROCESS_CRON', '* * * * *'), // every minute, only for testing
	'user_full_name' => env('WORKFLOWS_USER_FULL_NAME', 'Workflow'),
];
