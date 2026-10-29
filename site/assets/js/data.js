/*
  Hardcore Fitness Winter Garden — editable site data.
  Change class times, coaches, events and prices here; every page reads from this file.

  DRAFT: class/coach per time slot, events and prices below are SAMPLE data
  for the first draft. Replace them with the real ones before launch.
*/
window.HF = {
  gym: {
    name: "Hardcore Fitness Winter Garden",
    street: "1401 Beulah Rd, Ste 100",
    city: "Winter Garden, FL 34787",
    phone: "407-993-7000",
    tel: "+14079937000",
    mapsQuery: "1401 Beulah Rd Ste 100, Winter Garden, FL 34787",
    timeZone: "America/New_York",
    classMinutes: 60
  },

  // Free class sign-ups go to the gym's ClubReady account through ClubReady's web lead form.
  // The key is the same public key used in ClubReady's own embed code.
  // smsOptInRequired mirrors ClubReady's form rule; set false if the owner makes it optional there.
  signup: {
    action: "https://app.clubready.com/admin/api/apiformsub.asp",
    apiKey: "892664D05AC557790F6E8932CE011EF6C15B69ED55025471",
    smsOptInRequired: true
  },

  classes: {
    lift: {
      name: "Lift",
      blurb: "The class that started it all. Split-body resistance training mixed with cardio, a different muscle focus every day.",
      tags: "Strength · Resistance · Cardio",
      img: "assets/img/photos/group-lift.jpg"
    },
    fight: {
      name: "Fight Camp",
      blurb: "HIIT meets MMA-style striking. You wear a heart-rate monitor and watch your effort and calories in real time.",
      tags: "Conditioning · Striking · Heart rate",
      img: "assets/img/photos/fight-pads.jpg"
    },
    booty: {
      name: "Booty Camp",
      blurb: "A lower-body circuit that burns calories and builds glutes and legs. Workouts designed by national and international physique competitors.",
      tags: "Lower body · Circuit · Toning",
      img: "assets/img/photos/booty-floor.jpg"
    }
  },

  // role: shown under the name. Bios are placeholders until each coach writes their own.
  coaches: [
    { id: "felix", name: "Felix Valentin", role: "Owner", owner: true },
    { id: "rob", name: "Rob Roche", role: "Head Trainer" },
    { id: "sergio", name: "Sergio Padilla", role: "Coach" },
    { id: "karen", name: "Karen West", role: "Coach" },
    { id: "jordan", name: "Jordan Howard", role: "Coach" },
    { id: "david", name: "David Alston", role: "Coach" }
  ],

  // Day keys: 0 = Sunday ... 6 = Saturday. Each entry: [ "HH:MM" 24h, classKey, coachId ]
  // Class TIMES are real (from the gym). Which class and coach runs each time is still SAMPLE.
  schedule: {
    1: [["05:15", "lift", "rob"], ["06:45", "fight", "david"], ["08:00", "lift", "karen"], ["09:15", "booty", "karen"], ["12:00", "lift", "rob"], ["16:45", "lift", "sergio"], ["18:00", "fight", "david"], ["19:15", "booty", "jordan"]],
    2: [["05:15", "lift", "sergio"], ["06:45", "booty", "karen"], ["08:00", "lift", "rob"], ["09:15", "fight", "david"], ["12:00", "lift", "jordan"], ["16:45", "lift", "rob"], ["18:00", "booty", "jordan"], ["19:15", "fight", "sergio"]],
    3: [["05:15", "lift", "rob"], ["06:45", "fight", "david"], ["08:00", "lift", "karen"], ["09:15", "booty", "karen"], ["12:00", "lift", "rob"], ["16:45", "lift", "sergio"], ["18:00", "fight", "david"], ["19:15", "booty", "jordan"]],
    4: [["05:15", "lift", "sergio"], ["06:45", "booty", "karen"], ["08:00", "lift", "rob"], ["09:15", "fight", "david"], ["12:00", "lift", "jordan"], ["16:45", "lift", "rob"], ["18:00", "booty", "jordan"], ["19:15", "fight", "sergio"]],
    5: [["05:15", "lift", "rob"], ["06:45", "fight", "david"], ["08:00", "lift", "karen"], ["09:15", "booty", "karen"], ["12:00", "lift", "jordan"], ["16:45", "lift", "sergio"], ["18:00", "fight", "rob"]],
    6: [["06:45", "lift", "rob"], ["08:00", "fight", "david"], ["09:15", "booty", "karen"]],
    0: [["08:00", "lift", "sergio"], ["09:15", "fight", "rob"]]
  },

  events: [
    { date: "2026-10-24", time: "09:15", title: "Bring-a-Friend Saturday", text: "Bring someone who has been asking about the gym. They train free, side by side with you, in the 9:15 Booty Camp.", tags: ["Free for guests", "Booty Camp"] },
    { date: "2026-10-30", time: "18:00", title: "Halloween Fight Camp", text: "Costumes on, gloves on. A regular Fight Camp hour with a playlist to match. Best costume picks the finisher.", tags: ["Members + guests", "Fight Camp"] },
    { date: "2026-11-07", time: "08:00", title: "60-Day Challenge Kickoff", text: "Starting measurements, your meal plan set up in the HCF Diet App, and your first challenge workout. Ends January 6.", tags: ["Sign-up required", "All classes"] },
    { date: "2026-11-26", time: "08:00", title: "Thanksgiving Morning Burn", text: "One big Lift class before the food. Partner stations, all levels.", tags: ["Members + guests", "Lift"] },
    { date: "2026-12-13", time: "09:15", title: "Holiday Partner Workout + Toy Drive", text: "Bring a new, unwrapped toy and train with a partner. Toys go to a local Winter Garden family charity.", tags: ["Bring a toy", "Partner format"] }
  ],

  // price: null shows "Ask us" until the owner sets it.
  plans: [
    { name: "First class", price: "Free", per: "One visit", text: "Any class on the schedule. Meet a coach, try the screens, see if it fits.", cta: "Book it", featured: false },
    { name: "Class pack", price: null, per: "8 classes / month", text: "Two or three classes a week. Good if you also run, ride or train elsewhere.", cta: "Ask about packs", featured: false },
    { name: "Unlimited", price: null, per: "Per month", text: "Every Lift, Fight Camp and Booty Camp class, seven days a week.", cta: "Start with a free class", featured: true },
    { name: "60-Day Challenge", price: null, per: "Add-on", text: "Measurements at day 1 and day 60, a nutrition plan in the HCF Diet App, and a coach checking in.", cta: "Ask about the next start", featured: false }
  ]
};
