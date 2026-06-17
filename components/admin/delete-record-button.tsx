"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type DeleteRecordButtonProps = {
  action: (state: DeleteActionState, formData: FormData) => Promise<DeleteActionState>;
  recordId: string;
  recordLabel: string;
  submitLabel: string;
  confirmMessage: string;
};

type DeleteActionState = {
  error: string | null;
};

const INITIAL_STATE: DeleteActionState = {
  error: null,
};

export function DeleteRecordButton({
  action,
  recordId,
  recordLabel,
  submitLabel,
  confirmMessage,
}: DeleteRecordButtonProps) {
  const [state, formAction] = useActionState(action, INITIAL_STATE);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className="flex flex-col items-start gap-2"
    >
      <input type="hidden" name="recordId" value={recordId} />
      <SubmitButton label={submitLabel} recordLabel={recordLabel} />
      {state.error ? (
        <p className="text-sm leading-6 text-red-700">{state.error}</p>
      ) : null}
    </form>
  );
}

function SubmitButton({
  label,
  recordLabel,
}: {
  label: string;
  recordLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? `Borrando ${recordLabel}...` : label}
    </button>
  );
}
