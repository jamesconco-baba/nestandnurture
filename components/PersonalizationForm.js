'use client';

import { GENDERS, GREETINGS } from '../lib/scoops';

export default function PersonalizationForm({ value, onChange }) {
  const greetingOptions = value.gender ? GREETINGS[value.gender] : [];

  const setGender = (gender) =>
    onChange({ gender, greetingId: '', greetingText: '' });

  const setGreeting = (option) => {
    if (option.custom) {
      onChange({ greetingId: option.id, greetingText: value.greetingText });
    } else {
      onChange({ greetingId: option.id, greetingText: option.text });
    }
  };

  const selectedOption = greetingOptions.find((g) => g.id === value.greetingId);

  return (
    <div className="rounded-2xl border border-lavender-100 bg-white p-6 sm:p-8 space-y-8">
      <div>
        <h2 className="font-display text-xl mb-1">Personalize this gift</h2>
        <p className="text-sm text-charcoal/50 font-body">
          Required for every order — this tells us the theme, the greeting
          card message, and how to handle delivery.
        </p>
      </div>

      {/* A. Gender selection */}
      <fieldset>
        <legend className="text-xs uppercase tracking-wide text-gold-700 font-body mb-3">
          1. Product theme *
        </legend>
        <div className="grid sm:grid-cols-3 gap-3">
          {GENDERS.map((g) => (
            <button
              type="button"
              key={g.id}
              onClick={() => setGender(g.id)}
              className={`focus-ring rounded-xl border p-4 text-left transition-colors ${
                value.gender === g.id
                  ? 'border-lavender bg-lavender-50'
                  : 'border-charcoal/15 hover:border-lavender/50'
              }`}
            >
              <p className="font-body font-semibold text-sm">{g.label}</p>
              <p className="text-xs text-charcoal/50 mt-1">{g.description}</p>
            </button>
          ))}
        </div>
      </fieldset>

      {/* B. Greeting survey */}
      {value.gender && (
        <fieldset>
          <legend className="text-xs uppercase tracking-wide text-gold-700 font-body mb-3">
            2. Greeting card message *
          </legend>
          <div className="space-y-2">
            {greetingOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                  value.greetingId === opt.id
                    ? 'border-lavender bg-lavender-50'
                    : 'border-charcoal/15 hover:border-lavender/50'
                }`}
              >
                <input
                  type="radio"
                  name="greeting"
                  className="mt-1 accent-lavender"
                  checked={value.greetingId === opt.id}
                  onChange={() => setGreeting(opt)}
                />
                {opt.custom ? (
                  <div className="flex-1">
                    <p className="text-sm font-body mb-2">Write your own message</p>
                    <textarea
                      maxLength={250}
                      rows={2}
                      placeholder="Your custom greeting (max 250 characters)…"
                      value={value.greetingId === opt.id ? value.greetingText : ''}
                      onFocus={() => setGreeting(opt)}
                      onChange={(e) => onChange({ greetingId: opt.id, greetingText: e.target.value })}
                      className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-body">&ldquo;{opt.text}&rdquo;</p>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* C. Assembly & delivery logistics */}
      <fieldset>
        <legend className="text-xs uppercase tracking-wide text-gold-700 font-body mb-3">
          3. Assembly &amp; delivery instructions
        </legend>
        <label className="block text-sm font-body text-charcoal/70 mb-2">
          Please specify any additional instructions regarding the assembly of
          the item and specific delivery details (e.g. pre-assembly
          requirements, preferred gift drop-off windows, hospital room access
          details, or gate codes).
        </label>
        <textarea
          rows={3}
          value={value.assemblyNotes}
          onChange={(e) => onChange({ assemblyNotes: e.target.value })}
          placeholder="Optional — leave blank if not applicable"
          className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
        />
      </fieldset>
    </div>
  );
}
