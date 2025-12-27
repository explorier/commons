'use client'

import { useForm, ValidationError } from '@formspree/react'
import { useState } from 'react'

const categories = [
  { value: 'submission', label: 'Station Submission' },
  { value: 'question', label: 'Question' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'hire', label: 'Hire Me' },
]

const inputClass = "w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-zinc-400"

export default function ContactForm() {
  const [state, handleSubmit] = useForm('mvzoavyp')
  const [category, setCategory] = useState('submission')

  const isSubmission = category === 'submission'

  if (state.succeeded) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/25">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-2">
          {isSubmission ? 'Station Submitted' : 'Message Sent'}
        </h3>
        <p className="text-zinc-500">
          {isSubmission
            ? "Thanks for the submission! I'll review it and add it if it meets the criteria."
            : "Thanks for reaching out. I'll get back to you soon."
          }
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            required
            placeholder="Your name"
            className={inputClass}
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-500 text-xs mt-1" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-xs mt-1" />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-zinc-700 mb-1.5">
          What's this about?
        </label>
        <div className="relative">
          <select
            id="category"
            name="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Station submission fields */}
      {isSubmission && (
        <div className="space-y-5 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
          <p className="text-xs text-zinc-500 -mt-1">
            Please provide as much info as possible. Stream must be HTTPS.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stationName" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Station Name *
              </label>
              <input
                id="stationName"
                type="text"
                name="stationName"
                required
                placeholder="e.g., WXYZ or The Local Sound"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="callSign" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Call Sign
              </label>
              <input
                id="callSign"
                type="text"
                name="callSign"
                placeholder="e.g., KEXP (if different from name)"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Frequency *
              </label>
              <input
                id="frequency"
                type="text"
                name="frequency"
                required
                placeholder="e.g., 90.3 FM or Internet"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Location *
              </label>
              <input
                id="location"
                type="text"
                name="location"
                required
                placeholder="e.g., Seattle, WA, USA"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="streamUrl" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Stream URL (HTTPS) *
            </label>
            <input
              id="streamUrl"
              type="url"
              name="streamUrl"
              required
              pattern="https://.*"
              title="Stream URL must use HTTPS"
              placeholder="https://stream.example.com/live.mp3"
              className={inputClass}
            />
            <p className="text-xs text-zinc-400 mt-1">Must be HTTPS. Direct audio stream URL, not a webpage.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Website
              </label>
              <input
                id="website"
                type="url"
                name="website"
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="donateUrl" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Donate URL
              </label>
              <input
                id="donateUrl"
                type="url"
                name="donateUrl"
                placeholder="https://example.com/donate"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Station Description
            </label>
            <input
              id="description"
              type="text"
              name="description"
              placeholder="Brief description of the station's format/focus"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Hire me info */}
      {category === 'hire' && (
        <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
          <p className="text-sm text-teal-800 leading-relaxed">
            Full stack software engineer with a decade of experience solving problems for media organizations.
          </p>
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-1.5">
          {isSubmission ? 'Additional Notes' : 'Message'}
        </label>
        <textarea
          id="message"
          name="message"
          required={!isSubmission}
          rows={isSubmission ? 3 : 5}
          placeholder={isSubmission
            ? "Anything else we should know about this station?"
            : "Tell me what's on your mind..."
          }
          className={`${inputClass} resize-none`}
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-xs mt-1" />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full py-3.5 px-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 active:scale-[0.98]"
      >
        {state.submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </span>
        ) : (
          isSubmission ? 'Submit Station' : 'Send Message'
        )}
      </button>
    </form>
  )
}
