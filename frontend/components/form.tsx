"use client";

import { useActionState, type ChangeEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { idle, type FormState } from "@/lib/form";
import { button } from "@/lib/ui";

const inputBase =
  "w-full rounded-lg border bg-surface px-3.5 text-sm text-navy placeholder:text-mist hover:border-navy focus:outline-none disabled:bg-line-soft";
const inputOk = "border-line focus:border-navy focus:shadow-[0_0_0_3px_rgb(15_23_42/0.09)]";
const inputErr = "border-2 border-error focus:shadow-[0_0_0_3px_rgb(239_68_68/0.09)]";

type Common = {
  name: string;
  label: string;
  state?: FormState;
  hint?: string;
  required?: boolean;
  className?: string;
  /** Pass both to control the field from the parent. Without them the field is uncontrolled. */
  value?: string;
  onValueChange?: (value: string) => void;
};

function describe(id: string, hint?: string, error?: string) {
  return [hint && !error && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

function Shell({ id, label, hint, error, required, className, children }: { id: string; label: string; hint?: string; error?: string; required?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
        {required === false ? <span className="ml-1.5 font-normal text-slate">(optional)</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-error-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// Keyed on the restored value so the field shows it again after the server sends the form back with errors.
const restored = (state: FormState | undefined, name: string) => state?.values?.[name] ?? "";

// Controlled when the parent passes a value, otherwise uncontrolled with the restored value as default.
function bind(state: FormState | undefined, name: string, value?: string, onValueChange?: (v: string) => void) {
  if (value === undefined) return { defaultValue: restored(state, name) };
  return { value, onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onValueChange?.(e.target.value) };
}

export function TextField({ name, label, state, hint, required = true, className, type = "text", autoComplete, maxLength, placeholder, inputMode, value, onValueChange }: Common & { type?: string; autoComplete?: string; maxLength?: number; placeholder?: string; inputMode?: "numeric" | "tel" | "email" | "text" }) {
  const id = `f-${name}`;
  const error = state?.errors?.[name];
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        key={value === undefined ? restored(state, name) : undefined}
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        inputMode={inputMode}
        {...bind(state, name, value, onValueChange)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        className={`${inputBase} ${error ? inputErr : inputOk} h-[42px]`}
      />
    </Shell>
  );
}

export function TextAreaField({ name, label, state, hint, required = true, className, rows = 5, maxLength, placeholder, value, onValueChange }: Common & { rows?: number; maxLength?: number; placeholder?: string }) {
  const id = `f-${name}`;
  const error = state?.errors?.[name];
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        key={value === undefined ? restored(state, name) : undefined}
        id={id}
        name={name}
        required={required}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        {...bind(state, name, value, onValueChange)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        className={`${inputBase} ${error ? inputErr : inputOk} min-h-28 py-2.5 leading-relaxed`}
      />
    </Shell>
  );
}

export function SelectField({ name, label, state, hint, required = true, className, options, placeholder, defaultValue, value, onValueChange }: Common & { options: readonly (string | { value: string; label: string })[]; placeholder?: string; defaultValue?: string }) {
  const id = `f-${name}`;
  const error = state?.errors?.[name];
  const initial = restored(state, name) || defaultValue || "";
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        key={value === undefined ? initial : undefined}
        id={id}
        name={name}
        required={required}
        {...(value === undefined ? { defaultValue: initial } : { value, onChange: (e: ChangeEvent<HTMLSelectElement>) => onValueChange?.(e.target.value) })}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        className={`${inputBase} ${error ? inputErr : inputOk} h-[42px]`}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </Shell>
  );
}

export function FileField({ name, label, state, hint, required = false, className, accept }: Common & { accept: string }) {
  const id = `f-${name}`;
  const error = state?.errors?.[name];
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        className={`${inputBase} ${error ? inputErr : inputOk} py-2 text-ink-soft file:mr-3 file:rounded file:border-0 file:bg-line-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy`}
      />
    </Shell>
  );
}

export function SubmitButton({ children, pendingLabel, variant = "primary", size = "lg", name, value }: { children: ReactNode; pendingLabel?: string; variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" | "lg"; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} aria-disabled={pending} className={button(variant, size)}>
      {pending ? (pendingLabel ?? "Working") : children}
    </button>
  );
}

export function FormNotice({ state }: { state: FormState }) {
  return (
    <div aria-live="polite" role="status">
      {state.status === "success" && state.message ? (
        <p className="flex items-start gap-2.5 rounded-lg bg-success/[0.08] px-4 py-3 text-sm text-success-ink">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      ) : null}
      {state.status === "error" && state.message ? (
        <p className="flex items-start gap-2.5 rounded-lg bg-error/[0.08] px-4 py-3 text-sm text-error-ink">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

type ActionFormProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: (state: FormState) => ReactNode;
  className?: string;
};

/** A form wired to a server action. `children` receives the latest result so fields can show errors. */
export function ActionForm({ action, children, className = "space-y-5" }: ActionFormProps) {
  const [state, formAction] = useActionState(action, idle);
  return (
    <form action={formAction} noValidate className={className}>
      {children(state)}
      <FormNotice state={state} />
    </form>
  );
}
