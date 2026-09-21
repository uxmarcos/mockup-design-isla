/** Long-form sample posts used by the mockup: calendar posts and drafts prepared by the Isla team. */

const img = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`;

export type SamplePost = { time: string; body: string; image?: string };

export const CALENDAR_SAMPLES: SamplePost[] = [
  {
    time: "08:30",
    body: `The ICP mistake most B2B teams keep repeating.

They define their ideal customer by who *can* buy. Not by who *does* buy, keeps buying, and brings a friend.

We did the same for two years. Our ICP slide said "mid-market SaaS, 50–500 employees". It was true. It was also useless: 70% of that list never replied, and the 30% that did churned in month four.

So we pulled every customer who renewed twice and looked for what they had in common. Not firmographics. Behavior.

→ They had a named owner for the problem before we ever spoke.
→ They had already tried (and failed) to fix it with a tool.
→ Their champion had a boss who asked about it every week.

Three signals. None of them are on a data provider's filter list.

We rebuilt the list around those signals, cut the outbound volume by 60%, and the reply rate went from 4% to 19%.

If your ICP fits on a slide, it's probably a market definition, not an ideal customer profile.

What's the one signal your best customers have in common that no filter can find?`,
  },
  {
    time: "10:00",
    image: img("photo-1552664730-d307ca884978"),
    body: `3 lessons from 100 demos.

Last quarter I sat in on 100 sales demos. Ours and a few from teams I advise. Here's what separated the ones that closed from the ones that stalled.

1. The best demos start with the customer's calendar, not the product.

Before showing anything, the top rep asked: "What does Tuesday look like for your team right now?" Ten minutes later the prospect had described the exact workflow we then automated. No slides needed.

2. Silence is a feature.

When a prospect goes quiet after a big claim, average reps fill the gap. The great ones wait. In 31 of the demos that closed, the buyer broke the silence with a real objection, and that objection became the roadmap for the deal.

3. The best close is a smaller next step.

Nobody signs after one call. But a 20-minute working session with their ops lead, scheduled before the call ends, converted 3x better than "let me send a proposal".

None of this is new. What surprised me is how rarely we do it when the quarter is on the line.

Which one would change your next demo?`,
  },
  {
    time: "11:30",
    body: `Why most outbound fails (and what we do instead).

Most outbound fails before the first message is written. The list is wrong, the timing is wrong, and the message is a template with a {{first_name}} on top.

We stopped sending cold messages 9 months ago. Here's the replacement, in three steps:

1. Warm-up before the ask.
Every lead gets two real touches first: a comment on something they posted, and a reaction to a second post. Nothing salesy. Just proof that a human is paying attention.

2. Reach out only on a signal.
A new role, a hiring push, a public complaint about the exact problem we solve. If there's no signal, there's no message. That alone cut our volume by half.

3. The message references *their* words.
Not "I saw you work at Acme". More like: "You said last week that onboarding takes your team six weeks. We got that down to four. Worth a look?"

The result: reply rate from 3% to 21%, and the meetings that come out of it start on the actual problem instead of a pitch.

Outbound isn't dead. Lazy outbound is.

What's the best signal you've used to time a message?`,
  },
  {
    time: "15:00",
    image: img("photo-1551288049-bebda4e38f71"),
    body: `Our pipeline teardown: numbers, not vibes.

Every quarter we tear down the pipeline line by line. No storytelling, just the data. This quarter's teardown was uncomfortable, so I'm sharing it.

The headline: pipeline was up 38%. Revenue was flat.

Where the gap came from:

→ 46% of new pipeline came from a channel with a 9% close rate.
→ Average deal age grew from 41 to 67 days.
→ 22 deals had no next step logged for more than three weeks.

None of that showed up on the dashboard leadership looks at. The dashboard said "healthy". The teardown said "inflated".

What we changed:

1. Pipeline is now counted only once a buying-committee member beyond the champion has engaged.
2. Any deal without a next step for 14 days moves to "at risk" automatically.
3. Reps see their own close rate by channel, weekly.

Two weeks later the pipeline number dropped 24%. Forecast accuracy went from 63% to 88%.

A smaller, honest number beats a big, comforting one every time.

How do you decide when a deal counts as pipeline?`,
  },
  {
    time: "16:00",
    body: `Hiring for GTM without burning 6 months.

The average GTM hire takes 6 months to find, 3 months to ramp, and 1 bad quarter to regret. We cut that to 7 weeks. Here's the process.

Week 1: Write the scorecard before the job post.
Three outcomes the person must deliver in 90 days, with numbers. If you can't write them, you're not ready to hire.

Weeks 2–3: Source from the work, not the résumé.
We looked at who was posting sharp things about our exact problem and reached out to those people directly. Half of our final candidates never applied to anything.

Weeks 4–5: Replace interviews with a working session.
A real 45-minute problem from our pipeline. We watch how they think, what they ask, and how they take feedback. Résumés stop mattering after that.

Weeks 6–7: Reference calls with a script.
Two questions only: "What did they do that made you trust them?" and "What would you have to coach?" Everything else is noise.

We've made four hires this way. Four are still here, and three already beat their 90-day scorecard.

Slow hiring isn't careful hiring. It's just slow.

What's the one interview question you'd never drop?`,
  },
  {
    time: "09:00",
    image: img("photo-1522071820081-009f0129c71c"),
    body: `How we cut time-to-first-value from 21 days to 4.

Customers used to wait 21 days before they saw anything useful in the product. Today it's 4. We didn't add features. We removed steps.

The old onboarding had 14 steps: invite the team, connect four integrations, configure roles, import history, and only then see a first result.

We asked a simple question: what is the smallest thing that proves the product works? For us it's one lead scored against the customer's ICP, with the reason why.

So we rebuilt onboarding backwards from that moment:

→ Step 1: paste one LinkedIn URL.
→ Step 2: see the score and the reasoning.
→ Everything else (integrations, roles, history) unlocks after.

What changed in the numbers:

• Activation within 7 days: 34% → 71%
• Support tickets in week one: down 52%
• Trial-to-paid: up 2.4x

The lesson: onboarding isn't a tour of your product. It's the shortest path to the first moment a customer thinks "oh, this actually works".

What's the "first value" moment in your product, and how many clicks away is it?`,
  },
  {
    time: "13:00",
    image: img("photo-1504384308090-c894fdcc538d"),
    body: `Content-led pipeline: what actually compounds.

We track pipeline by source every week. For 14 months, one line has kept growing while every paid channel flattened: content. But not all content. Here's what compounds and what doesn't.

What doesn't:
→ Generic thought leadership with no point of view.
→ Posts written to sound smart instead of to be useful.
→ Anything you'd be embarrassed to defend in front of a customer.

What does:

1. Specific numbers from our own work. "We cut onboarding from 21 days to 4" beats "onboarding matters" every time.
2. One opinion per post, stated plainly, with the reasoning shown.
3. A reply culture. We answer every comment within 24 hours. Half of our inbound conversations started in a comment thread.

The compounding part is subtle. Each post is small. But people who read three of them start to recognise how we think, and by the fourth they reach out already convinced.

Content-sourced pipeline is now 34% of our total, at a fraction of the cost per opportunity of paid.

If you're starting: pick one topic you can be specific about, post twice a week for a quarter, and measure replies, not likes.

What's the most specific thing you've shared publicly?`,
  },
];

export type TeamDraftSample = { body: string; image?: string };

export const TEAM_DRAFT_SAMPLES: TeamDraftSample[] = [
  {
    image: img("photo-1556761175-5973dc0f32e7"),
    body: `Stop measuring marketing by leads. Measure defensible pipeline.

Two years ago I would have laughed at this. Then I watched two teams hit their MQL number, celebrate, and still lose every strategic room they walked into.

The problem wasn't effort. It was the metric.

MQLs measure how many people raised a hand. They say nothing about whether the right people did, whether they'll still be around in 90 days, or whether anyone in the buying committee has even heard of you.

Here's what we moved to instead:

→ Named accounts engaged (not anonymous visitors)
→ Buying-committee coverage per account (how many roles have touched us)
→ Pipeline that survives a hostile question from the CFO

That last one is the test. Can you walk into a QBR, point at a deal, and explain in one sentence why it exists and what would make it close? If you can't, it isn't pipeline. It's hope with a stage name.

The first quarter was painful. Reported volume dropped 41%. Then something interesting happened: win rate rose from 17% to 29%, sales stopped complaining about lead quality, and marketing got invited to the deal reviews for the first time.

We stopped reporting on volume. We started reporting on named accounts and named humans. Every number now comes with a story.

What's the one metric your team defends that you privately think is a waste of time?`,
  },
  {
    image: img("photo-1553877522-43269d4ea984"),
    body: `The best salespeople I hired asked me the sharpest questions.

Not the loudest in the interview. Not the ones with the smoothest pitch. The ones who turned the conversation around and started interviewing me.

Looking back at the eight reps who became top performers on my teams, the pattern is almost embarrassing in how consistent it is. In the first conversation, every one of them asked something that made me pause:

→ "What happens to a deal in week three when the champion goes quiet?"
→ "Who actually signs, and how do you know?"
→ "What did the last rep who failed here get wrong?"

Notice what those questions have in common. They're not about commission or title or perks. They're about the customer, the buying committee, and the messy middle of a deal, which is exactly where deals are won or lost.

We now build the interview around it. Candidates get a real, anonymised deal and 20 minutes to ask questions before they say a word about strategy. We score the questions, not the answers.

It changed who we hire. Ramp time dropped from 5 months to 3, and first-year attrition fell by half.

Skills can be coached. Curiosity mostly can't.

Hire for curiosity first. The rest can be taught.

What's the best question a candidate has ever asked you?`,
  },
  {
    image: img("photo-1542744173-8e7e53415bb0"),
    body: `I killed 40% of our roadmap. Revenue went up.

Last quarter I did the thing every product leader dreads: I opened the roadmap, sorted by effort, and started deleting.

We had 31 initiatives. Every one had a champion, a slide, and a "quick win" label. Together they were stopping us from finishing anything.

Here's how I decided what to cut:

1. Does a customer we can name ask for this? If not, it's gone.
2. Does it move one of our three revenue metrics within two quarters? If not, it's gone.
3. Would we still build it if it took twice as long? If not, it's gone.

Thirteen initiatives failed all three tests. I cut them in a single afternoon.

The hard part wasn't the decision. It was the conversations. I sat down with every team whose project was cut and showed them the criteria, the data, and what I'd do with the freed-up time. Nobody got a "no" without a reason.

Then something strange happened. Teams shipped the remaining 18 initiatives 30% faster. Support tickets dropped. The two features customers had been asking for all year finally landed, and expansion revenue grew 22% in the quarter.

Saying no isn't a lack of ambition. It's the most ambitious thing a roadmap can do.

What's the last thing you cut that you never missed?`,
  },
];
