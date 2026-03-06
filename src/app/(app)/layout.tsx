'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/log',      label: 'Log',      icon: '📝' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/insights', label: 'Insights', icon: '📊' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-purple-50">

      {/* ── Top nav bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link
            href="/log"
            className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <span className="text-xl" aria-hidden="true">✨</span>
            <span className="font-bold text-gray-900 text-lg tracking-tight hidden sm:block">
              DailyMood
            </span>
          </Link>

          {/* Desktop nav — pill tabs */}
          <nav
            className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-full px-1.5 py-1.5"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    isActive
                      ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                      : 'text-gray-500 hover:text-gray-800',
                  ].join(' ')}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={[
              'shrink-0 text-sm font-medium text-gray-500 hover:text-gray-900',
              'transition-colors duration-150 px-3 py-1.5 rounded-full',
              'hover:bg-gray-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            ].join(' ')}
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden" aria-label="Logout">↩</span>
          </button>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 sm:pb-10">
        {children}
      </main>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
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
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
                isActive ? 'text-indigo-600' : 'text-gray-400',
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
