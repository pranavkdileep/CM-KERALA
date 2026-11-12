"use client";

import { ActionForm, SubmitButton, TextField } from "@/components/form";
import { Turnstile } from "@/components/turnstile";
import { login } from "../actions";

export function LoginForm({ next }: { next: string }) {
  return (
    <ActionForm action={login}>
      {(state) => (
        <>
          <input type="hidden" name="next" value={next} />
          <TextField name="email" label="Email" type="email" state={state} autoComplete="email" />
          <TextField name="password" label="Password" type="password" state={state} autoComplete="current-password" />
          <Turnstile resetSignal={state} />
          <SubmitButton pendingLabel="Signing in">Sign in</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
