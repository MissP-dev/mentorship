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
  subtitle: 'Mentorship & Networking Platform',
  docType: 'Product Document & Software Requirements Specification',
  tagline: 'One platform where every career journey finds its mentor.',
  meta: [
    ['Document Type', 'Product / SRS'],
    ['Version', '1.0'],
    ['Date', 'August 2026'],
    ['Status', 'Approved for development'],
    ['Audience', 'Founders, investors, developers, and all stakeholders'],
  ],
});

const children = [];
const C = children;

// ---------------- TOC ----------------
C.push(h1('Contents'));
for (const [n, t] of [
  ['1', 'Executive Summary'],
  ['2', 'The Problem Statement'],
  ['3', 'Our Inspiration'],
  ['4', 'The Solution: MConnect'],
  ['5', 'The Platform, Explained Simply'],
  ['6', 'Core Features'],
  ['7', 'How the Platform Works'],
  ['8', 'Screens at a Glance'],
  ['9', 'The Data That Powers It'],
  ['10', 'Roadmap & Vision'],
  ['11', 'Conclusion'],
]) {
  C.push(p(`**${n}.  ${t}**`, { after: 90 }));
}
C.push(pageBreak());

// ---------------- 1. EXECUTIVE SUMMARY ----------------
C.push(h1('1. Executive Summary'));
C.push(p('**MConnect** is a free, all-in-one mentorship and networking platform that connects people who want to learn with people who have been there. It blends the warmth of a professional social network with the purpose of a mentorship program — letting students, junior professionals, and career-changers discover experienced mentors, talk to them, schedule sessions, and grow as part of a real community.'));
C.push(p('Anyone can be a learner, and anyone can be a mentor. MConnect treats every member as both, because the best communities grow when knowledge flows in every direction.'));
C.push(p('This document explains why MConnect exists, what inspired it, the problem it solves, and how the platform works in plain language — for everyone from investors to first-time users.'));
C.push(...callout('Why MConnect matters', 'Career guidance is one of the most powerful forces for social mobility — yet for most people it is a luxury. MConnect makes mentorship accessible, structured, and free.'));
C.push(...quote('Nobody succeeds alone.', 'The idea behind MConnect'));

// ---------------- 2. PROBLEM ----------------
C.push(h1('2. The Problem Statement'));
C.push(p('Every day, thousands of students graduate, junior professionals hit career plateaus, and career-changers try to break into new fields — all facing the same quiet struggle: **they do not know who to turn to for guidance**.'));
C.push(p('The channels that exist today each fail in their own way:'));
C.push(bullet('**Informal and unreliable** — LinkedIn DMs, Twitter threads, and cold emails go unanswered. Finding a mentor feels like winning the lottery, not like using a service.'));
C.push(bullet('**Paywalled** — dedicated coaching platforms lock guidance behind expensive monthly subscriptions that most learners cannot afford.'));
C.push(bullet('**Fragmented** — a mentor might be found on one app, messaged on another, scheduled on a third, and reviewed nowhere. The experience is broken into pieces.'));
C.push(bullet('**No accountability** — because there are no reviews, ratings, or structure, there is no quality signal and no trust. Anyone can claim to be an expert.'));
C.push(bullet('**No safety net** — without reporting systems and moderation, learners are exposed to bad actors with no recourse.'));
C.push(bullet('**Communities without structure** — group chats and forums create noise, not mentorship. Questions get buried; promising connections never form.'));
C.push(p('The result is the same everywhere: **great potential, wasted by lack of access to guidance.** The gap is not talent. The gap is mentorship.'));

// ---------------- 3. INSPIRATION ----------------
C.push(h1('3. Our Inspiration'));
C.push(p('MConnect was born from a simple observation shared by every member of the team: the most important moments in our own journeys came from **one person who took the time to guide us** — and that guidance was almost always found by luck, not by design.'));
C.push(p('We watched classmates and colleagues:'));
C.push(bullet('ask the same career questions in group chats because they did not know who to ask directly;'));
C.push(bullet('choose the wrong specialization, the wrong first job, or the wrong skills — not from lack of ability, but from lack of informed advice;'));
C.push(bullet('and succeed brilliantly once one experienced person simply pointed the way.'));
C.push(p('We also saw the other side: experienced professionals **wanting** to give back — to mentor, to share lessons learned — but with no easy, structured way to do it. Their knowledge sat unused, waiting to be asked.'));
C.push(p('So we asked ourselves a question: **what if guidance worked like a network?** What if finding a mentor was as natural as posting an update, messaging a friend, or joining a group chat? What if expertise was no longer hidden behind paywalls and luck, but organized, searchable, and free — for everyone?'));
C.push(p('That question became MConnect. We built it on the belief that **every successful person is a mentor waiting to happen**, and every learner is one good conversation away from a breakthrough.'));
C.push(...callout('Our founding belief', 'Guidance is not a privilege for the few who can afford it — it is a foundation that everyone deserves. MConnect exists to make it universal.'));
C.push(...quote('What if expertise flowed freely, in every direction?', 'The question that started everything'));

// ---------------- 4. SOLUTION ----------------
C.push(h1('4. The Solution: MConnect'));
C.push(p('**MConnect** is a unified platform where discovery, communication, scheduling, and community live in one place. It is designed around a single, elegant idea: **any user can be both mentor and mentee.** There are no separate classes of membership — no paid tiers for mentees, no locked profiles for mentors. You learn from those ahead of you and guide those behind you.'));
C.push(p('With one account, a member can:'));
C.push(bullet('**Find mentors** through searchable profiles with expertise tags, ratings, and honest reviews;'));
C.push(bullet('**Connect** through direct messages and group chats, and talk live with free voice calls;'));
C.push(bullet('**Grow on a schedule** by sending mentorship requests and booking sessions with agreed durations;'));
C.push(bullet('**Stay close** with a social feed, 24-hour stories, reactions, and nested comments that make the community feel alive;'));
C.push(bullet('**Feel safe** thanks to a review system, user reporting, and an admin dashboard that moderates the platform.'));
C.push(p('All of this is **free** and works beautifully on desktop and mobile, in light or dark mode.'));

// ---------------- 5. PLATFORM EXPLAINED ----------------
C.push(h1('5. The Platform, Explained Simply'));
C.push(p('If you have ever used a social network, you already know how MConnect feels. The difference is that everything is built around **growth, not just attention.** Here is how it works in plain language:'));
C.push(h2('5.1  What is MConnect?'));
C.push(p('Think of MConnect as a **professional social network built around mentorship**. Instead of only posting updates, people use it to find a guide, ask the right person the right question, and grow together over time.'));
C.push(h2('5.2  Who is it for?'));
C.push(p('**Anyone who wants to learn or share.** Students, graduates, junior developers, designers, marketers, career-changers, and seasoned professionals — each person comes as a learner and leaves as a mentor.'));
C.push(h2('5.3  A day in the life'));
C.push(p('Meet **Amina**, a final-year student unsure about her career path. Meet **David**, a senior engineer with ten years of experience who wants to give back. Here is how MConnect brings them together:'));
C.push(tbl({
  headers: ['Step', 'What happens'],
  widths: [26, 74],
  rows: [
    ['**1. Sign up**', 'Amina creates a free account and completes a short profile — her name, bio, and the skills she wants to grow.'],
    ['**2. Complete the mentor profile**', 'David fills out his mentor profile: his expertise tags (e.g., *Backend Engineering, System Design, Career Coaching*), bio, and reviews from past mentees.'],
    ['**3. Discover**', 'Amina searches the mentor directory, filters by expertise and rating, and lands on David’s profile. She reads his reviews and feels confident.'],
    ['**4. Connect**', 'Amina sends a mentorship request with a short message and chosen duration. David receives a notification and accepts.'],
    ['**5. Talk & schedule**', 'They chat in the messaging inbox, join a group with other mentees, and book a session through the built-in scheduler.'],
    ['**6. Meet live**', 'At the scheduled time, they open a free voice call — no extra apps, no accounts, no fees.'],
    ['**7. Grow together**', 'Amina applies what she learns, shares her progress in the feed, and eventually completes her own mentor profile to guide the next person.'],
  ],
}));
C.push(tblGap());
C.push(p('That is the loop MConnect creates: **discover → connect → learn → give back.** The platform does not end a relationship at graduation — it turns mentees into mentors.'));

// ---------------- 6. CORE FEATURES ----------------
C.push(h1('6. Core Features'));
C.push(p('MConnect bundles the power of a mentorship program, a messaging app, and a social network into one cohesive product.'));
C.push(h2('6.1  Mentorship'));
C.push(tbl({
  headers: ['Feature', 'What it does', 'Why it matters'],
  widths: [28, 42, 30],
  rows: [
    ['Mentor discovery', 'Search mentors by name, expertise tags, and minimum rating.', 'The right mentor is findable, not accidental.'],
    ['Mentor profiles', 'Bio, expertise tags, rating, and reviews in one view.', 'Trust is built before the first message.'],
    ['Mentorship requests', 'Send structured requests with a message and duration.', 'Both sides know what they are agreeing to.'],
    ['Session scheduling', 'Book and track sessions with title, date, and time.', 'Learning happens on a plan, not on a whim.'],
    ['Reviews & ratings', 'One honest review per mentee, auto-averaged into the mentor’s rating.', 'Quality is visible and earned.'],
    ['Availability slots', 'Mentors declare when they are open to sessions.', 'Fewer missed opportunities, clearer expectations.'],
  ],
}));
C.push(tblGap());
C.push(h2('6.2  Communication'));
C.push(tbl({
  headers: ['Feature', 'What it does', 'Why it matters'],
  widths: [28, 42, 30],
  rows: [
    ['Direct messaging', 'Private 1-to-1 chats with text and file attachments.', 'Deep, personal conversations happen easily.'],
    ['Group chats', 'Conversations with multiple members, plus group editing and icons.', 'Mentorship extends from one to many.'],
    ['Voice calls', 'Free audio rooms powered by Jitsi — no extra sign-ups.', 'Talk live without barriers.'],
    ['Stories', '24-hour text and media updates from your network.', 'The community stays lively and human.'],
    ['Notifications', 'Real-time alerts that link back to the relevant screen.', 'No message gets lost in the noise.'],
  ],
}));
C.push(tblGap());
C.push(h2('6.3  Community'));
C.push(tbl({
  headers: ['Feature', 'What it does', 'Why it matters'],
  widths: [28, 42, 30],
  rows: [
    ['Social feed', 'Public posts with media uploads and reactions.', 'Members share wins, questions, and lessons.'],
    ['Comments', 'Nested replies that keep conversations threaded.', 'Discussions stay coherent, even at scale.'],
    ['Profiles', 'Custom avatars, bios, and public identity.', 'Every interaction has a face behind it.'],
    ['Light & dark themes', 'Full theming with one-tap switching.', 'Comfortable on any device, day or night.'],
  ],
}));
C.push(tblGap());
C.push(h2('6.4  Trust & Safety'));
C.push(tbl({
  headers: ['Feature', 'What it does', 'Why it matters'],
  widths: [28, 42, 30],
  rows: [
    ['Reporting', 'Users can report posts, users, and behavior to admins.', 'The community polices itself with a formal path.'],
    ['Admin dashboard', 'Platform stats, user management, activities, and reports.', 'Moderators can act quickly and confidently.'],
    ['Suspension', 'Admins can suspend abusive accounts.', 'Bad actors are removed, not tolerated.'],
    ['Secure accounts', 'Hashed passwords, JWT sessions, and optional email recovery.', 'Identity and data stay protected.'],
  ],
}));

// ---------------- 7. HOW IT WORKS ----------------
C.push(h1('7. How the Platform Works'));
C.push(p('Under the hood, MConnect is a modern web application built with a clean client–server architecture:'));
C.push(tbl({
  headers: ['Layer', 'Technology', 'Role'],
  widths: [24, 34, 42],
  rows: [
    ['**Frontend**', 'React 19, Vite, Tailwind CSS 4', 'The interface users see — pages, components, themes, navigation.'],
    ['**Backend**', 'Node.js, Express', 'The API that powers accounts, posts, messages, sessions, and more.'],
    ['**Data**', 'PostgreSQL via Prisma ORM', 'Stores 16 connected tables — users, posts, messages, reviews, and so on.'],
    ['**Auth**', 'JWT + bcrypt', 'Secure login sessions that expire after 7 days.'],
    ['**Real-time voice**', 'Jitsi Meet API', 'Free audio-only rooms joined directly from group chats.'],
    ['**Files**', 'Multer uploads', 'Images, audio, and documents shared in posts and messages.'],
    ['**Email**', 'SMTP (Ethereal for testing)', 'Password recovery and reset emails with secure tokens.'],
  ],
}));
C.push(tblGap());
C.push(p('The flow is simple: the **React frontend** talks to the **Express backend** through a REST API. When you log in, the backend gives you a JWT token that the frontend attaches to every request, so the server knows who you are. Vite’s dev server proxies API and upload requests to the backend during development, making the two layers feel like one application.'));
C.push(p('Three levels of middleware protect the API: **authenticate** for private routes, **optionalAuth** for public pages like the feed and profiles, and **adminOnly** for the moderation dashboard. Even the guest experience — browsing the feed or a mentor profile without logging in — is designed to work.'));

// ---------------- 8. SCREENS ----------------
C.push(h1('8. Screens at a Glance'));
C.push(p('MConnect ships with **25+ screens**, covering the entire journey from sign-up to mentorship:'));
C.push(tbl({
  headers: ['Screen', 'Purpose'],
  widths: [30, 70],
  rows: [
    ['Welcome / Landing', 'First impression, brand story, and entry to the app.'],
    ['Sign up / Login / Password reset', 'Full authentication flow with email recovery.'],
    ['Social feed + Create post + Post detail + Comments', 'The community hub with reactions and threaded discussion.'],
    ['Search mentors + Mentor profile + Request', 'Discovery, trust-building, and connection.'],
    ['Mentor profile setup + Availability', 'Tools for anyone becoming a mentor.'],
    ['Sessions', 'Viewing and managing scheduled mentorship sessions.'],
    ['Messages + Group chat + Voice call', 'Direct and group communication, with live audio.'],
    ['Groups list + Create group + Edit group', 'Building and managing mentor circles.'],
    ['Profile + Settings', 'Identity, preferences, and account management.'],
    ['Notifications', 'History and status of every alert.'],
    ['Admin dashboard', 'Stats, users, activities, and report moderation.'],
  ],
}));

// ---------------- 9. DATA ----------------
C.push(h1('9. The Data That Powers It'));
C.push(p('MConnect’s database is built around **16 interconnected tables**, designed so that every part of the platform speaks to every other part:'));
C.push(tbl({
  headers: ['Data entity', 'What it stores'],
  widths: [34, 66],
  rows: [
    ['Users', 'Accounts, profiles, expertise tags, ratings, and mentor status.'],
    ['Mentorship requests & sessions', 'The formal structure of every mentoring relationship.'],
    ['Posts, comments & reactions', 'The community conversation.'],
    ['Conversations, participants & messages', 'Direct and group communication with read receipts.'],
    ['Stories & story comments', 'Short-lived, 24-hour community updates.'],
    ['Reviews', 'Honest feedback that builds mentor trust.'],
    ['Reports', 'Safety issues tracked to resolution.'],
    ['Notifications & password resets', 'Timely alerts and secure account recovery.'],
  ],
}));
C.push(tblGap());
C.push(p('A key design decision: **one unified user model.** There is no separate “mentor table” and “mentee table” — any user can complete a mentor profile and instantly take on both roles. This keeps the platform simple and its philosophy consistent.'));

// ---------------- 10. ROADMAP ----------------
C.push(h1('10. Roadmap & Vision'));
C.push(h2('Near term'));
C.push(bullet('Real-time chat and presence (websockets) so messages arrive instantly.'));
C.push(bullet('In-app video calls alongside the current voice rooms.'));
C.push(bullet('Verified mentor badges to strengthen trust even further.'));
C.push(h2('Mid term'));
C.push(bullet('Curated learning paths connecting sessions, feeds, and resources.'));
C.push(bullet('Mobile apps (iOS & Android) to match the web experience.'));
C.push(bullet('Local communities and events for mentors and mentees in the same region.'));
C.push(h2('Long term'));
C.push(p('MConnect’s vision is to become **the default place people go for career guidance** — a global network where no learner is ever more than one conversation away from the mentor who changes their path.'));

// ---------------- 11. CONCLUSION ----------------
C.push(h1('11. Conclusion'));
C.push(p('MConnect exists because career growth should not depend on luck, money, or who you happen to know. It combines the structure of a mentorship program, the ease of a messaging app, and the energy of a social network — into one free, beautiful, and safe platform.'));
C.push(p('For the learner, it is a path. For the expert, it is a purpose. For the community, it is a loop where **every mentee eventually becomes a mentor.**'));
C.push(...callout('Join the movement', 'MConnect is more than software — it is a commitment that nobody has to grow alone. Discover a mentor. Become one. And keep the loop turning.'));

// ---------------- BUILD ----------------
const { header, footer } = headerFooter({ docTitle: 'Product Document & SRS' });

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
  const out = resolve(__dirname, '../../MConnect_Product_Document.docx');
  writeFileSync(out, buf);
  console.log('Written:', out);
});
