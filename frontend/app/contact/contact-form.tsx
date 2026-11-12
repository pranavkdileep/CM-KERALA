"use client";

import { ActionForm, SubmitButton, TextAreaField, TextField } from "@/components/form";
import { Turnstile } from "@/components/turnstile";
import { sendEnquiry } from "./actions";

export function ContactForm() {
  return (
    <ActionForm action={sendEnquiry}>
      {(state) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label="Your name" state={state} autoComplete="name" />
            <TextField name="email" label="Email" type="email" state={state} autoComplete="email" />
          </div>
          <TextField name="subject" label="Subject" state={state} maxLength={150} />
          <TextAreaField
            name="message"
            label="Message"
            state={state}
            rows={6}
            maxLength={2000}
            hint="For a new complaint, use Submit grievance instead so it gets a reference number."
          />
          <Turnstile resetSignal={state} />
          <SubmitButton pendingLabel="Sending message">Send message</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
