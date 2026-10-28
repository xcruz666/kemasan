"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions/auth";
import { initialFormState } from "@/app/admin/actions/form-state";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialFormState);
  return (
    <form className="admin-form" action={formAction}>
      <div className="admin-field">
        <label className="admin-label" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          className="admin-input"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state.status === "error"}
          aria-describedby={state.status === "error" ? "admin-password-error" : undefined}
        />
        {state.status === "error" && (
          <p className="admin-error" id="admin-password-error" role="alert">
            {state.message}
          </p>
        )}
      </div>
      <button type="submit" className="admin-button admin-button-primary" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
