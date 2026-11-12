"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { Info, Sparkles } from "lucide-react";
import { FileField, FormNotice, SelectField, TextAreaField, TextField } from "@/components/form";
import { Turnstile } from "@/components/turnstile";
import { idle, type FormState } from "@/lib/form";
import { categories, districts } from "@/lib/site";
import type { AiSuggestion } from "@/lib/types";
import { button } from "@/lib/ui";
import { analyzeGrievance, createGrievance } from "./actions";

const MIN_DESCRIPTION = 20;

export function SubmitForm() {
  const [state, setState] = useState<FormState>(idle);
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<{ result: AiSuggestion; text: string } | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [analysing, startAnalysis] = useTransition();
  const [submitting, startSubmit] = useTransition();

  const stale = analysis !== null && analysis.text !== description.trim();
  const canAnalyse = description.trim().length >= MIN_DESCRIPTION && !analysing;

  function runAnalysis() {
    setAnalysisError("");
    startAnalysis(async () => {
      const res = await analyzeGrievance({ description: description.trim(), district });
      if (!res.ok) {
        setAnalysisError(res.message);
        return;
      }
      setAnalysis({ result: res.data, text: description.trim() });
      // Pre-fill the category. The citizen can change it before submitting.
      setCategory(res.data.category);
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (analysis && !stale) formData.set("analysisId", analysis.result.analysisId);
    startSubmit(async () => {
      // On success the action redirects to the new grievance, so only errors come back.
      setState(await createGrievance(formData));
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6 rounded-lg border border-line bg-surface p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField name="district" label="District" state={state} options={districts} placeholder="Choose a district" value={district} onValueChange={setDistrict} />
          <SelectField
            name="category"
            label="Category"
            state={state}
            options={categories}
            placeholder="Choose a category"
            value={category}
            onValueChange={setCategory}
            hint={analysis && !stale ? "Suggested by the assistant. Change it if it is wrong." : undefined}
          />
        </div>

        <TextField name="subject" label="Subject" state={state} maxLength={150} hint="A short title, for example: Streetlights not working on MC Road" />

        <div>
          <TextAreaField
            name="description"
            label="What happened?"
            state={state}
            rows={8}
            maxLength={4000}
            hint="Say what the problem is, where it is, since when, and who you have already told."
            value={description}
            onValueChange={setDescription}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate">
            <span>{description.trim().length < MIN_DESCRIPTION ? `At least ${MIN_DESCRIPTION} characters` : "Ready to analyse"}</span>
            <span>{description.length} of 4000</span>
          </div>
        </div>

        <div>
          <button type="button" onClick={runAnalysis} disabled={!canAnalyse} className={button("secondary", "md")}>
            <Sparkles className="size-4" aria-hidden="true" />
            {analysing ? "Analysing" : analysis ? "Analyse again" : "Get AI suggestions"}
          </button>
          {analysisError ? (
            <p role="alert" className="mt-3 text-sm text-error-ink">
              {analysisError}
            </p>
          ) : null}
        </div>

        <FileField name="attachment" label="Photo or document" required={false} accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" state={state} hint="JPG, PNG or PDF, up to 5 MB. If the form comes back with an error, attach the file again." />

        <Turnstile resetSignal={state} />
        <FormNotice state={state} />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={submitting} aria-disabled={submitting} className={button("primary", "lg")}>
            {submitting ? "Submitting" : "Submit grievance"}
          </button>
          <p className="text-sm text-slate">You will get a reference number straight away.</p>
        </div>
      </div>

      <aside aria-label="AI assistant" className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <AssistantPanel analysis={analysis?.result ?? null} stale={stale} analysing={analysing} />
        <p className="text-sm leading-relaxed text-slate">
          Already submitted one? <Link href="/track" className="font-medium text-sage-deep underline underline-offset-4">Track it with your reference number</Link>.
        </p>
      </aside>
    </form>
  );
}

function AssistantPanel({ analysis, stale, analysing }: { analysis: AiSuggestion | null; stale: boolean; analysing: boolean }) {
  if (!analysis) {
    return (
      <div className="rounded-lg border border-line bg-surface p-5">
        <p className="flex items-center gap-2 font-display font-semibold">
          <Sparkles className="size-4 text-sage" aria-hidden="true" />
          AI assistant
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {analysing ? "Reading your description." : "After you describe the problem, the assistant suggests a category, the department likely to handle it, a priority and a short summary for the CMO."}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate">It only advises. You and the CMO review every suggestion, and it never decides where a grievance goes.</p>
      </div>
    );
  }

  const fallback = analysis.source === "fallback";
  return (
    <div className="rounded-lg border border-line bg-surface p-5" aria-live="polite">
      <p className="flex items-center gap-2 font-display font-semibold">
        <Sparkles className="size-4 text-sage" aria-hidden="true" />
        {fallback ? "Keyword suggestion" : "AI suggestion"}
      </p>
      <p className="mt-1 text-xs text-slate">{fallback ? "The AI service was not used, so this comes from simple keyword matching." : `Written by ${analysis.model}.`}</p>
      {stale ? <p className="mt-3 rounded bg-warning/[0.1] px-3 py-2 text-xs text-warning-ink">You changed the description. It will be analysed again when you submit, or select Analyse again.</p> : null}

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs text-slate">Category</dt>
          <dd className="font-medium">{analysis.category}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate">Likely department</dt>
          <dd className="font-medium">{analysis.department ?? "Not sure"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate">Priority</dt>
          <dd className="font-medium">{analysis.priority}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate">Summary for the CMO</dt>
          <dd className="leading-relaxed text-ink-soft">{analysis.summary}</dd>
        </div>
      </dl>

      {analysis.duplicates.length > 0 ? (
        <div className="mt-4 flex gap-2 rounded bg-info/[0.08] px-3 py-2.5 text-xs leading-relaxed text-[#0369a1]">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <p>
            Similar grievances were reported recently in this district ({analysis.duplicates.map((d) => d.referenceId).join(", ")}). You can still submit yours. The CMO will check for duplicates.
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-slate">{analysis.disclaimer}</p>
    </div>
  );
}
