"use client";

import { ActionForm, SubmitButton, TextField } from "@/components/form";
import { Turnstile } from "@/components/turnstile";
import { register } from "../actions";

export function RegisterForm({ next }: { next: string }) {
  return (
    <ActionForm action={register}>
      {(state) => (
        <>
          <input type="hidden" name="next" value={next} />
          <TextField name="name" label="Full name" state={state} autoComplete="name" maxLength={100} />
          <TextField name="email" label="Email" type="email" state={state} autoComplete="email" />
          <TextField name="mobile" label="Mobile number" type="tel" state={state} autoComplete="tel-national" inputMode="numeric" hint="10 digit Indian mobile number" maxLength={14} />
          <TextField name="password" label="Password" type="password" state={state} autoComplete="new-password" hint="At least 8 characters with a letter and a number" maxLength={72} />
          <Turnstile resetSignal={state} />
          <SubmitButton pendingLabel="Creating account">Create account</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
