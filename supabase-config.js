/**
 * Supabase Configuration & Data Bridge for Romantic Birthday Web Application
 * Provides seamless sync between Supabase PostgreSQL database, the hidden /admin portal,
 * and the public romantic birthday experience for Michelle.
 */

// Default credentials can be set here or entered directly inside the /admin portal UI (stored in localStorage)
const DEFAULT_SUPABASE_URL = "https://gbvxbxxteqmludxghrgw.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdidnhieHh0ZXFtbHVkeGdocmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMzQ1MjQsImV4cCI6MjEwNzcxMDUyNH0.y0UmPdJ8PsVU6mX0PjxymDGcBBFmFMno9_0XcHLNKas";

// Storage keys
const SB_URL_KEY = 'bday_supabase_url';
const SB_KEY_KEY = 'bday_supabase_anon_key';
const SB_CACHE_KEY = 'bday_cached_site_data';
const ADMIN_PIN_KEY = 'bday_admin_pin';
const PIGGY_PROGRESS_KEY = 'bday_piggy_game_progress';

// Default Admin PIN (can be customized in admin settings)
const DEFAULT_ADMIN_PIN = "1019"; // Michelle's Birthday date!

/**
 * DEFAULT PROGRESSION FOR "Train Your Si Gina Piggy Boyfriend! 🐷"
 */
const DEFAULT_PIGGY_PROGRESS = {
  currentDay: 1, // 1 to 5
  weight: 15.0, // 15kg to 100kg
  fullness: 50, // 0% to 100%
  cleanliness: 25, // 0% to 100% (starts low with mud)
  obedience: 30, // 0% to 100%
  tasks: {
    fedCount: 0, // Target: 3 per day
    isScrubbed: false, // Target: 1 per day
    isWhacked: false, // Target: 1 per day
    isDanced: false // Target: 1 per day
  },
  currentAccessory: "none", // none, pacifier, maid, tutu, crown, poop
  isCompleted: false, // Reached 100kg & Day 5!
  unlockedVault: false,
  completedEvents: [],
  lastUpdated: null
};

// Global Supabase client instance
let _supabaseClient = null;

function getSupabaseConfig() {
  const url = localStorage.getItem(SB_URL_KEY) || DEFAULT_SUPABASE_URL;
  const anonKey = localStorage.getItem(SB_KEY_KEY) || DEFAULT_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

function setSupabaseConfig(url, anonKey) {
  if (url) localStorage.setItem(SB_URL_KEY, url.trim());
  else localStorage.removeItem(SB_URL_KEY);

  if (anonKey) localStorage.setItem(SB_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(SB_KEY_KEY);

  _supabaseClient = null; // Reset client
}

function initSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || typeof window.supabase === 'undefined') {
    return null;
  }
  try {
    _supabaseClient = window.supabase.createClient(url, anonKey);
    return _supabaseClient;
  } catch (err) {
    console.warn('[Supabase] Init error:', err);
    return null;
  }
}

/**
 * DEFAULT INITIAL SITE DATA
 * Used as high-fidelity fallback whenever offline or before first Supabase sync
 */
const DEFAULT_SITE_DATA = {
  general: {
    gfName: "Michelle",
    authorName: "Forever Yours, Chan Tse Hong (Lengzai糠) ❤️",
    birthdayDate: "2026-10-19",
    birthdayDisplay: "October 19",
    headerBadge: "Oct 19 Edition",
    specialStatusBadge: "✨ Special Day",
    musicUrl: "", // Custom audio MP3 URL if desired
    heroTitle: "The Story of Us So Far",
    heroSubtitle: "Scroll down to blow out the birthday candles together and watch our love journey unfold!"
  },
  piggyGame: {
    faceUrl: "", // Chan Tse Hong's custom face cutout uploaded via admin
    showSnout: true,
    title: "Train Your Si Gina Piggy Boyfriend! 🐷",
    initialWeight: 15.0,
    targetWeight: 100.0,
    totalDays: 5
  },
  scrollScene: {
    phase1Badge: "🕯️ Phase 1: Make a Birthday Wish...",
    phase1Sub: "Sweet Childhood Memories • October 19",
    phase1Main: "Two little kids taking a deep breath to make the biggest wish...",
    phase2Badge: "💨 Phase 2: Blowing Out the Candles Together!",
    phase2Sub: "1... 2... 3... Blow! 💨",
    phase2Main: "Through a cloud of birthday smoke, time begins to fly...",
    phase3Badge: "🥐 Phase 3: Look At Us Now!",
    phase3Sub: "From Little Kids to Forever Partners",
    phase3Main: "Wait... the birthday cake turned into a cute little croissant?! 🥐😮",
    phase4Badge: "🎉 Phase 4: Wish Granted! Happy Birthday Michelle!",
    phase4Sub: "October 19 • Forever & Always 💖",
    phase4Main: "Happy Birthday, Michelle! Every wish led me right to you. 🎂✨"
  },
  milestones: [
    {
      id: "m1",
      tag: "Milestone 01 • The Sparks ✨",
      title: "The Day We First Met",
      description: "The exact moment the universe decided to do me the biggest favor of my life. You looked at me with that gentle smile, and suddenly everything else faded into the background.",
      subtext: "Where our story officially began",
      icon: "coffee",
      imageUrl: "",
      frontQuote: "Butterflies, warm latte & laughter",
      frontHandwriting: '"That first warm smile"',
      backLog: "Memory Log #01",
      backNote: "I still remember my heart beating slightly too fast. I tried to act calm, but you already had my complete attention.",
      backFooter: "Best first impression ever ❤️"
    },
    {
      id: "m2",
      tag: "Milestone 02 • Road Trips 🗺️",
      title: "Our Favorite Getaway",
      description: "Driving down coastal highways with our favorite playlist singing at the top of our lungs. The golden sunset had nothing on the way you looked laughing beside me.",
      subtext: "Windows down, singing off-key with you",
      icon: "car",
      imageUrl: "",
      frontQuote: "Singing off-key, chasing orange skies",
      frontHandwriting: '"Every road leads to you"',
      backLog: "Memory Log #02",
      backNote: "That weekend proved to me that no matter where the road goes, home is simply wherever you are sitting next to me.",
      backFooter: "Favorite co-pilot for life 🚗"
    },
    {
      id: "m3",
      tag: "Milestone 03 • Comfort ☕",
      title: "Rainy Days & Sweet Treats",
      description: "Sharing warm bowls of noodles and splitting desserts we swore we were too full to eat. Finding total peace in the quiet moments between ordinary days.",
      subtext: "Cozy blankets, warm food & long talks",
      icon: "utensils",
      imageUrl: "",
      frontQuote: "Hot ramen, sweet desserts & warm hugs",
      frontHandwriting: '"Warmest safe haven"',
      backLog: "Memory Log #03",
      backNote: "It was in the simplest moments—eating good food and laughing at silly jokes—that I realized I fell completely in love with you.",
      backFooter: "My sweetest comfort food partner 🥟"
    },
    {
      id: "m4",
      tag: "Milestone 04 • Today & Always 🎉",
      title: "Happy Birthday, My Queen!",
      description: "Today is a celebration of the wonderful person you are. Every milestone has led us here, and I cannot wait for all the unwritten chapters waiting for us.",
      subtext: "October 19 • Celebrating you today",
      icon: "cake",
      imageUrl: "",
      frontQuote: "Blowing candles & making lifelong wishes",
      frontHandwriting: '"Here is to forever & more"',
      backLog: "Memory Log #04",
      backNote: "Happy Birthday, Michelle! I will always be your number one supporter, your best friend, and your biggest lover.",
      backFooter: "Forever yours, through every year 🎂"
    }
  ],
  quiz: [
    {
      id: "q1",
      question: "When is the first day we start our love?",
      options: ["12 July", "22 February", "24 September", "20 May"],
      correctIndex: 0,
      allCorrect: false,
      feedback: "Correct! July 12th was the best day ever — where our love story began! 💖",
      wrongFeedback: "Oops! How could you forget? It's 12 July! But don't worry, my love for you is still 100% 🥰"
    },
    {
      id: "q2",
      question: "Who is Si Gina?",
      options: ["陈梓糠", "Chan Tse Hong", "Covidopoly Loser", "Michelle's BB"],
      correctIndex: 0,
      allCorrect: true,
      feedback: "Spot on! He is all of them: your Covidopoly loser, Chan Tse Hong / 陈梓糠, and forever Michelle's BB! 😂❤️",
      wrongFeedback: ""
    },
    {
      id: "q3",
      question: "Guess who birthday today?",
      options: ["陈梓糠", "Chan Tse Hong", "zikang", "Lengzai糠"],
      correctIndex: 0,
      allCorrect: true,
      isTrickQuestion: true,
      feedback: "😏 Hehehe! I know today is definitely YOUR birthday, Michelle my queen! But all the options are me (Lengzai糠)! Happy Birthday to my favorite girl! 🎂✨",
      wrongFeedback: ""
    }
  ],
  arcade: {
    targetScore: 25,
    title: "Stage 2: Michelle's Sweet Catch Arcade",
    subtitle: "Catch falling treats to reach 25 points!"
  },
  museum: [
    {
      id: "e1",
      wing: "🍜 Culinary Archive",
      category: "food",
      title: "The Rainy Day Ramen Shop",
      desc: "The rain outside made the warm broth taste twice as delicious. We ordered extra gyoza without regrets.",
      badge: "Culinary Archive",
      icon: "🍜",
      imageUrl: ""
    },
    {
      id: "e2",
      wing: "🍰 Culinary Archive",
      category: "food",
      title: "Matcha & Strawberry Pastries",
      desc: "\"We're only having one slice to share,\" we said. We ended up ordering three desserts.",
      badge: "Culinary Archive",
      icon: "🍰",
      imageUrl: ""
    },
    {
      id: "e3",
      wing: "🌅 Adventure Wing",
      category: "adventures",
      title: "Sunset Over The Horizon",
      desc: "Sitting shoulder to shoulder watching the sky turn pink and lavender. You looked even more breathtaking than the view.",
      badge: "Hall of Adventures",
      icon: "🌅",
      imageUrl: ""
    },
    {
      id: "e4",
      wing: "🕶️ Candid Wing",
      category: "silly",
      title: "The Terrible Sunglasses Pose",
      desc: "Trying on ridiculous oversized neon sunglasses at that souvenir shop and daring each other not to laugh.",
      badge: "Candid Wing",
      icon: "🕶️",
      imageUrl: ""
    },
    {
      id: "e5",
      wing: "✨ Adventure Wing",
      category: "adventures",
      title: "Under The Starlit Sky",
      desc: "Looking up at the night sky talking about our future, our dreams, and all the places we have yet to see.",
      badge: "Hall of Adventures",
      icon: "🌌",
      imageUrl: ""
    }
  ],
  notes: [
    {
      id: "n1",
      tag: "Reminder #1",
      timeText: "Always",
      text: "You are genuinely the prettiest girl in every room you enter. Don't ever forget it.",
      color: "amber"
    },
    {
      id: "n2",
      tag: "Reminder #2",
      timeText: "Fact",
      text: "Thank you for being my patient listener, my favorite partner in crime, and my warm hug after a long day.",
      color: "rose"
    },
    {
      id: "n3",
      tag: "Reminder #3",
      timeText: "Promise",
      text: "No matter how many candles are on the cake, I'll always be right beside you cheering for your dreams.",
      color: "purple"
    }
  ],
  letter: {
    recipient: "Michelle",
    author: "Forever Yours, Chan Tse Hong (Lengzai糠) ❤️",
    body: `Happy Birthday, my dearest Michelle! 🌸\n\nFrom the moment you entered my world on 12 July, every ordinary day turned into a beautiful adventure. You bring so much genuine warmth, humor, and joy into my life. Thank you for being my patient listener, my favorite companion, and for simply being the incredible person you are.\n\nI hope this upcoming year brings you endless happiness, boundless success, and all the sweet dreams your heart has been wishing for. I promise to always stand by your side, cheering for your dreams and loving you more each day.\n\nHappy October 19th, Michelle! Today is entirely all about celebrating you. ✨`
  },
  vouchers: [
    {
      id: "v1",
      couponNo: "COUPON #01",
      icon: "🧋",
      title: "Unlimited Hugs & Bubble Tea Pass",
      desc: "Redeemable whenever you need a warm hug or sweet drink.",
      color: "rose"
    },
    {
      id: "v2",
      couponNo: "COUPON #02",
      icon: "🍷",
      title: "Fancy Dinner Date of Your Choice",
      desc: "Pick any restaurant in the city, fully on me with zero questions asked.",
      color: "amber"
    },
    {
      id: "v3",
      couponNo: "COUPON #03",
      icon: "✈️",
      title: "Weekend Getaway Trip Pass",
      desc: "Pack your bag for a relaxing weekend road trip to wherever you want.",
      color: "purple"
    },
    {
      id: "v4",
      couponNo: "COUPON #04",
      icon: "🧞",
      title: "One Golden Wish Granted",
      desc: "Valid for anything reasonable (or playfully silly) you request!",
      color: "emerald"
    }
  ],
  bucketList: [
    {
      id: "b1",
      title: "Chase the Northern Lights in a Glass Igloo",
      category: "travel",
      categoryLabel: "✈️ Epic Travels",
      emoji: "🌌",
      description: "Cuddle under warm blankets while Arctic aurora borealis ribbons dance across the sky together.",
      status: "wish",
      statusText: "Dreaming 💭",
      targetYear: "Next Winter",
      imageUrl: ""
    },
    {
      id: "b2",
      title: "Adopt Our Dream Golden Fur Baby",
      category: "cozy",
      categoryLabel: "🏡 Cozy Living",
      emoji: "🐶",
      description: "Bring our little puppy home, buy cute squeaky toys, and take him on sunny weekend park walks.",
      status: "wish",
      statusText: "Someday Soon ✨",
      targetYear: "Future Home",
      imageUrl: ""
    },
    {
      id: "b3",
      title: "Japan Cherry Blossom & Street Food Tour",
      category: "travel",
      categoryLabel: "✈️ Epic Travels",
      emoji: "🌸",
      description: "Walk down Kyoto under pink sakura blossoms, visit cozy late-night ramen shops, and feed deer in Nara.",
      status: "in-progress",
      statusText: "Planning 🎯",
      targetYear: "Next Vacation",
      imageUrl: ""
    },
    {
      id: "b4",
      title: "Master Our Signature Fresh Homemade Pasta",
      category: "foodie",
      categoryLabel: "🍜 Food Quests",
      emoji: "🍝",
      description: "Put on matching chef aprons, play Italian jazz, make messy fresh dough, and share a bottle of red wine.",
      status: "wish",
      statusText: "Date Night Idea 🍷",
      targetYear: "Cozy Sunday",
      imageUrl: ""
    },
    {
      id: "b5",
      title: "Design & Build Our Cozy Dream Sanctuary",
      category: "milestones",
      categoryLabel: "💍 Big Milestones",
      emoji: "🏡",
      description: "A sunlit home with a big kitchen, plant corners, comfy velvet couch, and room for all our memories.",
      status: "wish",
      statusText: "Lifetime Goal 💫",
      targetYear: "Forever",
      imageUrl: ""
    },
    {
      id: "b6",
      title: "Late Night Drive to Watch a Meteor Shower",
      category: "cozy",
      categoryLabel: "🏡 Cozy Living",
      emoji: "🌠",
      description: "Drive out past city lights to the quiet hills, recline our car seats, open the sunroof, and count stars.",
      status: "in-progress",
      statusText: "Next Clear Sky 🚗",
      targetYear: "Soon",
      imageUrl: ""
    },
    {
      id: "b7",
      title: "Celebrate Michelle's Big Birthday Like a Queen",
      category: "milestones",
      categoryLabel: "💍 Big Milestones",
      emoji: "🎂",
      description: "Give her the sweetest celebration, heartfelt surprises, and make sure she knows she's loved endlessly.",
      status: "achieved",
      statusText: "Achieved Today! 🎉",
      targetYear: "October 19",
      imageUrl: ""
    }
  ]
};

/**
 * Load Site Configuration
 * 1. Tries Supabase table `birthday_site_data` (row with id = 'main')
 * 2. If Supabase is not configured or network fails, falls back to localStorage cache
 * 3. If cache is empty, falls back to DEFAULT_SITE_DATA
 */
async function loadSiteConfig() {
  let cached = null;
  try {
    const raw = localStorage.getItem(SB_CACHE_KEY);
    if (raw) cached = JSON.parse(raw);
  } catch (e) {}

  const client = initSupabaseClient();
  if (!client) {
    return cached || DEFAULT_SITE_DATA;
  }

  try {
    const { data, error } = await client
      .from('birthday_site_data')
      .select('data')
      .eq('id', 'main')
      .single();

    if (error) {
      console.warn('[Supabase] Select warning:', error.message);
      return cached || DEFAULT_SITE_DATA;
    }

    if (data && data.data) {
      const merged = deepMerge(DEFAULT_SITE_DATA, data.data);
      localStorage.setItem(SB_CACHE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('[Supabase] Fetch error:', err);
  }

  return cached || DEFAULT_SITE_DATA;
}

/**
 * Save Site Configuration
 * 1. Saves to local cache
 * 2. Upserts to Supabase table `birthday_site_data`
 */
async function saveSiteConfig(newData) {
  // Always update local cache immediately for zero latency
  try {
    localStorage.setItem(SB_CACHE_KEY, JSON.stringify(newData));
  } catch (e) {}

  const client = initSupabaseClient();
  if (!client) {
    return { success: true, cloud: false, message: "Saved locally! (Connect Supabase in Admin Settings to sync to cloud)" };
  }

  try {
    const { error } = await client
      .from('birthday_site_data')
      .upsert({
        id: 'main',
        data: newData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] Upsert error:', error);
      return { success: false, cloud: false, error: error.message };
    }

    return { success: true, cloud: true, message: "Successfully synced and saved to Supabase cloud! ☁️✨" };
  } catch (err) {
    console.error('[Supabase] Exception on save:', err);
    return { success: false, cloud: false, error: err.message };
  }
}

/**
 * Upload Image Helper
 * If Supabase Storage bucket 'birthday_media' is configured, uploads directly to cloud storage.
 * Otherwise, can convert to Base64 data URL.
 */
async function uploadMediaFile(file) {
  const client = initSupabaseClient();
  if (client) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { data, error } = await client.storage
        .from('birthday_media')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = client.storage
          .from('birthday_media')
          .getPublicUrl(fileName);
        if (publicUrlData && publicUrlData.publicUrl) {
          return { success: true, url: publicUrlData.publicUrl };
        }
      }
    } catch (e) {
      console.warn('[Supabase Storage] Fallback to base64:', e);
    }
  }

  // Fallback: Read as Base64 Data URL (compressed if image)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ success: true, url: e.target.result });
    reader.onerror = () => resolve({ success: false, error: "Failed to read file" });
    reader.readAsDataURL(file);
  });
}

// Deep merge helper
function deepMerge(target, source) {
  if (!source) return target;
  const output = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key]) && key in target) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

/**
 * PIGGY SIMULATION GAME PERSISTENCE
 * Loads and saves Michelle's game progress seamlessly across Supabase and local cache
 */
async function loadPiggyGame() {
  let cached = null;
  try {
    const raw = localStorage.getItem(PIGGY_PROGRESS_KEY);
    if (raw) cached = JSON.parse(raw);
  } catch (e) {}

  const client = initSupabaseClient();
  if (!client) {
    return cached ? Object.assign({}, DEFAULT_PIGGY_PROGRESS, cached) : Object.assign({}, DEFAULT_PIGGY_PROGRESS);
  }

  try {
    const { data, error } = await client
      .from('birthday_site_data')
      .select('data')
      .eq('id', 'piggy_game')
      .single();

    if (!error && data && data.data) {
      const merged = Object.assign({}, DEFAULT_PIGGY_PROGRESS, data.data);
      localStorage.setItem(PIGGY_PROGRESS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('[Supabase] loadPiggyGame error:', err);
  }

  return cached ? Object.assign({}, DEFAULT_PIGGY_PROGRESS, cached) : Object.assign({}, DEFAULT_PIGGY_PROGRESS);
}

async function savePiggyGame(progress) {
  if (!progress) return { success: false, error: "No progress data" };
  progress.lastUpdated = new Date().toISOString();

  // Instant local persistence for zero latency
  try {
    localStorage.setItem(PIGGY_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {}

  const client = initSupabaseClient();
  if (!client) {
    return { success: true, cloud: false, message: "Progress saved locally!" };
  }

  try {
    const { error } = await client
      .from('birthday_site_data')
      .upsert({
        id: 'piggy_game',
        data: progress,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] savePiggyGame error:', error);
      return { success: false, cloud: false, error: error.message };
    }
    return { success: true, cloud: true, message: "Piggy progress synced to Supabase! 🐷☁️" };
  } catch (err) {
    console.warn('[Supabase] savePiggyGame exception:', err);
    return { success: false, cloud: false, error: err.message };
  }
}

async function resetPiggyGame() {
  const fresh = Object.assign({}, DEFAULT_PIGGY_PROGRESS, { lastUpdated: new Date().toISOString() });
  return await savePiggyGame(fresh);
}

// Attach to window for script access
window.BirthdayDB = {
  loadSiteConfig,
  saveSiteConfig,
  loadPiggyGame,
  savePiggyGame,
  resetPiggyGame,
  getSupabaseConfig,
  setSupabaseConfig,
  initSupabaseClient,
  uploadMediaFile,
  DEFAULT_SITE_DATA,
  DEFAULT_PIGGY_PROGRESS,
  ADMIN_PIN_KEY,
  DEFAULT_ADMIN_PIN
};
