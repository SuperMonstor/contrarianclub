"use client";

import { useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { createEvent, updateEvent } from "@/app/actions";
import type { ActivityType } from "@/lib/types";

type PollOption = {
  id: number;
  value: string;
};

export type EventFormValues = {
  title: string;
  eventFormat: ActivityType;
  options: string[];
  scaleLeftLabel: string;
  scaleCenterLabel: string;
  scaleRightLabel: string;
  prePrompt: string;
  postPrompt: string;
};

type NewEventFormProps = {
  eventCode?: string;
  initialValues?: EventFormValues;
};

const defaultValues: EventFormValues = {
  title: "Contrarian Club Debate",
  eventFormat: "multiple_choice",
  options: ["Proposition", "Opposition", "Too close to call"],
  scaleLeftLabel: "Opposition",
  scaleCenterLabel: "Too close to call",
  scaleRightLabel: "Proposition",
  prePrompt: "Before hearing the debate, which side do you agree with more?",
  postPrompt: "After hearing the debate, which side do you agree with more?",
};

const fallbackOptions: PollOption[] = [
  { id: 1, value: "Proposition" },
  { id: 2, value: "Opposition" },
  { id: 3, value: "Too close to call" },
];

function makeOptions(values: string[]) {
  const options = values.length >= 2 ? values : defaultValues.options;

  return options.slice(0, 8).map((value, index) => ({
    id: index + 1,
    value,
  }));
}

export function NewEventForm({ eventCode, initialValues }: NewEventFormProps) {
  const values = initialValues ?? defaultValues;
  const formAction = eventCode ? updateEvent.bind(null, eventCode) : createEvent;
  const submitLabel = eventCode ? "Save changes" : "Create event";
  const formKey = [
    eventCode ?? "new",
    values.eventFormat,
    values.title,
    values.prePrompt,
    values.postPrompt,
    values.scaleLeftLabel,
    values.scaleCenterLabel,
    values.scaleRightLabel,
    values.options.join("|"),
  ].join("|");

  return (
    <EventFormFields
      key={formKey}
      formAction={formAction}
      submitLabel={submitLabel}
      values={values}
    />
  );
}

function EventFormFields({
  formAction,
  submitLabel,
  values,
}: {
  formAction: (formData: FormData) => Promise<void>;
  submitLabel: string;
  values: EventFormValues;
}) {
  const [options, setOptions] = useState<PollOption[]>(
    values.options.length > 0 ? makeOptions(values.options) : fallbackOptions,
  );
  const [eventFormat, setEventFormat] = useState<ActivityType>(
    values.eventFormat,
  );

  function updateOption(id: number, value: string) {
    setOptions((current) =>
      current.map((option) =>
        option.id === id ? { ...option, value } : option,
      ),
    );
  }

  function addOption() {
    setOptions((current) => [
      ...current,
      { id: Date.now(), value: "" },
    ]);
  }

  function removeOption(id: number) {
    setOptions((current) => current.filter((option) => option.id !== id));
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="eventFormat" value={eventFormat} />

      <div>
        <label className="club-label" htmlFor="title">
          Event title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={values.title}
          className="club-input mt-2 px-3.5 py-3"
        />
      </div>

      <div>
        <p className="club-label">Voting format</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setEventFormat("multiple_choice")}
            aria-pressed={eventFormat === "multiple_choice"}
            className={`club-btn min-h-12 justify-start px-4 py-3 ${
              eventFormat === "multiple_choice" ? "club-btn-primary" : ""
            }`}
          >
            Multiple choice
          </button>
          <button
            type="button"
            onClick={() => setEventFormat("scale")}
            aria-pressed={eventFormat === "scale"}
            className={`club-btn min-h-12 justify-start px-4 py-3 ${
              eventFormat === "scale" ? "club-btn-primary" : ""
            }`}
          >
            Debate scale
          </button>
        </div>
      </div>

      {eventFormat === "scale" ? (
        <div>
          <p className="club-label">Scale labels</p>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <div>
              <label className="sr-only" htmlFor="scaleLeftLabel">
                Opposition side
              </label>
              <input
                id="scaleLeftLabel"
                name="scaleLeftLabel"
                defaultValue={values.scaleLeftLabel}
                className="club-input px-3.5 py-3"
                placeholder="Opposition side"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="scaleRightLabel">
                Proposition side
              </label>
              <input
                id="scaleRightLabel"
                name="scaleRightLabel"
                defaultValue={values.scaleRightLabel}
                className="club-input px-3.5 py-3"
                placeholder="Proposition side"
              />
            </div>
          </div>
          <label className="sr-only" htmlFor="scaleCenterLabel">
            Center label
          </label>
          <input
            id="scaleCenterLabel"
            name="scaleCenterLabel"
            defaultValue={values.scaleCenterLabel}
            className="club-input mt-2.5 px-3.5 py-3"
            placeholder="Center label"
          />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="club-label" htmlFor="option-1">
              Poll options
            </label>
            <button
              type="button"
              onClick={addOption}
              disabled={options.length >= 8}
              className="club-btn min-h-9 px-3 py-2 text-sm"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className="mt-2.5 space-y-2.5">
            {options.map((option, index) => (
              <div key={option.id} className="flex gap-2">
                <input
                  id={`option-${index + 1}`}
                  name="options"
                  required={eventFormat === "multiple_choice" && index < 2}
                  value={option.value}
                  onChange={(event) => updateOption(option.id, event.target.value)}
                  className="club-input min-w-0 flex-1 px-3.5 py-3"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  disabled={options.length <= 2}
                  aria-label={`Remove option ${index + 1}`}
                  className="club-btn club-btn-danger grid aspect-square h-12 min-h-12 place-items-center p-0"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="club-label" htmlFor="prePrompt">
          Pre-debate question
        </label>
        <textarea
          id="prePrompt"
          name="prePrompt"
          required
          rows={3}
          defaultValue={values.prePrompt}
          className="club-input mt-2 resize-none px-3.5 py-3"
        />
      </div>

      <div>
        <label className="club-label" htmlFor="postPrompt">
          Post-debate question
        </label>
        <textarea
          id="postPrompt"
          name="postPrompt"
          required
          rows={3}
          defaultValue={values.postPrompt}
          className="club-input mt-2 resize-none px-3.5 py-3"
        />
      </div>

      <button
        type="submit"
        className="club-btn club-btn-primary w-full px-4 py-3"
      >
        {submitLabel}
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
