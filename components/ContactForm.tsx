'use client'

import { useForm, ValidationError } from '@formspree/react'
import { useState, useEffect } from 'react'
import LocationAutocomplete from './LocationAutocomplete'

const categories = [
  { value: 'submission', label: 'Station Submission', icon: '📻' },
  { value: 'question', label: 'Question', icon: '💬' },
  { value: 'bug', label: 'Bug Report', icon: '🐛' },
  { value: 'feature', label: 'Feature Request', icon: '✨' },
  { value: 'hire', label: 'Hire Me', icon: '👋' },
]

const operatingSystems = [
  'macOS',
  'Windows',
  'iOS',
  'Android',
  'Linux',
  'Other',
]

const browsers = [
  'Chrome',
  'Safari',
  'Firefox',
  'Edge',
  'Arc',
  'Other',
]

const inputClass = "w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-zinc-400"

export default function ContactForm() {
  const [state, handleSubmit] = useForm('mvzoavyp')
  const [category, setCategory] = useState('submission')
  const [os, setOs] = useState('')
  const [browser, setBrowser] = useState('')
  const [otherOs, setOtherOs] = useState('')
  const [otherBrowser, setOtherBrowser] = useState('')

  const isSubmission = category === 'submission'
  const isBugReport = category === 'bug'

  // Auto-detect OS and browser for bug reports
  useEffect(() => {
    if (isBugReport && typeof window !== 'undefined') {
      const userAgent = navigator.userAgent
      // Detect OS
      if (userAgent.includes('Mac')) setOs('macOS')
      else if (userAgent.includes('Windows')) setOs('Windows')
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) setOs('iOS')
      else if (userAgent.includes('Android')) setOs('Android')
      else if (userAgent.includes('Linux')) setOs('Linux')

      // Detect browser
      if (userAgent.includes('Arc')) setBrowser('Arc')
      else if (userAgent.includes('Edg')) setBrowser('Edge')
      else if (userAgent.includes('Chrome')) setBrowser('Chrome')
      else if (userAgent.includes('Firefox')) setBrowser('Firefox')
      else if (userAgent.includes('Safari')) setBrowser('Safari')
    }
  }, [isBugReport])

  if (state.succeeded) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-500/30 animate-[bounce_1s_ease-in-out]">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-zinc-900 mb-3">
          {isSubmission ? 'Station Submitted!' : 'Message Sent!'}
        </h3>
        <p className="text-zinc-500 max-w-sm mx-auto">
          {isSubmission
            ? "Thanks for the submission! I'll review it and add it if it meets the criteria."
            : "Thanks for reaching out. I'll get back to you soon."
          }
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category chips */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-3">
          What brings you here?
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                category === cat.value
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25 scale-105'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:scale-102'
              }`}
            >
              <span className="mr-1.5">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="category" value={category} />
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="group">
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
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
        <div className="group">
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
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

      {/* Station submission fields */}
      {isSubmission && (
        <div className="space-y-5 p-5 bg-gradient-to-br from-zinc-50 to-zinc-100/50 rounded-2xl border border-zinc-200/50">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Please provide as much info as possible. Stream must be HTTPS.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group">
              <label htmlFor="stationName" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
                Station Name <span className="text-teal-500">*</span>
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
            <div className="group">
              <label htmlFor="callSign" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
                Call Sign
              </label>
              <input
                id="callSign"
                type="text"
                name="callSign"
                placeholder="If different from name"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group">
              <label htmlFor="frequency" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
                Frequency <span className="text-teal-500">*</span>
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
            <div className="group">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
                Location <span className="text-teal-500">*</span>
              </label>
              <LocationAutocomplete inputClass={inputClass} />
            </div>
          </div>

          <div className="group">
            <label htmlFor="streamUrl" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
              Stream URL <span className="text-teal-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="streamUrl"
                type="url"
                name="streamUrl"
                required
                pattern="https://.*"
                title="Stream URL must use HTTPS"
                placeholder="https://stream.example.com/live.mp3"
                className={`${inputClass} pl-11`}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
              Must be HTTPS. Direct audio stream URL, not a webpage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group">
              <label htmlFor="website" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
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
            <div className="group">
              <label htmlFor="donateUrl" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
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

          <div className="group">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
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

      {/* Bug report fields */}
      {isBugReport && (
        <div className="space-y-5 p-5 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl border border-amber-200/50">
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Help us squash the bug! System info auto-detected.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group">
              <label htmlFor="os" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
                Operating System
              </label>
              <div className="relative">
                <select
                  id="os"
                  name="os"
                  value={os}
                  onChange={(e) => setOs(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Select OS...</option>
                  {operatingSystems.map((osOption) => (
                    <option key={osOption} value={osOption}>{osOption}</option>
                  ))}
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {os === 'Other' && (
                <input
                  type="text"
                  name="osOther"
                  value={otherOs}
                  onChange={(e) => setOtherOs(e.target.value)}
                  placeholder="Please specify..."
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>
            <div className="group">
              <label htmlFor="browser" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
                Browser
              </label>
              <div className="relative">
                <select
                  id="browser"
                  name="browser"
                  value={browser}
                  onChange={(e) => setBrowser(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Select browser...</option>
                  {browsers.map((browserOption) => (
                    <option key={browserOption} value={browserOption}>{browserOption}</option>
                  ))}
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {browser === 'Other' && (
                <input
                  type="text"
                  name="browserOther"
                  value={otherBrowser}
                  onChange={(e) => setOtherBrowser(e.target.value)}
                  placeholder="Please specify..."
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hire me info */}
      {category === 'hire' && (
        <div className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50/50 rounded-2xl border border-teal-200/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-sm text-teal-800 leading-relaxed pt-2">
              Full stack software engineer with a decade of experience solving problems for media, arts, and non-profit organizations.
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      <div className="group">
        <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-1.5 group-focus-within:text-teal-600 transition-colors">
          {isSubmission ? 'Additional Notes' : isBugReport ? 'What happened?' : 'Message'}
          {!isSubmission && <span className="text-teal-500 ml-1">*</span>}
        </label>
        <textarea
          id="message"
          name="message"
          required={!isSubmission}
          rows={isSubmission ? 3 : 5}
          placeholder={
            isSubmission
              ? "Anything else we should know about this station?"
              : isBugReport
              ? "Describe what you expected vs. what actually happened..."
              : "Tell me what's on your mind..."
          }
          className={`${inputClass} resize-none`}
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-xs mt-1" />
      </div>

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 active:scale-[0.98] group cursor-pointer"
      >
        {state.submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {isSubmission ? 'Submit Station' : 'Send Message'}
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        )}
      </button>
    </form>
  )
}
