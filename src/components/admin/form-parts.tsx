"use client";

import { type FormEvent, startTransition } from "react";
import type { FormState } from "@/app/admin/actions/form-state";

/**
 * Submit through useActionState without React's automatic form reset, which
 * would put controlled fields such as <select> out of sync with their state.
 */
export function submitWithoutReset(dispatch: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="admin-error" id={id}>
      {message}
    </p>
  );
}

export function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={over ? "admin-counter admin-counter-over" : "admin-counter"}>
      {value.length}/{max}
    </span>
  );
}

/** Top-of-form message. `notice` is shown until the form is submitted once. */
export function FormMessage({ state, notice }: { state: FormState; notice?: string }) {
  if (state.status === "idle") {
    return notice ? (
      <p className="admin-banner admin-banner-success" role="status">
        {notice}
      </p>
    ) : null;
  }
  return (
    <p
      className={
        state.status === "success"
          ? "admin-banner admin-banner-success"
          : "admin-banner admin-banner-error"
      }
      role={state.status === "success" ? "status" : "alert"}
    >
      {state.message}
    </p>
  );
}
