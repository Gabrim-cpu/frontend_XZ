import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, MessageCircle, Video, ChevronDown } from 'lucide-react';
import logoWhite from '../Assets/logo_blanc-removebg-preview (1).png';
import laptopImg from '../Assets/intergenerational_laptop.png';

// The two words that swap in the hero headline.
const SWAP_WORDS = ['teach', 'learn'];

// Fires once when an element scrolls into view. Uses IntersectionObserver so it
// works regardless of which element is the scroll container.
function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      options || { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

const FEATURES = [
  {
    icon: Users,
    title: 'Matched by what matters',
    desc: 'A thoughtful matching algorithm connects you with mentors and learners based on shared interests and complementary skills.',
  },
  {
    icon: BookOpen,
    title: 'Learn and teach',
    desc: "Share what you know and learn what you don't. Every conversation is an opportunity for mutual growth.",
  },
  {
    icon: MessageCircle,
    title: 'Build strong roots',
    desc: 'Grow relationships through conversation, mentorship, and collaboration that last beyond any single interaction.',
  },
  {
    icon: Video,
    title: 'Preserve heritage',
    desc: 'Record stories, traditions, languages, and lived experience for future generations to learn from.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const sentinelRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [missionRef, missionInView] = useInView();

  // Swap the headline word between "teach" and "learn" on a loop.
  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % SWAP_WORDS.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  // Nav is transparent over the dark hero; once the top sentinel scrolls out of
  // view it fades into a translucent burgundy gradient you can see through.
  // IntersectionObserver is used because `body { overflow-x: hidden }` makes the
  // body the scroll container, so window.scrollY would never update.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      {/* Invisible top marker — when it leaves the viewport, the nav solidifies. */}
      <div ref={sentinelRef} aria-hidden className="absolute left-0 top-0 h-20 w-px" />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes kenBurns {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        @keyframes wordSwap {
          0% { opacity: 0; transform: translateY(-0.4em) rotateX(-90deg); }
          15%, 85% { opacity: 1; transform: translateY(0) rotateX(0); }
          100% { opacity: 0; transform: translateY(0.4em) rotateX(90deg); }
        }
        /* Organic morphing blob behind the mission heading. */
        @keyframes morph {
          0%, 100% { border-radius: 42% 58% 63% 37% / 42% 45% 55% 58%; transform: rotate(0deg) scale(1); }
          33% { border-radius: 58% 42% 38% 62% / 63% 37% 63% 37%; transform: rotate(6deg) scale(1.05); }
          66% { border-radius: 38% 62% 58% 42% / 40% 60% 40% 60%; transform: rotate(-6deg) scale(0.97); }
        }
        .morph-blob { animation: morph 14s ease-in-out infinite; }
        /* Scroll reveal: rises and de-blurs into place. */
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(28px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .reveal-init { opacity: 0; }
        .reveal-in { animation: revealUp 1s cubic-bezier(0.22, 0.7, 0.2, 1) both; }
        .reveal-in-delayed { animation: revealUp 1s cubic-bezier(0.22, 0.7, 0.2, 1) 0.22s both; }
        .reveal { animation: fadeUp 0.7s ease-out both; }
        .reveal-100 { animation-delay: 0.1s; }
        .reveal-200 { animation-delay: 0.2s; }
        .reveal-300 { animation-delay: 0.3s; }
        .word-swap {
          display: inline-block;
          animation: wordSwap 2.4s ease-in-out both;
          transform-origin: center;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .ken-burns, .word-swap, .morph-blob { animation: none !important; }
          .reveal-init { opacity: 1; }
          .reveal-in, .reveal-in-delayed { animation: none !important; opacity: 1; }
        }
      `}</style>

      {/* Navigation — fixed overlay so the hero shows through when transparent */}
      <nav
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-gradient-to-r from-brand-burgundy/70 to-brand-burgundy/45 backdrop-blur-md shadow-md'
            : 'bg-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <img src={logoWhite} alt="XZ" className="h-10 w-10 sm:h-12 sm:w-12" />
            <span className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Digital Roots
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/login')}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:text-white sm:px-5 sm:text-base min-h-[44px]"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-burgundy transition-all hover:bg-white/90 sm:px-6 sm:text-base min-h-[44px]"
            >
              Join XZ
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — single static background image. `bg-gray-900` is the fallback
          so text stays legible even if the image is slow to load. */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-gray-900 px-5 py-20 sm:px-6">
        {/* Background */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img
            src={laptopImg}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
          {/* Legibility overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center text-white">
          <h1 className="reveal text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Every generation has something to{' '}
            <span
              key={wordIndex}
              className="word-swap text-amber-300"
              style={{ perspective: '600px' }}
            >
              {SWAP_WORDS[wordIndex]}
            </span>
            .
          </h1>
          <p className="reveal reveal-200 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-100 sm:text-lg md:text-xl">
            From digital skills to cultural heritage, XZ builds meaningful connections between
            youth and elders through reciprocal learning and authentic conversation.
          </p>
          <div className="reveal reveal-300 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/register')}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-burgundy px-8 py-4 text-base font-bold text-white transition-all hover:bg-opacity-90 sm:w-auto min-h-[56px]"
            >
              Join XZ today <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full rounded-full border border-white/70 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto min-h-[56px]"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/70">
          <ChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* Mission */}
      <section
        ref={missionRef}
        className="relative overflow-hidden px-5 py-24 sm:px-6 sm:py-32"
      >
        {/* Morphing blob backdrop */}
        <div
          aria-hidden
          className="morph-blob pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-brand-burgundy/10 via-brand-roseMuted/10 to-amber-100/20 blur-2xl sm:h-[30rem] sm:w-[30rem]"
        />
        <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
          <p className={`text-sm font-semibold uppercase tracking-[0.2em] text-brand-burgundy ${missionInView ? 'reveal-in' : 'reveal-init'}`}>
            Our purpose
          </p>
          <h2 className={`font-display text-4xl font-semibold tracking-tight sm:text-5xl ${missionInView ? 'reveal-in' : 'reveal-init'}`}>
            Why XZ exists
          </h2>
          <p className={`text-base leading-relaxed text-gray-600 sm:text-lg ${missionInView ? 'reveal-in-delayed' : 'reveal-init'}`}>
            Modern technology connects millions, yet generations drift further apart. Valuable
            knowledge is lost while digital opportunity stays out of reach for many. XZ bridges
            that gap — a place where youth and elders learn from one another, exchange skills, and
            preserve cultural heritage together.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold sm:mb-16 sm:text-4xl">
            Meaningful connections, by design
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 transition-shadow hover:shadow-lg sm:p-8"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-burgundy/5 text-brand-burgundy">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-xl font-bold sm:text-2xl">{feature.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roots strength */}
      <section className="px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Relationships that grow over time</h2>
          <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
            Unlike networks that measure popularity, XZ measures the strength of meaningful
            connection. Every conversation, lesson, and shared experience helps your roots grow
            deeper.
          </p>
          <div className="inline-flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 text-left shadow-sm sm:px-8 sm:py-6">
            <span className="text-3xl font-bold text-brand-burgundy">→</span>
            <div>
              <div className="text-sm font-semibold text-gray-500">Meaningful growth comes from</div>
              <div className="text-lg font-bold sm:text-xl">Real connections, not metrics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-burgundy px-5 py-20 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Your knowledge matters. So does theirs.</h2>
          <p className="text-base leading-relaxed text-white/90 sm:text-lg">
            Join a new generation of learners, mentors, storytellers, and innovators building
            stronger communities together.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="mx-auto flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand-burgundy transition-all hover:bg-white/90 sm:w-auto min-h-[56px]"
          >
            Start building your roots <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-gray-900 px-5 py-10 text-gray-400 sm:px-6 sm:py-12"
        style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <img src={logoWhite} alt="XZ" className="h-10 w-10" />
            <span className="font-display text-2xl font-semibold tracking-tight text-white">
              Digital Roots
            </span>
          </div>
          <p className="text-sm">Bridging generations through knowledge, stories, and connection.</p>
          <p className="mt-3 text-sm">© 2026 Digital Roots. Every generation has something to teach.</p>
        </div>
      </footer>
    </div>
  );
}
