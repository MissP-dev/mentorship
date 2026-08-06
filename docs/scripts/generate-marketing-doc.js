import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer } from '../../mconnect/backend/node_modules/docx/dist/index.mjs';
import {
  THEME, FONT, cover, headerFooter, h1, h2, p, bullet, callout, quote,
  tbl, tblGap, pageBreak,
} from './theme.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const coverChildren = cover({
  badge: 'M C O N N E C T',
  title: 'MConnect',
  subtitle: 'Marketing Plan & Go-To-Market Strategy',
  docType: 'Growth • Brand • Community',
  tagline: 'Take a great platform. Make it unmissable.',
  meta: [
    ['Document Type', 'Marketing Plan'],
    ['Version', '1.0'],
    ['Date', 'August 2026'],
    ['Status', 'Ready for launch'],
    ['Audience', 'Founding team, marketers, and partners'],
  ],
});

const children = [];
const C = children;

// ---------------- 1. EXECUTIVE SUMMARY ----------------
C.push(h1('1. Executive Summary'));
C.push(p('**MConnect** has built something people genuinely need: a free, all-in-one mentorship and networking platform. But a beautiful product no one knows about is a well-kept secret. This plan turns that secret into a movement.'));
C.push(p('Our strategy is simple: **be where learners already are, win trust through mentors, and turn every user into an ambassador.** We will combine content marketing, university and community partnerships, a mentor ambassador program, social media, referrals, and product-led growth — launching in three focused phases over 90 days.'));
C.push(p('The goal is not just sign-ups. It is a **self-sustaining community loop**: learners arrive for guidance, stay for the community, and return as mentors who attract the next wave of learners.'));

// ---------------- 2. BRAND ----------------
C.push(h1('2. Brand Identity & Voice'));
C.push(p('Before we market, we must be memorable. MConnect is warm, credible, and ambitious — the friend who has been where you are and points the way forward.'));
C.push(h2('2.1  Brand personality'));
C.push(bullet('**Mentor-like** — knowledgeable, patient, encouraging; never preachy.'));
C.push(bullet('**Human** — real stories, real people, conversational tone.'));
C.push(bullet('**Inclusive** — every skill level, every background, every direction.'));
C.push(h2('2.2  Visual identity'));
C.push(p('Our violet-forward system is distinctive, modern, and consistent across every channel:'));
C.push(tbl({
  headers: ['Element', 'Value', 'Usage'],
  widths: [30, 34, 36],
  rows: [
    ['Primary violet', '#7C3AED', 'Headlines, buttons, brand marks.'],
    ['Soft violet', '#A78BFA', 'Accents, highlights, illustrations.'],
    ['Violet tint', '#EDE9FE', 'Backgrounds, callout panels, cards.'],
    ['Deep ink', '#111827', 'Body text on light backgrounds.'],
    ['Midnight', '#0D0F17', 'Dark mode, bold cover bands, CTAs.'],
  ],
}));
C.push(tblGap());
C.push(h2('2.3  Taglines'));
C.push(p('Primary tagline — **“Where Growth Meets Guidance.”**'));
C.push(p('Supporting taglines: “Grow with someone who’s been there.” • “Find your mentor. Become one.” • “Nobody grows alone.”'));

// ---------------- 3. POSITIONING ----------------
C.push(h1('3. Positioning & Unique Value Proposition'));
C.push(p('MConnect does not compete with one category — it **combines** them. That is the story we tell:'));
C.push(tbl({
  headers: ['Competitor', 'What they do well', 'Where they fall short', 'MConnect advantage'],
  widths: [20, 26, 28, 26],
  rows: [
    ['LinkedIn', 'Huge professional network', 'Mentorship is informal; DMs go unanswered; no structure', 'Purpose-built mentorship with requests, sessions & reviews'],
    ['Paid coaching', 'Structured, dedicated mentors', 'Expensive, exclusive, out of reach for most', 'Free and open to everyone, mentees become mentors'],
    ['Reddit / Twitter', 'Free communities, real voices', 'Noise, no accountability, no scheduling', 'Curated discovery, ratings, reviews, and safe moderation'],
    ['Universities', 'Trusted, local guidance', 'Limited alumni reach, slow processes', 'Scales beyond one campus, always online'],
  ],
}));
C.push(tblGap());
C.push(...callout('The one-line pitch', 'MConnect is where growth meets guidance — a free platform where anyone can find a mentor, learn on a schedule, and eventually guide the next person.'));
C.push(p('Our unique value proposition (UVP): **free, structured, two-way mentorship inside a vibrant community — with trust built into the design.**'));

// ---------------- 4. AUDIENCES ----------------
C.push(h1('4. Target Audiences & Personas'));
C.push(p('We market to four distinct groups. Each needs a tailored message, channel, and offer.'));
C.push(tbl({
  headers: ['Persona', 'Who they are', 'Core need', 'Best channel'],
  widths: [20, 30, 26, 24],
  rows: [
    ['**The Ambitious Student**', 'Final-year students and fresh graduates unsure of their next step.', 'Clarity, confidence, a role model.', 'University campuses, TikTok/Reels, LinkedIn.'],
    ['**The Junior Professional**', '1–3 years into their career, hitting their first plateau.', 'Accelerated growth and honest feedback.', 'LinkedIn, YouTube, career newsletters.'],
    ['**The Career-Changer**', 'Adults pivoting into new industries or tech.', 'A guided path into unfamiliar territory.', 'Webinars, bootcamp partnerships, X/Twitter.'],
    ['**The Seasoned Professional**', 'Experts who want to give back and build a legacy.', 'A simple, rewarding way to mentor.', 'LinkedIn, professional associations, email.'],
  ],
}));
C.push(tblGap());
C.push(p('Note how the fourth persona is just as important as the first three — **mentors are our most valuable asset and our best marketers.**'));

// ---------------- 5. OBJECTIVES ----------------
C.push(h1('5. Marketing Objectives'));
C.push(p('Our objectives are SMART — specific, measurable, achievable, relevant, and time-bound — set across the first 12 months:'));
C.push(tbl({
  headers: ['Objective', 'Target (12 months)'],
  widths: [52, 48],
  rows: [
    ['Registered users', '10,000+'],
    ['Active mentors with complete profiles', '1,200+'],
    ['Monthly active users (MAU)', '40% of registered'],
    ['Mentorship requests sent', '8,000+'],
    ['Completed mentorship sessions', '3,000+'],
    ['Average mentor rating', '4.5 / 5 stars'],
    ['Brand recall in target communities', 'Measured via surveys at 12 months'],
  ],
}));
C.push(tblGap());
C.push(...callout('North-star metric', 'We measure growth not by sign-ups alone, but by **completed mentorship sessions** — the moment the platform truly changes a life. That is the metric every campaign ultimately serves.'));

// ---------------- 6. STRATEGIES & CHANNELS ----------------
C.push(h1('6. Marketing Strategies & Channels'));
C.push(h2('6.1  Content marketing — teach, don’t sell'));
C.push(p('Content is how we earn attention without a big budget. Every piece is designed to demonstrate mentorship before we ever ask for a sign-up.'));
C.push(bullet('**Blog & guides** — “How to find your first mentor,” “The 5 questions every mentee should ask,” “How to become a mentor people love.”'));
C.push(bullet('**Short-form video** — 30-second mentorship tips on TikTok, Instagram Reels, and YouTube Shorts, using our violet brand.'));
C.push(bullet('**LinkedIn essays** — written by our founding team and top mentors; they double as mentor recruitment.'));
C.push(bullet('**Newsletter** — weekly “Mentorship Monday” email with one story, one tip, one mentor spotlight.'));
C.push(h2('6.2  Social media strategy'));
C.push(p('We do not post for reach alone — we post to **start conversations and direct them to MConnect**:'));
C.push(bullet('**Stories-first format** — “a day in the life of a mentee,” mirroring MConnect’s own stories feature.'));
C.push(bullet('**Mentor takeovers** — mentors post on our channels for a day, building trust and their own profile.'));
C.push(bullet('**Community challenges** — “Introduce yourself as a mentor or mentee” prompts that drive traffic to profiles.'));
C.push(h2('6.3  University & community partnerships'));
C.push(p('Students are our largest early audience, and campuses give us trust by association.'));
C.push(bullet('Partner with career centers and student societies to run **“Find Your Mentor” workshops** on MConnect.'));
C.push(bullet('Offer **alumni-to-student mentorship programs** hosted on the platform — institutions get infrastructure for free.'));
C.push(bullet('Partner with bootcamps and training schools so their graduates can stay connected to mentors after graduation.'));
C.push(h2('6.4  The mentor ambassador program'));
C.push(p('Our most powerful engine. Mentors are recruited, celebrated, and rewarded for bringing others in:'));
C.push(bullet('**Recruitment** — invite top professionals from our networks and partner organizations to join as founding mentors.'));
C.push(bullet('**Recognition** — “Mentor of the Month” spotlights, verified badges, and public profile highlights.'));
C.push(bullet('**Referral rewards** — mentors who successfully connect new learners and new mentors earn community titles and exclusive access (early features, community events).'));
C.push(bullet('**Amplification** — their success stories become our content; their networks become our audience.'));
C.push(h2('6.5  Events & live sessions'));
C.push(bullet('Launch **monthly free webinars**: “Career Kickstart,” “Pivot into Tech,” “Ask a Senior Engineer Anything.”'));
C.push(bullet('Host **live AMAs (Ask Me Anything)** on the platform using group calls — showcasing the product while delivering value.'));
C.push(bullet('Organize **speed-mentoring evenings** where participants must join MConnect to book a follow-up session.'));
C.push(h2('6.6  Referral & product-led growth'));
C.push(p('The product itself is the best salesperson:'));
C.push(bullet('**Shareable mentor profiles** — every mentor gets a beautiful public profile link that becomes their personal marketing page.'));
C.push(bullet('**Invite-to-connect** — when a member finds value, inviting a friend is one tap away and framed as “start a circle.”'));
C.push(bullet('**Gamified onboarding** — completing a profile, receiving a first request, and attending a first session unlock visible milestones.'));
C.push(h2('6.7  Influencers & thought leaders'));
C.push(bullet('Collaborate with **career-focused creators** (students, junior devs, career coaches) who share our audience.'));
C.push(bullet('Give them an authentic experience first: they join as mentees or mentors, share their journey, and become long-term brand advocates.'));
C.push(bullet('Never pay for a hollow shout-out — pay for **real stories** told over time.'));
C.push(h2('6.8  Search & SEO'));
C.push(bullet('Target high-intent searches: “find a mentor for free,” “mentorship platform,” “how to find a tech mentor.”'));
C.push(bullet('Each mentor profile is an SEO landing page; each blog guide targets a question learners actually ask.'));
C.push(bullet('Claim the “Where Growth Meets Guidance” narrative across search, social bios, and press outreach.'));

// ---------------- 7. 90-DAY ROADMAP ----------------
C.push(h1('7. The 90-Day Launch Roadmap'));
C.push(p('We launch in three phases. Each phase has a single focus, a few high-leverage actions, and a measurable outcome.'));
C.push(h2('Phase 1 — Foundations (Days 1–30)'));
C.push(tbl({
  headers: ['Focus', 'Key actions', 'Target outcome'],
  widths: [22, 48, 30],
  rows: [
    ['Brand & readiness', 'Finalize brand kit, landing page, pitch one-pager, and social handles across platforms.', 'A launch-ready brand everywhere.'],
    ['Founding mentors', 'Personally recruit 50 trusted mentors; onboard and profile-complete them.', '50 live, high-quality mentor profiles.'],
    ['Launch event', 'Run a flagship webinar + AMA to announce MConnect publicly.', 'First 500 registered users.'],
    ['Early content', 'Publish 4 guides and 8 short videos; start the newsletter.', 'Baseline SEO + content engine running.'],
  ],
}));
C.push(tblGap());
C.push(h2('Phase 2 — Momentum (Days 31–60)'));
C.push(tbl({
  headers: ['Focus', 'Key actions', 'Target outcome'],
  widths: [22, 48, 30],
  rows: [
    ['Partnerships', 'Sign 3 university career centers and 2 bootcamps; run co-hosted workshops.', 'Institutional traffic + credibility.'],
    ['Ambassadors', 'Launch the mentor ambassador program; crown first Mentor of the Month.', 'Mentors actively referring new users.'],
    ['Referrals', 'Ship invite-to-connect and shareable profile links; start referral challenge.', '25% of new sign-ups from referrals.'],
    ['Community', 'Host weekly AMAs and speed-mentoring evenings.', 'First mentorship requests spike.'],
  ],
}));
C.push(tblGap());
C.push(h2('Phase 3 — Scale (Days 61–90)'));
C.push(tbl({
  headers: ['Focus', 'Key actions', 'Target outcome'],
  widths: [22, 48, 30],
  rows: [
    ['Influencers', 'Launch 5 creator collaborations telling real mentorship stories.', 'Wider reach into junior & student audiences.'],
    ['SEO push', 'Double content output; build 20+ mentor landing pages.', 'Organic traffic becomes a channel.'],
    ['Retention', 'Run “first session within 7 days” campaign for new mentees.', 'Strong session completion rate.'],
    ['Review cycle', 'Measure KPIs, gather stories, iterate the plan for months 4–12.', 'Data-driven strategy for scale.'],
  ],
}));

// ---------------- 8. KPIs ----------------
C.push(h1('8. Measurement & KPIs'));
C.push(p('We measure everything against the question: **are real mentorship connections being made?**'));
C.push(tbl({
  headers: ['KPI', 'Definition', 'Target (12 months)'],
  widths: [30, 44, 26],
  rows: [
    ['Registered users', 'Total verified accounts', '10,000+'],
    ['Activation', 'New users completing profile + first connection', '60%'],
    ['Mentor supply', 'Mentors with complete profiles', '1,200+'],
    ['Engagement', 'Monthly active users ÷ registered users', '40%'],
    ['Conversion', 'Mentorship requests ÷ active users', '20%'],
    ['Completion', 'Scheduled sessions actually completed', '75%'],
    ['Quality', 'Average mentor rating', '4.5 / 5'],
    ['Referral share', 'Sign-ups from referrals ÷ total', '30%'],
  ],
}));
C.push(tblGap());
C.push(bullet('**Track weekly, review monthly.** Dashboards cover acquisition, activation, engagement, and session completion.'));
C.push(bullet('**Collect stories continuously** — each one is future content, press material, and proof of impact.'));

// ---------------- 9. BUDGET ----------------
C.push(h1('9. Budget Considerations'));
C.push(p('MConnect’s plan is built for **resourceful growth**. The majority of the budget goes where it compounds — content, partnerships, and community, not vanity ads.'));
C.push(tbl({
  headers: ['Allocation', 'Share', 'Why'],
  widths: [34, 14, 52],
  rows: [
    ['Content & creative (guides, video, design)', '30%', 'The engine of organic growth and search visibility.'],
    ['Events & webinars (platforms, hosting)', '20%', 'Live value that converts into sign-ups and mentors.'],
    ['Community & ambassador rewards', '20%', 'Powers the referral loop and mentor supply.'],
    ['Paid social (targeted, small budget)', '15%', 'Accelerate launch and retarget visitors; not the core.'],
    ['Influencer collaborations', '10%', 'Authentic story-driven reach into new audiences.'],
    ['Tools & measurement', '5%', 'Email, analytics, and design tooling.'],
  ],
}));
C.push(tblGap());
C.push(p('Budget is rebalanced monthly against the KPI dashboard — **spend follows what works.**'));

// ---------------- 10. RISKS ----------------
C.push(h1('10. Risks & Mitigations'));
C.push(tbl({
  headers: ['Risk', 'Mitigation'],
  widths: [46, 54],
  rows: [
    ['**Mentor supply lags demand**', 'Recruit mentors first (Phase 1); ambassador program rewards supply; recruitment is an always-on activity.'],
    ['**Early community feels empty**', 'Founding mentors post first; seeded content and events create activity before the public rush.'],
    ['**Low session completion**', 'Friendly reminders, scheduling nudges, and calendar prompts built into the product.'],
    ['**Quality or safety concerns**', 'Reviews, ratings, reporting, and admin moderation — highlighted in every mentor onboarding.'],
    ['**Budget pressure**', 'Lean, organic-first plan; paid spend is capped at 15% and reallocated monthly.'],
    ['**Generic perception**', 'Our mentorship-first narrative and violet brand differentiate us from LinkedIn and social apps.'],
  ],
}));

// ---------------- 11. CONCLUSION ----------------
C.push(h1('11. Conclusion'));
C.push(p('MConnect has the product, the purpose, and now the plan. We will earn attention by teaching, win trust through our mentors, and grow through the people whose lives the platform actually changes.'));
C.push(p('Every campaign funnels into one promise: **nobody grows alone.** Every user we bring in becomes someone who can bring the next person.'));
C.push(...callout('The plan in one line', 'Teach first, mentor always, and let every success story do the marketing — until finding a mentor on MConnect is simply what people do.'));
C.push(...quote('The best marketing is a story someone else tells about you.', 'Applied to every campaign in this plan'));

// ---------------- BUILD ----------------
const { header, footer } = headerFooter({ docTitle: 'Marketing Plan' });

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: FONT, size: 21, color: THEME.ink } },
    },
  },
  sections: [
    {
      properties: {
        page: { margin: { top: 900, right: 1100, bottom: 900, left: 1100 } },
      },
      children: coverChildren,
    },
    {
      properties: {
        page: { margin: { top: 1300, right: 1300, bottom: 1200, left: 1300 } },
        header: { default: header },
        footer: { default: footer },
        pageNumberStart: 1,
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = resolve(__dirname, '../../MConnect_Marketing_Plan.docx');
  writeFileSync(out, buf);
  console.log('Written:', out);
});
