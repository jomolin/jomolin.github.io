// ============================================
// NEWTAB HOMEPAGE SCRIPT
// ============================================

// Utilities
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ============================================
// THEME MANAGEMENT
// ============================================
function initTheme() {
  const body = document.body;
  
  // Check for saved theme preference, otherwise use system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const shouldUseDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
  
  if (shouldUseDark) {
    body.classList.add('dark-theme');
  }
  
  // Update toggle button icon
  updateThemeToggleIcon();
  
  // Setup toggle button
  const toggleBtn = $('#theme-toggle');
  toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeToggleIcon();
    updateImoodTheme(); // Update iMood colors when theme changes
  });
}

function updateThemeToggleIcon() {
  const toggleBtn = $('#theme-toggle');
  const isDark = document.body.classList.contains('dark-theme');
  // Show sun when in dark mode (click to go light)
  // Show moon when in light mode (click to go dark)
  toggleBtn.textContent = isDark ? '☀' : '☾';
}

// ============================================
// SPEED DIAL
// ============================================
function initSpeedDial() {
  const speedDialEl = $('#speed-dial');
  
  if (!CONFIG.speedDial || CONFIG.speedDial.length === 0) {
    speedDialEl.innerHTML = '<span style="opacity: 0.6;">No links configured. Click ⚙ to add.</span>';
    return;
  }
  
  CONFIG.speedDial.forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    a.textContent = link.name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    speedDialEl.appendChild(a);
  });
}

// ============================================
// CLOCK & DATE
// ============================================
function updateClock() {
  const now = new Date();
  
  const time = now.toLocaleTimeString('en-NZ', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  });
  
  const date = now.toLocaleDateString('en-NZ', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  $('#clock').textContent = time;
  $('#date').textContent = date;
}

// ============================================
// WEATHER (wttr.in)
// ============================================
async function updateWeather() {
  const weatherEl = $('#weather');
  
  try {
    // Custom format string for consistent, detailed output
    // %l = location, %C = condition, %t = temp, %f = feels like, %w = wind, %p = precipitation
    const format = '%l: %C\n🌡️%t 🤚%f 🌬️%w 🌧️%p';
    const response = await fetch(`https://wttr.in/${CONFIG.weather.city}?format=${encodeURIComponent(format)}`);
    const text = await response.text();
    
    if (text && !text.includes('Unknown location')) {
      weatherEl.textContent = text.trim();
      weatherEl.classList.remove('error', 'loading');
    } else {
      weatherEl.textContent = 'Location not found';
      weatherEl.classList.add('error');
      weatherEl.classList.remove('loading');
    }
  } catch (error) {
    weatherEl.textContent = 'Failed to load weather';
    weatherEl.classList.add('error');
    weatherEl.classList.remove('loading');
  }
}

// ============================================
// IMOOD
// ============================================
function initImood() {
  // Set initial iMood link and badge with configured userId
  const imoodLink = $('#imood-status a');
  const imoodBadge = $('#imood-badge');
  
  imoodLink.href = `https://www.imood.com/users/${CONFIG.imood.userId}`;
  
  // Set initial badge (will be updated by theme)
  const isDark = document.body.classList.contains('dark-theme');
  const fgColor = isDark ? 'ffffff' : '000000';
  imoodBadge.src = `https://moods.imood.com/display/uname-${CONFIG.imood.userId}/fg-${fgColor}/trans-1/imood.gif`;
}

function setupImoodButton() {
  $('#imood-update').addEventListener('click', () => {
    window.open(
      'https://www.imood.com/updater',
      'imood_updater',
      'resizable,scrollbars,width=360,height=640'
    );
  });
}

function updateImoodTheme() {
  const imoodBadge = $('#imood-badge');
  const isDark = document.body.classList.contains('dark-theme');
  
  // Change fg color based on theme (000000 for light, ffffff for dark)
  const fgColor = isDark ? 'ffffff' : '000000';
  imoodBadge.src = `https://moods.imood.com/display/uname-${CONFIG.imood.userId}/fg-${fgColor}/trans-1/imood.gif`;
}

// ============================================
// RADIO
// ============================================
let currentStation = null;
let isPlaying = false;
let startTime = null;
let timerInterval = null;
const audioPlayer = $('#audio-player');

function setupRadio() {
  const stationDisplay = $('#station-display');
  const stationDropdown = $('#station-dropdown-custom');
  const playPauseBtn = $('#play-pause-btn');
  const stopBtn = $('#stop-btn');
  const prevBtn = $('#prev-btn');
  const nextBtn = $('#next-btn');
  const shuffleBtn = $('#shuffle-btn');
  
  // Populate custom dropdown
  CONFIG.radio.forEach((station, index) => {
    const option = document.createElement('div');
    option.className = 'station-option';
    option.textContent = station.name;
    option.dataset.index = index;
    option.addEventListener('click', () => {
      selectStation(index);
      stationDropdown.style.display = 'none';
      // Auto-play the selected station
      playRadio();
    });
    stationDropdown.appendChild(option);
  });
  
  // Toggle dropdown on display click
  stationDisplay.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = stationDropdown.style.display === 'block';
    stationDropdown.style.display = isVisible ? 'none' : 'block';
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!stationDropdown.contains(e.target) && e.target !== stationDisplay) {
      stationDropdown.style.display = 'none';
    }
  });
  
  // Play/Pause button
  playPauseBtn.addEventListener('click', () => {
    if (currentStation === null) return;
    
    if (isPlaying) {
      pauseRadio();
    } else {
      playRadio();
    }
  });
  
  // Stop button
  stopBtn.addEventListener('click', () => {
    stopRadio();
  });
  
  // Previous button
  prevBtn.addEventListener('click', () => {
    if (currentStation === null) {
      selectStation(0);
    } else {
      const prevIndex = currentStation === 0 ? CONFIG.radio.length - 1 : currentStation - 1;
      selectStation(prevIndex);
      if (isPlaying) playRadio();
    }
  });
  
  // Next button
  nextBtn.addEventListener('click', () => {
    if (currentStation === null) {
      selectStation(0);
    } else {
      const nextIndex = (currentStation + 1) % CONFIG.radio.length;
      selectStation(nextIndex);
      if (isPlaying) playRadio();
    }
  });
  
  // Shuffle button
  shuffleBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * CONFIG.radio.length);
    selectStation(randomIndex);
    if (isPlaying) playRadio();
  });
  
  // Listen for metadata
  audioPlayer.addEventListener('loadedmetadata', updateNowPlaying);
  audioPlayer.addEventListener('playing', updateNowPlaying);
  
  // Metadata updates
  setInterval(() => {
    if (isPlaying && currentStation !== null) {
      updateNowPlaying();
    }
  }, 10000);
}

function playRadio() {
  audioPlayer.play();
  isPlaying = true;
  startTime = Date.now();
  $('#play-pause-btn').textContent = '⏸';
  $('#play-pause-btn').title = 'Pause';
  
  // Start timer
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  
  // Update now playing
  updateNowPlaying();
}

function pauseRadio() {
  audioPlayer.pause();
  isPlaying = false;
  $('#play-pause-btn').textContent = '▶';
  $('#play-pause-btn').title = 'Play';
  
  if (timerInterval) clearInterval(timerInterval);
  
  // Update display
  updateNowPlaying();
}

function stopRadio() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  isPlaying = false;
  startTime = null;
  $('#play-pause-btn').textContent = '▶';
  $('#radio-time').textContent = '00:00';
  
  if (timerInterval) clearInterval(timerInterval);
}

function updateTimer() {
  if (!startTime) return;
  
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  $('#radio-time').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateNowPlaying() {
  const stationDisplay = $('#station-display');
  
  if (currentStation === null) {
    stationDisplay.textContent = '» NO STATION «';
    return;
  }
  
  const stationName = CONFIG.radio[currentStation].name;
  
  // Try to get metadata from mediaSession
  if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
    const metadata = navigator.mediaSession.metadata;
    if (metadata.title && metadata.title !== stationName) {
      const songInfo = metadata.artist 
        ? `${metadata.artist} - ${metadata.title}`
        : metadata.title;
      stationDisplay.textContent = `» ${songInfo} «`;
      return;
    }
  }
  
  // Fallback: just show station name
  stationDisplay.textContent = `» ${stationName} «`;
}

function selectStation(index) {
  currentStation = index;
  const station = CONFIG.radio[index];
  
  audioPlayer.src = station.url;
  audioPlayer.load();
  
  $('#station-display').textContent = `» ${station.name} «`;
}

// ============================================
// GOOGLE CALENDAR
// ============================================
async function updateCalendar() {
  const calendarEl = $('#calendar');
  
  // Try API key method first (real-time, supports multiple calendars)
  if (CONFIG.calendar.apiKey && CONFIG.calendar.calendarIds && CONFIG.calendar.calendarIds.length > 0) {
    try {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Fetch all calendars in parallel
      const calendarPromises = CONFIG.calendar.calendarIds.map(async (calendarId) => {
        try {
          const params = new URLSearchParams({
            key: CONFIG.calendar.apiKey,
            timeMin: now.toISOString(),
            timeMax: endOfDay.toISOString(),
            maxResults: CONFIG.calendar.maxResults,
            singleEvents: true,
            orderBy: 'startTime'
          });
          
          const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
          const response = await fetch(url);
          
          if (!response.ok) {
            const errorText = await response.text();
            return [];
          }
          
          const data = await response.json();
          return data.items || [];
        } catch (error) {
          return [];
        }
      });
      
      const allCalendarEvents = await Promise.all(calendarPromises);
      const events = allCalendarEvents.flat();
      
      if (events.length === 0) {
        calendarEl.innerHTML = '<div class="no-events">No events today</div>';
        return;
      }
      
      // Sort all events by time
      events.sort((a, b) => {
        const aTime = new Date(a.start.dateTime || a.start.date);
        const bTime = new Date(b.start.dateTime || b.start.date);
        return aTime - bTime;
      });
      
      // Limit to maxResults
      const displayEvents = events.slice(0, CONFIG.calendar.maxResults);
      
      const eventsHTML = displayEvents.map(event => {
        const start = event.start.dateTime || event.start.date;
        const startTime = new Date(start).toLocaleTimeString('en-NZ', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        return `
          <div class="calendar-event">
            <div class="event-time">${startTime}</div>
            <div class="event-title">${event.summary || 'Untitled Event'}</div>
          </div>
        `;
      }).join('');
      
      calendarEl.innerHTML = eventsHTML;
      return;
      
    } catch (error) {
      calendarEl.innerHTML = '<div class="error">Failed to load calendar</div>';
      return;
    }
  }
  
  // Fallback to public URLs (free option, supports multiple calendars)
  if (CONFIG.calendar.publicUrls && CONFIG.calendar.publicUrls.length > 0) {
    try {
      // Fetch all calendars in parallel
      const calendarPromises = CONFIG.calendar.publicUrls.map(async (url, index) => {
        try {
          // Use CORS proxy since Google blocks direct calendar access from browsers
          const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
          const response = await fetch(proxiedUrl);
          const icalData = await response.text();
          const events = parseICalForToday(icalData);
          return events;
        } catch (error) {
          return [];
        }
      });
      
      const allCalendarEvents = await Promise.all(calendarPromises);
      const events = allCalendarEvents.flat();
      
      if (events.length === 0) {
        calendarEl.innerHTML = '<div class="no-events">No events today</div>';
        return;
      }
      
      // Sort all events by time
      events.sort((a, b) => a.date - b.date);
      
      // Limit to maxResults
      const displayEvents = events.slice(0, CONFIG.calendar.maxResults);
      
      const eventsHTML = displayEvents.map(event => {
        return `
          <div class="calendar-event">
            <div class="event-time">${event.time}</div>
            <div class="event-title">${event.title}</div>
          </div>
        `;
      }).join('');
      
      calendarEl.innerHTML = eventsHTML;
      return;
    } catch (error) {
      calendarEl.innerHTML = '<div class="error">Failed to load calendars</div>';
      return;
    }
  }
  
  // Fallback to API key method (requires paid Google Cloud)
  if (!CONFIG.calendar.apiKey || !CONFIG.calendar.calendarId) {
    calendarEl.innerHTML = '<div class="no-events">Configure calendar in config.js</div>';
    return;
  }
  
  try {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const params = new URLSearchParams({
      key: CONFIG.calendar.apiKey,
      timeMin: now.toISOString(),
      timeMax: endOfDay.toISOString(),
      maxResults: CONFIG.calendar.maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CONFIG.calendar.calendarId)}/events?${params}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      calendarEl.innerHTML = '<div class="no-events">No events today</div>';
      return;
    }
    
    const eventsHTML = data.items.map(event => {
      const start = event.start.dateTime || event.start.date;
      const startTime = new Date(start).toLocaleTimeString('en-NZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      return `
        <div class="calendar-event">
          <div class="event-time">${startTime}</div>
          <div class="event-title">${event.summary || 'Untitled Event'}</div>
        </div>
      `;
    }).join('');
    
    calendarEl.innerHTML = eventsHTML;
    
  } catch (error) {
    calendarEl.innerHTML = '<div class="error">Failed to load calendar</div>';
  }
}

function parseICalForToday(icalData) {
  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Split into events
  const eventBlocks = icalData.split('BEGIN:VEVENT');
  
  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i];
    
    // Extract DTSTART and SUMMARY
    const dtStartMatch = block.match(/DTSTART[;:]([^\r\n]+)/);
    const summaryMatch = block.match(/SUMMARY:([^\r\n]+)/);
    
    if (!dtStartMatch) continue;
    
    let dtStart = dtStartMatch[1];
    const summary = summaryMatch ? summaryMatch[1].trim() : 'Untitled Event';
    
    // Handle VALUE=DATE:YYYYMMDD format
    if (dtStart.includes('VALUE=DATE:')) {
      dtStart = dtStart.split(':')[1];
    }
    
    // Handle TZID format (e.g., TZID=Pacific/Auckland:20231225T100000)
    if (dtStart.includes('TZID=')) {
      dtStart = dtStart.split(':')[1];
    }
    
    // Remove any remaining parameters
    dtStart = dtStart.split(':').pop().trim();
    
    // Parse date (handle both formats: YYYYMMDD and YYYYMMDDTHHMMSSZ)
    let eventDate;
    
    if (dtStart.includes('T')) {
      // Full datetime (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ)
      const cleanDtStart = dtStart.replace('Z', '');
      const year = parseInt(cleanDtStart.substring(0, 4));
      const month = parseInt(cleanDtStart.substring(4, 6)) - 1;
      const day = parseInt(cleanDtStart.substring(6, 8));
      const hour = parseInt(cleanDtStart.substring(9, 11));
      const minute = parseInt(cleanDtStart.substring(11, 13));
      eventDate = new Date(year, month, day, hour, minute);
    } else {
      // Date only (YYYYMMDD)
      const year = parseInt(dtStart.substring(0, 4));
      const month = parseInt(dtStart.substring(4, 6)) - 1;
      const day = parseInt(dtStart.substring(6, 8));
      eventDate = new Date(year, month, day, 0, 0);
    }
    
    // Check if event is today
    if (eventDate >= today && eventDate < tomorrow) {
      const time = eventDate.toLocaleTimeString('en-NZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      events.push({
        time: time,
        title: summary,
        date: eventDate
      });
    }
  }
  
  return events;
}

// ============================================
// RSS FEEDS
// ============================================
async function updateRSS() {
  const rssEl = $('#rss-feed');
  
  if (CONFIG.rss.length === 0) {
    rssEl.innerHTML = '<div class="no-events">Add RSS feeds in config.js</div>';
    return;
  }
  
  rssEl.innerHTML = '<div class="loading">Loading feeds...</div>';
  
  try {
    // Fetch all feeds in parallel for speed
    const feedPromises = CONFIG.rss.map(async (feedUrl, index) => {
      // Stagger requests slightly to avoid overwhelming the proxy
      await new Promise(resolve => setTimeout(resolve, index * 50));
      
      try {
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(feedUrl)}`);
        
        if (!response.ok) {
          return [];
        }
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        if (xmlDoc.querySelector('parsererror')) {
          return [];
        }
        
        const rssItems = xmlDoc.querySelectorAll('item');
        const atomEntries = xmlDoc.querySelectorAll('entry');
        
        const feedTitle = xmlDoc.querySelector('channel > title')?.textContent || 
                         xmlDoc.querySelector('feed > title')?.textContent ||
                         new URL(feedUrl).hostname;
        
        let items = [];
        
        if (rssItems.length > 0) {
          items = Array.from(rssItems).slice(0, 3).map(item => {
            const description = item.querySelector('description')?.textContent || 
                              item.querySelector('summary')?.textContent || '';
            const cleanDesc = description
              .replace(/<[^>]*>/g, '') // Strip HTML
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim()
              .substring(0, 100); // First 100 chars
            
            return {
              title: item.querySelector('title')?.textContent || 'Untitled',
              link: item.querySelector('link')?.textContent || '',
              pubDate: new Date(item.querySelector('pubDate')?.textContent || Date.now()),
              source: feedTitle,
              description: cleanDesc
            };
          });
        } else if (atomEntries.length > 0) {
          items = Array.from(atomEntries).slice(0, 3).map(entry => {
            const description = entry.querySelector('summary')?.textContent || 
                              entry.querySelector('content')?.textContent || '';
            const cleanDesc = description
              .replace(/<[^>]*>/g, '') // Strip HTML
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim()
              .substring(0, 100); // First 100 chars
            
            return {
              title: entry.querySelector('title')?.textContent || 'Untitled',
              link: entry.querySelector('link')?.getAttribute('href') || '',
              pubDate: new Date(entry.querySelector('published')?.textContent || 
                              entry.querySelector('updated')?.textContent || Date.now()),
              source: feedTitle,
              description: cleanDesc
            };
          });
        }
        
        return items;
      } catch (error) {
        return [];
      }
    });
    
    const allFeeds = await Promise.all(feedPromises);
    const allItems = allFeeds.flat();
    
    
    if (allItems.length === 0) {
      rssEl.innerHTML = '<div class="error">No feed items loaded. Error loading data</div>';
      return;
    }
    
    // Sort by date and take top 10
    allItems.sort((a, b) => b.pubDate - a.pubDate);
    const topItems = allItems.slice(0, 10);
    
    const feedHTML = topItems.map(item => {
      const timeAgo = getTimeAgo(item.pubDate);
      const descPreview = item.description ? `<div class="feed-description">${item.description}...</div>` : '';
      
      return `
        <div class="feed-item">
          <a href="${item.link}" target="_blank" class="feed-title">${item.title}</a>
          ${descPreview}
          <div class="feed-meta">
            <span class="feed-source">${item.source}</span> • ${timeAgo}
          </div>
        </div>
      `;
    }).join('');
    
    rssEl.innerHTML = feedHTML;
    
  } catch (error) {
    rssEl.innerHTML = '<div class="error">Failed to load feeds. Error loading data</div>';
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
  // Initialize theme
  initTheme();
  
  // Setup speed dial
  initSpeedDial();
  
  // Start clock
  updateClock();
  setInterval(updateClock, CONFIG.refresh.clock);
  
  // Load weather
  updateWeather();
  setInterval(updateWeather, CONFIG.refresh.weather);
  
  // Setup iMood
  initImood();
  setupImoodButton();
  updateImoodTheme(); // Set initial iMood colors based on theme
  
  // Setup radio
  setupRadio();
  
  // Load calendar
  updateCalendar();
  setInterval(updateCalendar, CONFIG.refresh.calendar);
  
  // Load RSS feeds
  updateRSS();
  setInterval(updateRSS, CONFIG.refresh.rss);
}

// Start everything when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
