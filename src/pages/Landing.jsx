import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import logoWhite from '../Assets/logo_blanc-removebg-preview (1).png';
import logoRed from '../Assets/XZ_RED-removebg-preview.png';
import laptopImg from '../Assets/intergenerational_laptop.png';
import genXImg from '../Assets/Gen_X-removebg-preview.png';
import genZImg from '../Assets/gen_z-removebg-preview.png';
import mentorLibraryImg from '../Assets/pexels-kampus-7983556.jpg';
import bookTogetherImg from '../Assets/pexels-kampus-7551623.jpg';
import storyReadingImg from '../Assets/pexels-kampus-7551618.jpg';
import tableTalkImg from '../Assets/pexels-kampus-7551632.jpg';

// The words that rotate in the hero headline.
const SWAP_WORDS = ['teach', 'learn', 'share', 'preserve', 'build', 'pass on'];

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

<<<<<<< HEAD
// Generation X arrives from the left, Generation Z from the right, and the XZ
// badge links them in the middle — the match, acted out.
function GenerationsMeet() {
  const [ref, inView] = useInView({ threshold: 0.35 });
  return (
    <div ref={ref} className="relative pt-4 sm:pt-6" aria-label="Generation X and Generation Z connected by XZ">
      <div className="flex items-end justify-center">
        {/* Generation X */}
        <div className={`flex min-w-0 flex-col items-center ${inView ? 'gen-arrive-left' : 'gen-hidden'}`}>
          <img
            src={genXImg}
            alt="Generation X — a group of older adults observing with curiosity"
            loading="lazy"
            draggable="false"
            className="h-48 w-auto max-w-full select-none object-contain sm:h-72"
          />
          <span className="mt-3 rounded-full bg-brand-burgundy px-3.5 py-1.5 text-xs font-bold tracking-wide text-white shadow-md sm:px-5 sm:text-base">
            Generation X
          </span>
          <span className="mt-1.5 text-[11px] font-medium text-gray-500 sm:text-sm">Wisdom to share</span>
        </div>

        {/* The connection XZ creates */}
        <div className="relative z-10 -mx-3 flex w-20 flex-none items-center justify-center self-center sm:-mx-2 sm:w-28">
          <svg viewBox="0 0 112 16" className={`absolute inset-x-0 w-full ${inView ? 'gen-link' : 'opacity-0'}`} aria-hidden="true">
            <line
              x1="6" y1="8" x2="106" y2="8"
              stroke="#740A03" strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray="1 11" className="gen-link-flow"
            />
          </svg>
          <div className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-brand-burgundy/15 sm:h-14 sm:w-14 ${inView ? 'gen-pop' : 'opacity-0'}`}>
            <img src={logoRed} alt="" className="h-5 w-auto sm:h-6" draggable="false" />
          </div>
        </div>

        {/* Generation Z */}
        <div className={`flex min-w-0 flex-col items-center ${inView ? 'gen-arrive-right' : 'gen-hidden'}`}>
          <img
            src={genZImg}
            alt="Generation Z — a group of young people on their phones"
            loading="lazy"
            draggable="false"
            className="h-52 w-auto max-w-full select-none object-contain sm:h-80"
          />
          <span className="mt-3 rounded-full bg-[#9C3325] px-3.5 py-1.5 text-xs font-bold tracking-wide text-white shadow-md sm:px-5 sm:text-base">
            Generation Z
          </span>
          <span className="mt-1.5 text-[11px] font-medium text-gray-500 sm:text-sm">Curiosity to learn</span>
        </div>
      </div>
    </div>
  );
}

=======
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
/* ---- Premium duotone spot illustrations.
   Strict palette: brand burgundy (#740A03 + its shades), amber accent,
   and warm neutral creams. Nothing else. ---- */

// An elder passing an open book to a youth — silhouettes in burgundy,
// the knowledge itself carrying the single amber accent.
function GenerationsIllustration({ className }) {
  return (
    <svg viewBox="0 0 260 170" fill="none" className={className} aria-hidden="true">
      {/* warm backdrop blob */}
      <path
        d="M130 6c62 0 118 30 118 80 0 48-50 76-118 76S12 134 12 86C12 36 68 6 130 6z"
        fill="#F6EFE7"
      />
      {/* ground shadows */}
      <ellipse cx="64" cy="142" rx="34" ry="6" fill="#EADFD2" />
      <ellipse cx="196" cy="142" rx="30" ry="6" fill="#EADFD2" />
      {/* dotted arc of exchange */}
      <path
        d="M84 44C108 26 156 28 176 48"
        stroke="#740A03"
        strokeOpacity="0.28"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="0.5 9"
      />
      {/* elder — silhouette with bun, deep burgundy */}
      <path d="M36 142c0-32 12-48 28-48s28 16 28 48z" fill="#740A03" />
      <circle cx="64" cy="70" r="18" fill="#740A03" />
      <circle cx="46" cy="54" r="7" fill="#740A03" />
      <path d="M84 108c14-4 26-6 36-5" stroke="#740A03" strokeWidth="11" strokeLinecap="round" />
      {/* youth — smaller silhouette, lighter burgundy shade */}
      <path d="M168 142c0-27 11-41 25-41s25 14 25 41z" fill="#9C3325" />
      <circle cx="193" cy="80" r="15" fill="#9C3325" />
      <path d="M176 112c-12-4-24-6-34-6" stroke="#9C3325" strokeWidth="10" strokeLinecap="round" />
      {/* the open book passing between them — the amber accent */}
      <path d="M131 90c-8-6-17-8-24-6v16c7-2 16 0 24 6z" fill="#FCD34D" />
      <path d="M131 90c8-6 17-8 24-6v16c-7 2-16 0-24 6z" fill="#F59E0B" />
      <path d="M131 90v16" stroke="#FFFFFF" strokeWidth="1.5" />
      {/* sparkles rising off the book */}
      <path d="M131 58l3.2 8 8 3.2-8 3.2-3.2 8-3.2-8-8-3.2 8-3.2z" fill="#F59E0B" />
      <path d="M156 68l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FCD34D" />
      <circle cx="110" cy="62" r="2.5" fill="#F59E0B" opacity="0.6" />
    </svg>
  );
}

// A tree whose roots run as deep as its canopy — connection that grows.
function RootsTreeIllustration({ className }) {
  return (
    <svg viewBox="0 0 240 230" fill="none" className={className} aria-hidden="true">
      {/* warm backdrop */}
      <ellipse cx="120" cy="100" rx="104" ry="94" fill="#F6EFE7" />
      {/* layered canopy — two amber tones only */}
      <circle cx="120" cy="64" r="44" fill="#F59E0B" />
      <circle cx="86" cy="84" r="30" fill="#F59E0B" />
      <circle cx="154" cy="84" r="30" fill="#F59E0B" />
      <circle cx="120" cy="88" r="34" fill="#FCD34D" />
      {/* fruit */}
      <circle cx="98" cy="58" r="4" fill="#740A03" />
      <circle cx="144" cy="62" r="4" fill="#740A03" />
      <circle cx="118" cy="92" r="4" fill="#740A03" />
      <circle cx="158" cy="94" r="4" fill="#740A03" />
      <circle cx="82" cy="92" r="4" fill="#740A03" />
      {/* perched bird — burgundy silhouette */}
      <path d="M158 36c0-7 5-12 12-12s12 5 12 11c0 8-7 12-13 12-6 0-11-5-11-11z" fill="#740A03" />
      <path d="M182 33l8 3-8 3z" fill="#4A0602" />
      <circle cx="176" cy="32" r="1.5" fill="#FFFFFF" />
      {/* trunk — burgundy, matching the roots */}
      <path d="M112 108c2 20 1 38-6 60h28c-7-22-8-40-6-60z" fill="#740A03" />
      <path d="M116 122l-14-12M124 122l14-12" stroke="#740A03" strokeWidth="5" strokeLinecap="round" />
      {/* ground */}
      <path d="M28 168c26-10 158-10 184 0z" fill="#EDE2D1" />
      <path d="M20 168h200" stroke="#E3D5C0" strokeWidth="3" strokeLinecap="round" />
      {/* roots mirroring the canopy */}
      <path
        d="M120 168v42M120 176c-12 12-28 16-44 18M120 176c12 12 28 16 44 18M120 190c-7 10-15 15-23 19M120 190c7 10 15 15 23 19"
        stroke="#740A03"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Two speech bubbles trading knowledge — used on the dark CTA band.
function ExchangeIllustration({ className }) {
  return (
    <svg viewBox="0 0 220 130" fill="none" className={className} aria-hidden="true">
      {/* left bubble (with drop shadow) */}
      <rect x="23" y="21" width="96" height="56" rx="16" fill="#4A0602" />
      <path d="M49 77l-6 20 24-20z" fill="#4A0602" />
      <rect x="18" y="16" width="96" height="56" rx="16" fill="#FFFFFF" />
      <path d="M44 72l-6 20 24-20z" fill="#FFFFFF" />
      <path d="M38 38h58" stroke="#740A03" strokeWidth="4" strokeLinecap="round" />
      <path d="M38 52h40" stroke="#740A03" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
      {/* right bubble (with drop shadow) */}
      <rect x="127" y="47" width="80" height="52" rx="16" fill="#4A0602" />
      <path d="M185 99l6 18-22-18z" fill="#4A0602" />
      <rect x="122" y="42" width="80" height="52" rx="16" fill="#FCD34D" />
      <path d="M180 94l6 18-22-18z" fill="#FCD34D" />
      <path
        d="M162 82c-10-6-16-12-16-19 0-5 4-9 9-9 3 0 6 2 7 5 1-3 4-5 7-5 5 0 9 4 9 9 0 7-6 13-16 19z"
        fill="#740A03"
      />
      {/* sparkles */}
      <path d="M110 8l2.5 6.5 6.5 2.5-6.5 2.5-2.5 6.5-2.5-6.5-6.5-2.5 6.5-2.5z" fill="#FCD34D" />
      <circle cx="206" cy="24" r="3" fill="#FFFFFF" opacity="0.7" />
      <circle cx="14" cy="96" r="3" fill="#FCD34D" />
    </svg>
  );
}

<<<<<<< HEAD
// The app's real functions, shown as photo cards. Each one is a link.
=======
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
const FEATURES = [
  {
    img: mentorLibraryImg,
    chip: 'Mentorship',
    title: 'Matched by What Matters',
    desc: 'A thoughtful matching algorithm connects you with mentors and learners based on shared interests and complementary skills.',
    cta: 'Find your match',
  },
  {
    img: bookTogetherImg,
    chip: 'Wisdom Hub',
    title: 'Learn from Those Who Lived It',
    desc: 'Elders share curated guides, life lessons, cultural knowledge, and mentorship — while younger members gain the insight that only lived experience can provide.',
    cta: 'Explore wisdom',
  },
  {
    img: storyReadingImg,
    chip: 'Oral Archive',
    title: 'Preserve Voices Forever',
    desc: 'Record stories, traditions, and languages as audio memoirs — kept safe for the generations that follow.',
    cta: 'Start recording',
  },
  {
    img: tableTalkImg,
    chip: 'Messages & Calls',
    title: 'Talk Across Generations',
    desc: 'Voice notes, private messages, and live video sessions keep every mentorship close, wherever life happens.',
    cta: 'Start a conversation',
  },
];

/* ---- "How a match happens" — a faithful replica of the in-app Mentorship
   discover cards. Two profiles reveal, the interests they share light up,
   and the reciprocal match appears — exactly how XZ matches people. ---- */

const JOURNEY = ['Connect', 'Chat', 'Learn Together', 'Grow Your Roots', 'Legacy Connection'];

const DEMO_SHARED = ['Entrepreneurship', 'Traditional Cooking'];

const DEMO_PEOPLE = [
  {
    name: 'Jessica', age: 22, role: 'Youth', initial: 'J', from: 'left', appearAt: 1,
    bio: 'Computer science student. I can help with phones, apps and video editing.',
    interests: ['Technology', 'Video Editing', 'Entrepreneurship', 'Traditional Cooking'],
  },
  {
    name: 'Mama Rose', age: 68, role: 'Senior', initial: 'R', from: 'right', appearAt: 2,
    bio: 'Retired restaurateur — 40 years of recipes, market wisdom and stories to pass on.',
    interests: ['Entrepreneurship', 'Traditional Cooking', 'History', 'Health & Wellness'],
  },
];

// Mirrors the PersonCard component users see in the Mentorship tab.
function AppMatchCard({ person, stage }) {
  const visible = stage >= person.appearAt;
  return (
    <div
      className={`flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-700 ease-out ${
        visible ? 'translate-x-0 opacity-100' : `opacity-0 ${person.from === 'left' ? '-translate-x-10' : 'translate-x-10'}`
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-burgundy text-lg font-bold text-white">
          {person.initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900">{person.name}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-burgundy">
            {person.role} · {person.age}
          </p>
          <span
            className={`mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 transition-opacity duration-500 ${
              stage >= 4 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            ✦ 96% match
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm italic leading-relaxed text-gray-500">"{person.bio}"</p>
      <div className="mt-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Interests & topics</p>
        <div className="flex flex-wrap gap-1.5">
          {person.interests.map((tag) => {
            const lit = DEMO_SHARED.includes(tag) && stage >= 3;
            return (
              <span
                key={tag}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-500 ${
                  lit
                    ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm'
                    : 'border-brand-burgundy/25 text-brand-burgundy'
                }`}
              >
                {lit && '★ '}{tag}
              </span>
            );
          })}
        </div>
      </div>
      <div
        className={`mt-4 w-full rounded-xl bg-brand-burgundy py-2.5 text-center text-sm font-semibold text-white transition-opacity duration-500 ${
          stage >= 4 ? 'opacity-100' : 'opacity-40'
        }`}
      >
        Request session
      </div>
    </div>
  );
}

function MatchShowcase({ onStart }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const [stage, setStage] = useState(0);

  // Advance the scene once it scrolls into view.
  useEffect(() => {
    if (!inView) return;
    const steps = [
      [1, 100],    // Jessica in
      [2, 600],    // Mama Rose in
      [3, 1200],   // exchange lines draw
      [4, 2200],   // seedling + matched badge
      [5, 2900],   // score, CTA, journey timeline
    ];
    const ids = steps.map(([s, delay]) => setTimeout(() => setStage(s), delay));
    return () => ids.forEach(clearTimeout);
  }, [inView]);

  return (
    <section ref={ref} className="bg-gray-50 px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-burgundy">How a match happens</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Every connection starts with shared interests.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            This is the real matching screen inside XZ: profiles are compared by the interests
            they declare, and the ones you have in common light the way.
          </p>
        </div>

        <div className="relative mt-12 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          {/* The two profiles, exactly as they appear in the Mentorship tab */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            {DEMO_PEOPLE.map((person) => (
              <AppMatchCard key={person.name} person={person} stage={stage} />
            ))}
          </div>

          {/* Shared-interest legend */}
          <div
            className={`mt-5 flex flex-wrap items-center justify-center gap-2 text-sm transition-all duration-500 ${
              stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <span className="rounded-lg border border-amber-400 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">★</span>
            <span className="font-semibold text-gray-700">2 shared interests found</span>
            <span className="text-gray-400">— Reciprocal connection.</span>
          </div>

          {/* Compatibility */}
          <div
            className={`mt-8 border-t border-gray-100 pt-6 text-center transition-all duration-700 ${
              stage >= 5 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Reciprocal Match</p>
            <p className="mt-1 font-display text-5xl font-semibold text-brand-burgundy">96%</p>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">Because you can learn from each other.</p>
            <button
              onClick={onStart}
              className="mx-auto mt-5 flex items-center justify-center gap-2 rounded-full bg-brand-burgundy px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-opacity-90 min-h-[48px]"
            >
              Start Connection <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* What happens after — journey timeline */}
        <div className="mt-12 overflow-x-auto pb-2">
          <div className="mx-auto flex min-w-[560px] max-w-3xl items-start">
            {JOURNEY.map((step, i) => (
              <React.Fragment key={step}>
                {i > 0 && (
                  <div className="mt-[7px] h-[2px] flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full origin-left bg-brand-burgundy transition-transform duration-500 ease-out ${
                        stage >= 5 ? 'scale-x-100' : 'scale-x-0'
                      }`}
                      style={{ transitionDelay: `${i * 320}ms` }}
                    />
                  </div>
                )}
                <div
                  className={`flex w-24 flex-col items-center gap-2 transition-all duration-500 ${
                    stage >= 5 ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                  }`}
                  style={{ transitionDelay: `${i * 320 + 120}ms` }}
                >
                  <span className={`h-4 w-4 rounded-full border-2 ${i === JOURNEY.length - 1 ? 'border-amber-500 bg-amber-400' : 'border-brand-burgundy bg-brand-burgundy'}`} />
                  <span className="text-center text-[11px] font-bold leading-tight text-gray-700">{step}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

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
        /* Generations meet: X walks in from the left, Z from the right,
           then the XZ badge pops in and pulses between them. */
        @keyframes genArriveLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes genArriveRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes genPop {
          0% { opacity: 0; transform: scale(0.3); }
          70% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes genGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(116, 10, 3, 0.28); }
          50% { box-shadow: 0 0 0 14px rgba(116, 10, 3, 0); }
        }
        @keyframes genLinkIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes genFlow { to { stroke-dashoffset: -24; } }
        .gen-hidden { opacity: 0; }
        .gen-arrive-left { animation: genArriveLeft 1.1s cubic-bezier(0.22, 0.7, 0.2, 1) both; }
        .gen-arrive-right { animation: genArriveRight 1.1s cubic-bezier(0.22, 0.7, 0.2, 1) both; }
        .gen-pop {
          animation:
            genPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s both,
            genGlow 2.6s ease-in-out 1.8s infinite;
        }
        .gen-link { animation: genLinkIn 0.8s ease 0.75s both; }
        .gen-link-flow { animation: genFlow 1.2s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .ken-burns, .word-swap, .morph-blob { animation: none !important; }
          .reveal-init { opacity: 1; }
          .reveal-in, .reveal-in-delayed { animation: none !important; opacity: 1; }
          .gen-hidden { opacity: 1; }
          .gen-arrive-left, .gen-arrive-right, .gen-pop, .gen-link, .gen-link-flow {
            animation: none !important;
            opacity: 1;
          }
        }
      `}</style>

      {/* Navigation — fixed overlay so the hero shows through when transparent */}
      <nav
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-brand-burgundy/95 shadow-lg backdrop-blur-xl'
            : 'bg-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
<<<<<<< HEAD
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img src={logoWhite} alt="XZ" className="h-16 w-16 sm:h-20 sm:w-20" />
            <span className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
=======
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <img src={logoWhite} alt="XZ" className="h-14 w-14 sm:h-16 sm:w-16" />
            <span className="font-display text-base font-semibold tracking-tight text-white sm:text-lg">
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
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

      {/* Hero  */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-gray-900 px-5 py-20 sm:px-6">
        {/* Background */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <img
            src={laptopImg}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
          {/* Legibility overlay — anchored left so the people stay visible on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Content — left-aligned so the photo breathes */}
        <div className="relative z-10 mx-auto w-full max-w-6xl text-white">
          <div className="max-w-xl text-left">
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
<<<<<<< HEAD
          <p className="reveal reveal-200 mt-6 max-w-lg text-base leading-relaxed text-gray-100 sm:text-lg md:text-xl">
=======
          <p className="reveal reveal-200 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-100 sm:text-lg md:text-xl">
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
           Connect with someone from another generation to exchange skills, preserve culture, and grow meaningful relationships powered by reciprocal learning.
          </p>
          <div className="reveal reveal-300 mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => navigate('/register')}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-burgundy px-8 py-4 text-base font-bold text-white transition-all hover:bg-opacity-90 sm:w-auto min-h-[56px]"
            >
              Join XZ today 
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full rounded-full border border-white/70 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto min-h-[56px]"
            >
              Sign in
            </button>
          </div>
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
          className="morph-blob pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-brand-burgundy/10 via-amber-100/30 to-amber-100/10 blur-2xl sm:h-[30rem] sm:w-[30rem]"
        />
<<<<<<< HEAD
        <div className="relative z-10 mx-auto max-w-4xl space-y-7 text-center">
          <div className={`flex items-center justify-center gap-1 text-2xl font-bold text-brand-burgundy sm:text-3xl ${missionInView ? 'reveal-in' : 'reveal-init'}`}>
            <span>Why</span>
            <img src={logoRed} alt="XZ" className="h-14 w-auto sm:h-20" />
            <span>exists</span>
          </div>
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {/* Struck through as you scroll to it... */}
            <span className={`relative inline-block transition-colors duration-700 ${missionInView ? 'text-gray-400' : 'text-black'}`} style={{ transitionDelay: '500ms' }}>
              Another social network.
              <span
                aria-hidden
                className={`absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full bg-brand-burgundy transition-transform duration-700 ease-out sm:h-[5px] ${
                  missionInView ? 'scale-x-100' : 'scale-x-0'
                }`}
                style={{ transformOrigin: 'left', transitionDelay: '500ms' }}
              />
            </span>
            <br />
            {/* ...and the truth rises in its place. */}
            <span
              className={`inline-block text-brand-burgundy transition-all duration-700 ease-out ${
                missionInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: '1300ms' }}
            >
              A reciprocal knowledge network.
            </span>
=======
        <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
          <GenerationsIllustration
            className={`mx-auto w-56 sm:w-72 ${missionInView ? 'reveal-in' : 'reveal-init'}`}
          />
          <h2 className={`font-display text-4xl font-semibold tracking-tight sm:text-5xl ${missionInView ? 'reveal-in' : 'reveal-init'}`}>
            Why XZ exists
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
          </h2>
          <p className={`text-lg leading-relaxed text-gray-600 sm:text-xl ${missionInView ? 'reveal-in-delayed' : 'reveal-init'}`}>
            XZ matches people based on reciprocal interests
            creating
            meaningful relationships.
          </p>
          <GenerationsMeet />
        </div>
      </section>

      {/* How a match happens — animated demonstration */}
      <MatchShowcase onStart={() => navigate('/register')} />

      {/* Features */}
      <section className="bg-gray-50 px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-display text-4xl font-semibold tracking-tight sm:mb-16 sm:text-5xl">
            Crafted with purpose and care.
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            {FEATURES.map((feature) => (
              <button
                key={feature.title}
                onClick={() => navigate('/register')}
                className="group overflow-hidden rounded-3xl border border-gray-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden sm:h-60">
                  <img
                    src={feature.img}
                    alt={feature.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute bottom-4 left-4 rounded-full bg-brand-burgundy px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                    {feature.chip}
                  </span>
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-gray-600">{feature.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-brand-burgundy transition-all group-hover:gap-3">
                    {feature.cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Roots strength */}
      <section className="px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-16">
<<<<<<< HEAD
          <div className="relative mx-auto w-full max-w-sm md:order-2">
            <div className="absolute -inset-3 rotate-2 rounded-3xl bg-amber-100/60" aria-hidden />
            <img
              src={laptopImg}
              alt="An elder and a young man learning together"
              loading="lazy"
              className="relative w-full rounded-3xl object-cover shadow-lg"
            />
          </div>
          <div className="space-y-6 text-center md:order-1 md:text-left">
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Relationships that grow over time</h2>
=======
          <RootsTreeIllustration className="mx-auto w-52 sm:w-64 md:order-2" />
          <div className="space-y-6 text-center md:order-1 md:text-left">
            <h2 className="text-3xl font-bold sm:text-4xl">Relationships that grow over time</h2>
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              Unlike networks that measure popularity, XZ measures the strength of meaningful
              connection. Every conversation, lesson, and shared experience helps your roots grow
              deeper.
            </p>
            <div className="inline-flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 text-left shadow-sm sm:px-8 sm:py-6">
<<<<<<< HEAD
        
=======
              <span className="text-3xl font-bold text-brand-burgundy">→</span>
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
              <div>
                <div className="text-sm font-semibold text-gray-500">Meaningful growth comes from</div>
                <div className="text-lg font-bold sm:text-xl">Real connections, not metrics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Final CTA  photo behind a deep burgundy wash */}
      <section className="relative overflow-hidden px-5 py-24 text-white sm:px-6 sm:py-32">
        <div className="absolute inset-0" aria-hidden="true">
          <img src={tableTalkImg} alt="" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#4A0602]/90 via-brand-burgundy/85 to-[#4A0602]/92" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Your wisdom is valuable. 
            So is theirs.</h2>
=======
      {/* Final CTA */}
      <section className="bg-brand-burgundy px-5 py-20 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <ExchangeIllustration className="mx-auto w-44 sm:w-52" />
          <h2 className="text-3xl font-bold sm:text-4xl">Your knowledge matters. So does theirs.</h2>
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
          <p className="text-base leading-relaxed text-white/90 sm:text-lg">
            Discover a different perspective on the next generation seeing their potential, skills, and unique contributions through fresh eyes.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="mx-auto flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand-burgundy transition-all hover:bg-white/90 sm:w-auto min-h-[56px]"
          >
            Bridge the gap <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-gray-900 text-gray-400"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
<<<<<<< HEAD
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <img src={logoWhite} alt="XZ" className="h-16 w-16" />
                <span className="font-display text-xl font-semibold tracking-tight text-white">
                  Digital Roots
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                A reciprocal knowledge network bridging generations through mentorship, stories,
                and living heritage.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Platform</h4>
              <ul className="space-y-2.5 text-sm">
                {['Mentorship Matching', 'Wisdom Hub', 'Oral Archive', 'Messages & Video Calls'].map((item) => (
                  <li key={item}>
                    <button onClick={() => navigate('/register')} className="transition-colors hover:text-white">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Community</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => navigate('/register')} className="transition-colors hover:text-white">Join XZ</button></li>
                <li><button onClick={() => navigate('/login')} className="transition-colors hover:text-white">Sign in</button></li>
                <li><button onClick={() => navigate('/register')} className="transition-colors hover:text-white">Become a mentor</button></li>
                <li><button onClick={() => navigate('/register')} className="transition-colors hover:text-white">Share your Wisdom</button></li>
              </ul>
            </div>

            {/* Legal / contact */}
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Support</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="mailto:hello@digitalroots-xz.duckdns.org?subject=Digital%20Roots%20support" className="transition-colors hover:text-white">Contact us</a></li>
                <li><button onClick={() => navigate('/privacy')} className="transition-colors hover:text-white">Privacy policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="transition-colors hover:text-white">Terms of use</button></li>
                <li><button onClick={() => navigate('/guidelines')} className="transition-colors hover:text-white">Community guidelines</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
            <p>© 2026 Digital Roots · XZ. All rights reserved.</p>
            <p>Made by Gabrielle Mayengo.</p>
=======
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <img src={logoWhite} alt="XZ" className="h-12 w-12" />
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              Digital Roots
            </span>
>>>>>>> b2021ffcc93ca5e5b22de55256ab3dd91726354b
          </div>
        </div>
      </footer>
    </div>
  );
}
