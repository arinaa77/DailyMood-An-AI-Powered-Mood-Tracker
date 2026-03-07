'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/log',      label: 'Log',      icon: '📝' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/insights', label: 'Insights', icon: '📊' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex">

      {/* ── Left sidebar (desktop) ─────────────────────────────────────── */}
      <aside
        className={[
          'hidden sm:flex flex-col sticky top-0 h-screen z-20',
          'bg-white/80 backdrop-blur-md border-r border-gray-200/60 shadow-sm',
          'transition-all duration-200 ease-in-out shrink-0',
          expanded ? 'w-52' : 'w-16',
        ].join(' ')}
      >
        {/* Brand */}
        <div className={[
          'flex items-center gap-3 px-3 py-5 border-b border-gray-100',
          expanded ? 'justify-start' : 'justify-center',
        ].join(' ')}>
          <Link
            href="/log"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg shrink-0"
          >
            <span
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-400 text-lg shadow-sm shadow-sky-100 shrink-0"
              aria-hidden="true"
            >
              ✨
            </span>
            {expanded && (
              <span className="font-bold text-gray-900 text-base tracking-tight whitespace-nowrap">
                DailyMood
              </span>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-4" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                title={!expanded ? label : undefined}
                className={[
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
                  expanded ? '' : 'justify-center',
                  isActive
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
                ].join(' ')}
              >
                {isActive && (
                  <span className="absolute left-0 w-1 h-8 bg-sky-400 rounded-r-full" aria-hidden="true" />
                )}
                <span className="text-lg leading-none shrink-0" aria-hidden="true">{icon}</span>
                {expanded && <span className="whitespace-nowrap">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout + collapse toggle */}
        <div className="flex flex-col gap-1 px-2 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            title={!expanded ? 'Logout' : undefined}
            className={[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
              'text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
              expanded ? '' : 'justify-center',
            ].join(' ')}
          >
            <span className="text-lg leading-none shrink-0" aria-hidden="true">↩</span>
            {expanded && <span>Logout</span>}
          </button>

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className={[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mt-1',
              'text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
              expanded ? '' : 'justify-center',
            ].join(' ')}
          >
            <span
              className={[
                'text-base leading-none shrink-0 transition-transform duration-200',
                expanded ? '' : 'rotate-180',
              ].join(' ')}
              aria-hidden="true"
            >
              ◀
            </span>
            {expanded && <span className="whitespace-nowrap">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Page content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 sm:pb-10">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ──────────────────────────────────────── */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur-md border-t border-gray-200/60 flex"
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5',
                'text-xs font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500',
                isActive ? 'text-sky-600' : 'text-gray-400',
              ].join(' ')}
            >
              <span className="text-lg leading-none" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
