# **COMPREHENSIVE SYSTEM PROMPT: "For Her" Multi-Device Sync + Music System**

---

## **PROJECT OVERVIEW**

You are building a **"For Her" digital gift experience** — a beautiful, cinematic slideshow with synchronized music that plays across multiple devices in real-time. The system consists of three main components:

1. **Admin Panel** (`admin.html`) — Create/edit slides, upload audio/images, customize everything
2. **Main Site** (`index.html`) — Display the slideshow with synced audio/animations
3. **Backend Engine** (`app.js`) — Handle cross-device synchronization, audio playback, slide transitions

### **Core Requirements**

#### **1. DEVICE SYNCHRONIZATION**
- Changes made on **any device** must appear on **all other devices** instantly
- Use **WebSocket** (or Firebase/Supabase) for real-time sync
- Admin edits slides → all watching devices update immediately without reload
- One device plays → all devices see same slide + hear same music (within 500ms tolerance)
- Use **localStorage + IndexedDB + WebSockets** trinity for bulletproof sync

#### **2. AUDIO SYSTEM**
- **Upload MP3/WAV/OGG** directly in admin panel
- Store as **base64 in IndexedDB** (no server needed initially)
- **Sync playback across devices** (press play on Device A → Device B starts at same timestamp)
- **Fade in/out** with custom durations
- **Loop seamlessly** without silence
- **Resume functionality** — if device goes offline, resume from correct position when reconnected
- Support **multiple audio tracks per session** (switch songs between slides)
- **Audio visualizer** (optional but beautiful) — animated bars that respond to frequency

#### **3. REAL-TIME ADMIN EDITING**
- Admin changes slide text → appears on live view immediately
- Admin uploads new image → all viewers see updated slide without page reload
- Admin adds new slide → shifts appear in sequence on all devices
- Admin changes music track → synced playback restarts on all devices
- **Conflict resolution** — if admin and viewer try to edit simultaneously, admin wins

#### **4. MULTI-DEVICE COORDINATION**
- **Master Device** (admin or first device to press play) controls playback
- **Follower Devices** sync to master's timeline
- If master stops, all followers pause
- If follower gets ahead/behind, snap to master time (±500ms correction)
- **Offline support** — devices continue locally until reconnected, then re-sync

#### **5. CUSTOMIZATION PERSISTENCE**
All these settings sync across devices:
- Slide text, images, timings, animations
- Audio files (base64 stored)
- End card messages (birthday message, recipient name)
- Page title, button text, colors
- Music fade durations and volumes

---

## **TECHNICAL ARCHITECTURE**

### **Database Structure (IndexedDB + WebSocket)**

```
ForHerDB/
├── slides
│   ├── id: slideID
│   ├── text: string
│   ├── image: base64
│   ├── duration: ms
│   ├── kenBurns: enum
│   ├── position: enum
│   └── lines: []
├── songs
│   ├── id: songID
│   ├── title: string
│   ├── audioData: base64
│   ├── volume: 0-1
│   ├── fadeIn: ms
│   └── fadeOut: ms
├── endCard
│   ├── pre: string
│   ├── title: string
│   ├── sub: string
│   └── msg: string
├── page
│   ├── name: string
│   ├── btn: string
│   ├── title: string
│   └── colors: {}
└── syncState
    ├── currentSlide: number
    ├── isPlaying: boolean
    ├── timestamp: ms
    ├── deviceId: string
    └── lastUpdate: timestamp
```

### **WebSocket Messages**

```javascript
// Admin → Server → All Viewers
{
  type: 'SLIDE_UPDATE',
  deviceId: 'admin-device-1',
  slideId: 5,
  data: { text: 'New text...', image: 'data:image/...' },
  timestamp: 1704067200000
}

// Master Device → Server → Followers
{
  type: 'PLAYBACK_SYNC',
  deviceId: 'master-device',
  currentSlide: 3,
  timestamp: 5000,
  isPlaying: true,
  masterTime: 1704067200000
}

// Admin Changes Audio
{
  type: 'AUDIO_UPDATE',
  deviceId: 'admin-device-1',
  songId: 0,
  audioData: 'data:audio/...',
  volume: 0.85,
  fadeIn: 800,
  timestamp: 1704067200000
}

// Device Reconnects
{
  type: 'SYNC_REQUEST',
  deviceId: 'device-5',
  lastSyncTime: 1704067195000
}

// Server Sends Full State
{
  type: 'FULL_SYNC',
  slides: [...],
  songs: [...],
  currentSlide: 3,
  timestamp: 5000,
  masterDeviceId: 'master-device'
}
```

---

## **ADMIN PANEL REQUIREMENTS** (`admin.html`)

### **Tabs & Features**

1. **Slides Tab**
   - List all slides with previews
   - Edit: text, image, duration, Ken Burns effect, position, tint overlay
   - Add/delete/duplicate/reorder slides
   - Real-time preview
   - Drag-and-drop reordering

2. **Songs Tab**
   - Upload MP3/WAV/OGG files (drag-and-drop support)
   - Set: title, start time, volume, fade in/out times
   - Audio player preview (shows duration)
   - Associate songs with slides
   - Replace/delete audio files

3. **End Card Tab**
   - Edit: pre-title, main title, subtitle, message
   - Live preview with animations
   - Customizable styling (fonts, colors, spacing)

4. **Edit Page Tab**
   - Main page title, subtitle, button text
   - Recipient's name (dynamic in title)
   - Theme colors (accent, background)
   - OG/social media preview text

5. **Export Tab**
   - Download as `content.json`
   - Copy JSON to clipboard
   - Import from JSON (drag-drop)
   - Reset to defaults

### **Admin-Specific Features**
- **Live Preview Window** showing what viewers see
- **Device Status Panel** — see all connected devices, their position, online/offline status
- **Broadcast Control** — force all devices to specific slide, pause/resume all
- **Sync Monitor** — confirm changes pushed to all devices
- **Conflict Resolution** — show if user on Device B tries to edit (lock or merge)

---

## **MAIN SITE REQUIREMENTS** (`index.html`)

### **Key Sections**

1. **Intro Page**
   - Centered title: "For [Name]"
   - Dynamically pull name from config
   - Button: "Begin" (or custom text)
   - Fade in/out animations
   - Hidden until play is pressed

2. **Slide Viewer**
   - Full-screen image background
   - Ken Burns motion (zoom, pan, drift)
   - Text overlay (bottom, center, or custom position)
   - Multiple lyric lines with staggered animations
   - Scene counter (e.g., "03 / 16")
   - Progress bar at top
   - Music visualizer at bottom-left
   - Song title display at bottom-right

3. **End Card**
   - Shows after last slide
   - Ornamental decoration (petals, lines, diamond)
   - Messages from admin
   - "Watch Again" button
   - Optional: confetti animation, music fade

### **Playback Controls**
- **Start Button** — starts slideshow, plays audio
- **Keyboard Shortcuts**
  - Right arrow / Space → next slide
  - Left arrow → previous slide
  - M → mute audio
  - F → fullscreen
- **Auto-advance** → slides progress automatically based on duration
- **Music sync** → audio stays perfectly in sync even if slide skipped

---

## **APP.JS ENGINE REQUIREMENTS**

### **Core Functions**

```javascript
// Initialization
init()
  - Initialize IndexedDB
  - Load from local DB first, fallback to content.json
  - Connect to WebSocket
  - Build DOM
  - Setup audio elements
  - Listen for sync messages

// Slide Management
goSlide(index)
  - Animate current slide out
  - Animate next slide in
  - Update progress bar
  - Switch audio track
  - Broadcast to all devices: "I'm on slide X at timestamp Y"

// Audio Management
playAudio(index)
  - Fade in from 0 to target volume
  - Start at configured time offset
  - Loop seamlessly at end

stopAudio(index)
  - Fade out over duration
  - Pause, don't stop

switchAudio(fromIdx, toIdx)
  - Fade out current
  - Fade in new track
  - Maintain slide timing

// Sync Management
handlePlaybackSync(message)
  - If I'm master: ignore (I control)
  - If I'm follower: snap to master timestamp if off by >500ms
  - Update currentSlide, timestamp, isPlaying

handleAdminUpdate(message)
  - Update local IndexedDB
  - Re-render affected slide
  - Restart audio if it changed
  - DON'T reload page

handleFullSync(message)
  - Replace entire state with server version
  - Re-render everything
  - Catch up to current slide/timestamp

// WebSocket Connection
connectWebSocket()
  - Establish persistent connection
  - Retry with exponential backoff
  - Set unique deviceId (UUID)
  - Listen for all message types
  - Auto-reconnect on disconnect

// Device Status
reportStatus()
  - Every 5 seconds, send: { deviceId, currentSlide, timestamp, isPlaying }
  - Helps admin see where everyone is

// Offline Support
goOffline() / goOnline()
  - Offline: pause audio, warn user
  - Online: sync with server, resume
```

### **State Management**

```javascript
const appState = {
  // Content
  slides: [],
  songs: [],
  endCard: {},
  page: {},
  
  // Playback
  currentSlide: -1,
  isPlaying: false,
  timestamp: 0, // ms within slide
  
  // Device
  deviceId: 'unique-uuid',
  isMaster: false,
  isOnline: true,
  
  // Sync
  masterDeviceId: null,
  masterTimestamp: null,
  lastSyncTime: 0
}
```

---

## **SYNCHRONIZATION FLOW**

### **User Presses Play on Device A**

1. Device A sends: `{ type: 'PLAYBACK_START', deviceId: 'A', timestamp: 0 }`
2. Server broadcasts to all devices: `{ type: 'MASTER_SET', masterId: 'A' }`
3. Devices B, C, D listen to Device A's playback updates
4. Device A sends every 100ms: `{ type: 'PLAYBACK_TICK', slide: 3, timestamp: 5234 }`
5. Followers update their own timestamp to match (if within sync tolerance)
6. If Device B gets ahead: snap back to Device A's time
7. If Device A goes offline: Server picks next device as master (or prompts admin)

### **Admin Changes Slide Text**

1. Admin types in text field
2. LocalStorage + IndexedDB update immediately (feel instant)
3. Admin HTML broadcasts: `{ type: 'SLIDE_UPDATE', slideId: 5, data: {...} }`
4. Server forwards to all devices
5. Device A playing: doesn't re-render current slide (stays smooth), buffers change for next time it shows
6. Device B waiting: immediately shows updated slide
7. All devices update IndexedDB (so if page reloads, change is there)

### **Admin Uploads New Audio File**

1. Admin selects MP3 file
2. Browser reads as base64 (happens in background)
3. IndexedDB stores immediately (large blob, OK because IndexedDB has 50GB+ limit)
4. Admin HTML broadcasts: `{ type: 'AUDIO_UPDATE', songId: 0, audioData: 'data:audio/...' }`
5. Server forwards to all devices
6. All devices update their audio element's `src` to new base64
7. If currently playing: stops gracefully, replays with new audio
8. If not playing: buffered until slide's music track is needed

---

## **OFFLINE + RECONNECT STRATEGY**

### **When Device Goes Offline**
- IndexedDB still has all data locally
- Audio can still play (it's in memory)
- Slides still work
- Show banner: "Offline — syncing when connection returns"
- Queue any admin changes and retry

### **When Device Reconnects**
- Send: `{ type: 'SYNC_REQUEST', deviceId, lastSyncTime }`
- Server responds with updates since `lastSyncTime`
- Merge changes with local state
- Re-sync playback time with master device
- Hide offline banner

---

## **PERFORMANCE & CONSTRAINTS**

### **File Size Limits**
- Audio files: max 10MB (base64 explodes to 133% size, so ~7.5MB actual)
- Images: max 5MB (users will compress anyway)
- Total state size: keep under 50MB (IndexedDB is plenty)

### **Sync Tolerance**
- Master device broadcasts every 100ms
- Followers sync if off by >500ms
- Audio fade transitions: 800ms-1200ms (smooth but not laggy)

### **Latency Handling**
- Network roundtrip: ~100-200ms typical
- Video-grade sync not needed (music + slides, tolerance is 500ms)
- If WebSocket is slow, still works, just slightly delayed

---

## **RESPONSIVE DESIGN**

### **Desktop**
- Full 16:9 slideshow
- Sidebar now shows device list, current song, slide counter
- Admin panel full-featured

### **Mobile/Tablet**
- Full-screen slideshow (safe for phones)
- Text sizes adjust with `clamp()`
- Touch-friendly: tap to next slide, pinch for fullscreen
- Admin panel simplified (stack tabs vertically)

---

## **ACCESSIBILITY & USABILITY**

### **Admin**
- Keyboard shortcuts for common tasks (Ctrl+S to save, Ctrl+Z undo)
- Undo/redo stack for accidental changes
- Toast notifications for all actions
- Loading spinners during sync
- Clear error messages (not just "Error")

### **Viewer**
- Captions for audio (optional)
- Keyboard-navigable
- High contrast mode for readability
- Works in light + dark browser modes

---

## **ERROR HANDLING**

### **Audio Fails to Play**
- Show subtle warning: "Audio unavailable"
- Slides still proceed normally
- Offer to re-download audio from server

### **WebSocket Disconnects**
- Auto-retry with exponential backoff (1s, 2s, 4s, 8s max)
- Show connection status indicator
- Buffer changes until reconnected

### **Admin Edits Conflict**
- Device B tries to edit slide 5 while Device A is editing
- Lock mechanism: first editor gets lock, second gets "someone else editing" message
- Auto-release lock after 30s of inactivity

### **IndexedDB Quota Exceeded**
- Offer to export + clear cache
- Suggest reducing image quality
- Warn user before they hit limit

---

## **TESTING CHECKLIST**

- [ ] Upload audio on Device A, appears on Device B in <2 seconds
- [ ] Edit slide text on admin, live viewers see it without reload
- [ ] Press play on Device A, Device B auto-syncs (same slide, ±500ms audio)
- [ ] Offline: Device A continues playing, goes online, re-syncs perfectly
- [ ] Multiple audio tracks: switching songs is seamless (fade in/out works)
- [ ] Image upload: base64 displays correctly, file size handled
- [ ] Mobile responsive: all text readable, buttons tappable
- [ ] Keyboard: arrow keys advance slides, plays nicely
- [ ] End card: animations trigger, custom text displays
- [ ] Page refresh: all content persists (IndexedDB)
- [ ] Export JSON: contains all data (images, audio, text)
- [ ] Import JSON: replaces content, all devices see new version
- [ ] Master device goes offline: next device becomes master
- [ ] Device count: admin sees accurate list

---

## **DELIVERABLES**

You will build/provide:

1. **admin.html** — Complete admin panel with all tabs, upload, preview, export
2. **index.html** — Main slideshow with animations, audio, keyboard controls
3. **app.js** — Engine handling sync, audio, slides, WebSocket
4. **server.js** (Node.js) — WebSocket server for real-time sync (or Firebase alternative)
5. **styles.css** — All styling (already excellent in your current code, maintain)
6. **service-worker.js** — (Optional) offline support & caching
7. **README.md** — Setup instructions, how to deploy

---

## **DEPLOYMENT**

### **Local Testing**
```bash
npm install
node server.js
# Open http://localhost:3000 on multiple devices
```

### **Production (Choose One)**
- **Heroku** + WebSocket support
- **Firebase** (Realtime Database for sync)
- **Vercel** + Upstash Redis for WebSocket fallback
- **AWS** + API Gateway + DynamoDB

---

## **FUTURE ENHANCEMENTS**

- [ ] Share link: QR code for viewers to join
- [ ] Viewer voting: upvote favorite slides (heart icon)
- [ ] Recording: save playback to video
- [ ] Analytics: which slides got rewound, skipped, etc.
- [ ] Themes: preset color schemes beyond gold/blue
- [ ] Text-to-speech for lyrics
- [ ] Reactions: emoji reactions overlay on slides
- [ ] Comments: viewers leave messages that admin sees

---

**This is your complete specification. Every detail matters — from a 500ms sync tolerance to what happens when WiFi drops. Build it well, and it will be a gift someone treasures forever.** 🎵✨
