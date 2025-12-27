import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export const metadata = {
  title: 'Contact | Commons',
  description: 'Get in touch - questions, station submissions, or just say hi.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
                  <path d="M7.76 7.76a6 6 0 0 0 0 8.49" />
                  <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
                  <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Commons</h1>
                <p className="text-xs text-zinc-500">Community radio for all</p>
              </div>
            </Link>
            <Link
              href="/"
              className="text-sm text-zinc-600 hover:text-teal-600 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to stations
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">Get in Touch</h2>
          <p className="text-zinc-500">
            Questions, station submissions, feedback, or just want to say hi? Drop me a line.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <ContactForm />
        </div>

      </main>
    </div>
  )
}
