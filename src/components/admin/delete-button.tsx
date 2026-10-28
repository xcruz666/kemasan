"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { type FormState, initialFormState } from "@/app/admin/actions/form-state";

export function DeleteButton({
  action,
  id,
  confirmMessage,
  label = "Hapus",
  small = false,
}: {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  id: string;
  confirmMessage: string;
  label?: string;
  small?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  return (
    <form
      className="admin-delete"
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={
          small
            ? "admin-button admin-button-danger admin-button-small"
            : "admin-button admin-button-danger"
        }
        disabled={pending}
      >
        <Trash2 size={16} aria-hidden="true" /> {pending ? "Menghapus…" : label}
      </button>
      {state.status === "error" && (
        <p className="admin-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
