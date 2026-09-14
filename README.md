# Isla V2 Design  Mockup

Keep the current visual language of the Analytics page (dark theme, cards, spacing, typography and components). This is an evolution, not a redesign.

The Analytics section should continue to have three tabs:

 Outbound

 Inbound

 Cross

The biggest improvement should be on the Cross tab, making it the most valuable page in the product. The goal of this tab is to prove that content directly improves outbound performance.

1. OUTBOUND

Keep the existing KPI cards:

 Prospected

 Invitation Acceptance

 Reply Rate

 Calls Booked

 Paid Users

 MRR

Improve the Conversion Funnel.

Instead of only showing the total count for each stage, display the conversion rate between every stage.

Example:

Connect               494
        ↓ 82%

Engage                405
        ↓ 21%

Reach Out             86
        ↓ 13%

Follow Up             42
        ↓ 31%

Replied               13
        ↓ 54%

Call Booked            7
        ↓ 57%

Interested             4
        ↓ 50%

Paid User              2

On the right side of the funnel, add a small insight card.

Title:

Biggest Bottleneck

Example:

Reach Out → Replied

13% conversion

↓ 8% compared to last month

This card should automatically detect the weakest conversion step.

2. INBOUND

Keep the KPI cards:

 Posts

 Impressions

 Engagement

 New Followers

Replace the current "Top Posts" chart with a much more actionable version.

Each top post should display:

 Title

 Impressions

 Reactions

 Comments

 Reposts

 Engagement Rate

If possible, also display:

"Generated X engaged prospects"

if this data exists.

Add one KPI:

Average Engagement Rate

Example:

4.8%

3. CROSS (Main Feature)

This tab should become the hero of the product.

Change the description below the tabs to something like:

Discover how your LinkedIn content impacts pipeline generation, conversions and revenue.

Do NOT present this page as "crossed analytics".

Present it as:

Content Impact

or

Revenue Intelligence

The page should answer one question:

Does posting content improve my outbound sales?

SECTION 1

Large Hero Card

Title:

Content Influence

Display a large percentage.

Example:

68%

Subtitle:

of your paid customers interacted with your content before becoming customers.

If there isn't enough data yet:

Not enough data yet.
We'll automatically calculate this as your audience and pipeline grow.

SECTION 2

Acceptance Rate Comparison

Large horizontal comparison.

Title:

Invitation Acceptance

Subtitle:

Compare acceptance rate between engaged prospects and cold prospects.

Two progress bars:

Engaged before

72%

███████████████████

Cold Prospect

34%

████████

Show sample size:

142 invites

358 invites

SECTION 3

Pipeline Comparison

This should become the centerpiece of the page.

Compare two funnels side by side.

Left

Cold Leads

Right

Content Engaged Leads

Example

Cold

Accepted

↓

Reply

↓

Call

↓

Paid

-------------------------

Engaged

Accepted

↓

Reply

↓

Call

↓

Paid

Each stage should show percentages.

At the bottom show:

+81%

higher conversion to paid

if applicable.

SECTION 4

Revenue Influenced by Content

Large KPI card.

Title

Revenue Influenced

Example

$12,400 MRR

82%

of revenue came from leads that engaged before outreach.

If unavailable:

Waiting for enough conversion data.

SECTION 5

Time to Conversion

Comparison card.

Average Sales Cycle

Cold Leads

43 days

↓

Content Engaged

18 days

Show

58% faster conversion

when possible.

SECTION 6

AI Insights

This should always stay at the bottom of the page.

Display 4–6 automatically generated insight cards.

Examples:

📈 Acceptance Rate increased 11% this month.

🔥 Founders convert 2.4x better than Heads of Marketing.

⚠️ 18 qualified leads have been waiting for follow-up for more than 7 days.

💡 Leads who liked at least two posts have a 74% invitation acceptance rate.

🚀 AI-related posts generated 3x more engaged prospects than company updates.

🎯 Your biggest funnel bottleneck is Reach Out → Reply.

These insights should be rule-based for now and evolve to AI-generated insights later.

Filters

Keep the existing filters:

 Date range

 Profile selector

All charts should respect filters except metrics explicitly marked as All-Time (such as Content Influence and Revenue Influenced when appropriate).

Design

Maintain the existing Isla design system.

 Same spacing

 Same dark theme

 Same cards

 Same typography

 Same accent colors

 Same rounded corners

The goal is to make the Analytics page feel like a premium GTM intelligence dashboard, not just another reporting screen.

The Cross tab should immediately communicate one message:

"Your content is directly generating more pipeline, more meetings and more revenue."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/544b899e-21ef-4dbf-840d-7198b2cd8427).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
