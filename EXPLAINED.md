# PaceMatch — What We Built (Explained Simply!)

Hey! Imagine you really love running. You want to find other kids in your neighborhood who also love running, and you want to run together. That's what PaceMatch does — but for grown-up runners!

---

## What is PaceMatch?

PaceMatch is a phone app for runners. It helps runners find other runners who run at the **same speed** as them, and it helps people who lead running groups (called **Run Clubs**) manage their group.

Think of it like a **friend-finder app, but just for running buddies**.

---

## The Two Types of People in the App

### 🏃 Runner
A normal person who likes to run. They want to:
- Find other runners nearby who run at the same speed
- Let people know "Hey, I'm free to run right now!"
- Join a running group (run club)
- Send messages to potential running partners

### 👑 Run Club Leader
A person who organizes a running group. They want to:
- Plan runs for their group
- Tell everyone "Our run on Saturday is cancelled because of rain!"
- Keep everyone safe with emergency contacts
- Track who is coming to each run

---

## The Screens We Built

### Welcome Screen (`index.tsx`)
This is the **first screen** you see when you open the app. It's like the front door of a house. It says "Welcome to PaceMatch!" and has two buttons:
- **Get Started** (for new people)
- **I already have an account** (for people who've been here before)

### Role Select Screen (`role-select.tsx`)
After you sign up, the app asks: **"Are you a Runner or a Run Club Leader?"**

You tap which one you are, and then the app changes to show the right buttons at the bottom of your screen. It's like picking a character in a video game — each character has different powers!

---

## The Runner's App (4 Tabs at the Bottom)

Think of tabs like chapters in a book. The runner gets 4 chapters:

### 🔍 Discover Tab
This is like a **catalog** of runners and running clubs near you. You can:
- Search by typing a name or place
- Switch between "Runners" and "Run Clubs" by tapping a toggle (like a light switch)
- Filter people by how fast they run, what distance they like, or what their goal is (getting fit, training for a race, etc.)
- Tap "Request to run" to ask someone to be your running buddy

### ⚡ Ready to Run Tab
This is the coolest feature! You flip a switch (like turning on a light) to say **"I'm ready to go running RIGHT NOW"** or "I'm free this evening."

Other runners can see your status, and you can see who else is ready. It's like raising your hand in class to say "I want to play!"

You can also choose **who sees your status** — everyone, or only people in your running club.

### 💬 Messages Tab
This is where you see all your **running requests**. If someone wants to run with you, it shows up here as "Pending." You can tap Accept or Decline — just like accepting a friend request!

Once accepted, you become running partners.

### 👤 Profile Tab
This is **your page** — like your trading card. It shows:
- Your name and where you live
- How fast you run (your "pace")
- What you're training for (like a 5K race or a marathon)
- What your running goals are (fitness, fun, competitions, etc.)

You can tap "Edit Profile" to change any of this info.

---

## The Run Club Leader's App (5 Tabs at the Bottom)

The leader gets 5 chapters because they have more to manage:

### 🗂️ Dashboard Tab
This is the **control center** — like the cockpit of an airplane. The leader can see:
- What the **next scheduled run** is and when it happens
- How many people said "Going" vs "Maybe" (called RSVPs — like a party guest list!)
- Quick buttons to create a new run, post a message, or send a weather warning

### 📅 Schedule Tab
A list of all upcoming runs, organized by time ("This Week" and "Coming Up").

It also shows the **Training Plan** — a weekly guide that tells the group what kind of running to do each week (like "Week 1: Easy jogging" or "Week 2: Speed training").

### 🏁 Events Tab
This is where the leader **creates new run events**. They fill in:
- The name of the run ("Saturday Long Run")
- The date and time
- Where to meet
- Notes about the route (like "turn left at the park fountain")
- How many miles people can choose to run
- What pace groups there will be

It's like filling out an invitation for a birthday party, but for running!

### 📣 Announcements Tab
The leader can **post messages** to the whole club — like a bulletin board. They can also **pin** important messages to the top so everyone sees them first.

For example: "⚠️ Saturday's run is moved to 8:30 AM because of rain!"

### 🛡️ Safety Tab
This is the **emergency page**. It has:
- A big red **"Send Emergency Update"** button — tap it and ALL club members get an alert immediately
- **Weather templates** — pre-written messages for rain, heat, cold weather, or cancellations. One tap sends the right message
- **Emergency contacts** — a list of important phone numbers (co-leaders, parks department, 911)
- **Safety tips** — reminders like "always carry your phone" and "run against traffic"

---

## The Pieces We Built Behind the Scenes

### 🎨 Theme (`theme.ts`)
A list of colors, text sizes, and spacing rules. Instead of picking colors randomly, every screen uses the same rules. It's like having a **style guide** for an art project.

It also supports **dark mode** — so if your phone is set to dark mode (black background), the app automatically changes its colors!

### 🗃️ Mock Data (`mockData.ts`)
Since we don't have a real database yet, we made up **fake data** to make the app look real. We created:
- **10 runners** with names, locations, paces, and goals
- **3 run clubs** with schedules and descriptions
- **4 run events** with locations and RSVP lists
- **4 announcements** with real-sounding messages

It's like filling a toy store with **pretend toys** before the real ones arrive!

### 🧠 App Context (`AppContext.tsx`)
This is the app's **memory**. It remembers things while you use the app:
- Are you a runner or a leader?
- Is your "ready to run" status on or off?
- Who has sent you connection requests?

Every screen in the app can read from this memory and update it.

### 🃏 Reusable Cards (Components)
We built some **reusable building blocks** — like LEGO pieces — that get used on many screens:

- **RunnerCard** — A little card showing a runner's info (used on the Discover screen)
- **ClubCard** — A card showing a run club's info
- **RunEventCard** — A card showing a run event with its RSVP buttons
- **StatusBadge** — A tiny green or blue sticker that says "Ready now!" or "Tonight 6–8 PM"

---

## How the App Flows (Start to Finish)

```
Open App
   ↓
Welcome Screen
   ↓
Tap "Get Started" → Sign Up → Verify Email
   ↓
Role Select Screen: "Runner" or "Club Leader"
   ↓
[Runner] ──→ Discover / Ready / Messages / Profile tabs
[Leader] ──→ Dashboard / Schedule / Events / Announcements / Safety tabs
```

---

## What Happens Next? (Future Plans)

Right now the app uses **fake data** (we made it up). In the future:
- The fake data gets replaced with a real database (like **Firebase** or **Supabase**)
- Real messages can be sent between runners
- Maps will show actual routes
- Push notifications will alert runners about new requests or weather updates

It's like building a model car first, then building the real car with an actual engine!

---

## Summary in One Sentence

PaceMatch is a running buddy app where runners find each other by speed and goals, set "I'm ready now" statuses, and run club leaders manage their groups — all with a friendly, easy-to-use design that works on both iPhones and Android phones.

🏃💨
