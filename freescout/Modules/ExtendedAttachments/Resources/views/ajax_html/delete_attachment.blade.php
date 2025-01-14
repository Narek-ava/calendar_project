<div>
	<div class="text-center">
		<div class="text-larger margin-top-10">{{ __('Are you sure you want to delete :file_name?', ['file_name' => $attachment->file_name]) }}</div>
		<div class="form-group margin-top">
			<button class="btn btn-primary ea-confirm-delete" data-attachment-id="{{ $attachment->id }}" data-loading-text="{{ __('Delete') }}…">{{ __('Delete') }}</button>
			<button class="btn btn-link" data-dismiss="modal">{{ __("Cancel") }}</button>
		</div>
	</div>
</div>