'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Background mesh */}
      <div className="bg-mesh" />

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open Source Task Management
          </div> */}

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            Your tasks,{' '}
            <span className="gradient-text">simplified</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Streamline your workflow with our intuitive Kanban board. Effortlessly manage tasks, collaborate with your team, and achieve your goals with clarity and focus.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="btn-gradient text-base !py-3 !px-8 !rounded-xl inline-flex items-center gap-2"
            >
              Get Started
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="py-3 px-8 rounded-xl text-base font-medium text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '⚡',
              title: 'Effortless Organization',
              description:
                'Simply drag and drop tasks between columns to track progress. Your changes are saved automatically.',
            },
            {
              icon: '🛡️',
              title: 'Team Collaboration',
              description:
                'Assign tasks to team members and manage workloads with admin controls built right in.',
            },
            {
              icon: '🎨',
              title: 'Designed for Focus',
              description:
                'A clean, modern interface that keeps you focused on what matters — getting things done.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${i * 0.15}s`, animationFillMode: 'both' }}
            >
              <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">
                {feature.icon}
              </span>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs text-zinc-600">
            © {new Date().getFullYear()} TaskBoard
          </span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-600">v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
