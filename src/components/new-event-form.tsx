"use client";

import { useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { createEvent } from "@/app/actions";

type PollOption = {
  id: number;
  value: string;
};

const initialOptions: PollOption[] = [
  { id: 1, value: "Proposition" },
  { id: 2, value: "Opposition" },
  { id: 3, value: "Too close to call" },
];

export function NewEventForm() {
  const [options, setOptions] = useState(initialOptions);

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
    <form action={createEvent} className="space-y-4">
      <div>
        <label className="text-sm font-bold" htmlFor="title">
          Event title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue="Contrarian Club Debate"
          className="salon-input mt-2 w-full px-3 py-3"
        />
      </div>

      <div>
        <label className="text-sm font-bold" htmlFor="prePrompt">
          Pre-debate question
        </label>
        <textarea
          id="prePrompt"
          name="prePrompt"
          required
          rows={3}
          defaultValue="Before hearing the debate, which side do you agree with more?"
          className="salon-input mt-2 w-full resize-none px-3 py-3"
        />
      </div>

      <div>
        <label className="text-sm font-bold" htmlFor="postPrompt">
          Post-debate question
        </label>
        <textarea
          id="postPrompt"
          name="postPrompt"
          required
          rows={3}
          defaultValue="After hearing the debate, which side do you agree with more?"
          className="salon-input mt-2 w-full resize-none px-3 py-3"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-bold" htmlFor="option-1">
            Poll options
          </label>
          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= 8}
            className="salon-button min-h-9 px-3 py-2 text-sm"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <div className="mt-2 space-y-2">
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-2">
              <input
                id={`option-${index + 1}`}
                name="options"
                required={index < 2}
                value={option.value}
                onChange={(event) => updateOption(option.id, event.target.value)}
                className="salon-input min-w-0 flex-1 px-3 py-3"
                placeholder={`Option ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                disabled={options.length <= 2}
                aria-label={`Remove option ${index + 1}`}
                className="salon-button grid aspect-square h-12 min-h-12 place-items-center p-0 hover:bg-red-100"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="salon-button salon-button-primary w-full px-4 py-3"
      >
        Create event
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
