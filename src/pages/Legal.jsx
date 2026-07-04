import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logoXZ from '../Assets/XZ_RED-removebg-preview.png';

// Shared shell for the legal / policy pages linked from the landing footer.
function LegalLayout({ title, updated, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 sm:px-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 hover:opacity-80 transition">
            <img src={logoXZ} alt="XZ" className="h-12 w-12" />
            <span className="font-display text-lg font-semibold tracking-tight text-brand-burgundy">Digital Roots</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-gray-500 transition hover:text-brand-burgundy min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-gray-400">Last updated: {updated}</p>
        <div className="prose-xz mt-10 space-y-8">{children}</div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-5 py-8 text-center text-sm text-gray-400">
        © 2026 Digital Roots · XZ — Every generation has something to teach.
      </footer>
    </div>
  );
}

function Section({ heading, children }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-brand-burgundy">{heading}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <Section heading="What we collect">
        <p>
          When you create an account we ask for your name, email address, age (to place you in the
          Youth or Senior community), preferred language, and — optionally — a photo, a short bio,
          and the interests you want to teach or learn.
        </p>
        <p>
          As you use XZ we also store the content you create: posts, stories, comments, messages,
          voice recordings, and 24-hour statuses.
        </p>
      </Section>
      <Section heading="How we use it">
        <p>
          Your profile and interests power our matching — connecting you with people you can teach
          and learn from. Your content is shown to the community according to its visibility rules:
          statuses are visible only to your accepted connections and disappear after 24 hours;
          private messages are visible only to you and the recipient.
        </p>
        <p>We never sell your personal information to anyone.</p>
      </Section>
      <Section heading="Where it lives">
        <p>
          Account data is stored on our servers; sign-in is handled by Google Firebase
          Authentication. Photos, videos, and voice recordings are stored on our media servers.
        </p>
      </Section>
      <Section heading="Your rights">
        <p>
          You can edit your profile at any time from Settings. You may request a copy of your data
          or the deletion of your account and everything attached to it by contacting us — we will
          honour the request within 30 days.
        </p>
      </Section>
      <Section heading="Contact">
        <p>
          Questions about this policy? Write to us at{' '}
          <a href="mailto:hello@digitalroots-xz.duckdns.org" className="font-semibold text-brand-burgundy underline">
            hello@digitalroots-xz.duckdns.org
          </a>.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function TermsOfUse() {
  return (
    <LegalLayout title="Terms of Use" updated="July 2026">
      <Section heading="Welcome to XZ">
        <p>
          Digital Roots ("XZ") is a reciprocal knowledge network that connects generations. By
          creating an account you agree to these terms.
        </p>
      </Section>
      <Section heading="Your account">
        <p>
          You must provide accurate information, including your real age — it determines whether
          you join as a Youth or a Senior, which the community relies on. You are responsible for
          keeping your password safe and for everything done from your account.
        </p>
      </Section>
      <Section heading="Your content">
        <p>
          Everything you share — stories, recordings, posts, messages — remains yours. By posting
          it you give XZ permission to display it within the platform according to its visibility
          rules. You must own or have the right to share anything you publish.
        </p>
      </Section>
      <Section heading="Acceptable use">
        <p>
          XZ exists for mentorship, learning, and the preservation of heritage. Harassment, hate
          speech, impersonation, scams, and any exploitation of other members — particularly across
          age groups — are strictly forbidden and lead to removal.
        </p>
      </Section>
      <Section heading="Ending the relationship">
        <p>
          You may delete your account at any time. We may suspend accounts that break these terms,
          after review by our moderators.
        </p>
      </Section>
      <Section heading="Liability">
        <p>
          XZ is provided "as is". We work hard to keep the platform available and safe, but we
          cannot guarantee uninterrupted service and are not liable for content posted by members.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function CommunityGuidelines() {
  return (
    <LegalLayout title="Community Guidelines" updated="July 2026">
      <Section heading="Respect every generation">
        <p>
          XZ brings together people from very different walks of life. Speak to elders and youth
          alike with patience and dignity. Disagreement is welcome; disrespect is not.
        </p>
      </Section>
      <Section heading="Teach honestly, learn humbly">
        <p>
          Share what you genuinely know. Don't present opinions as expertise, and credit the
          traditions and people your knowledge comes from.
        </p>
      </Section>
      <Section heading="Protect privacy">
        <p>
          Never share another member's personal details, photos, or recordings outside the
          platform without their clear permission. What is told to you in a mentorship stays
          between you.
        </p>
      </Section>
      <Section heading="Keep heritage sacred">
        <p>
          Stories and oral archives are contributions to a living heritage. Treat them with care:
          no mockery, no misappropriation, no editing someone's story without their consent.
        </p>
      </Section>
      <Section heading="Report, don't retaliate">
        <p>
          If you see behaviour that breaks these guidelines, report it from the app or contact us.
          Our moderators review every report. Content that violates the rules is removed and
          repeat offenders lose their account.
        </p>
      </Section>
    </LegalLayout>
  );
}
