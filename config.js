// ============================================
// CONFIGURATION
// ============================================
// This file provides DEFAULT values only.
// Visit setup.html to configure your personal settings.
// All settings are stored in browser localStorage.

const CONFIG = {
  // Speed dial links
  speedDial: [
    // Configure in setup.html
  ],

  // Weather settings
  weather: {
    city: 'Auckland' // Configure in setup.html
  },

  // RSS Feeds
  rss: [
    // Configure in setup.html
  ],

  // Google Calendar settings
  calendar: {
    apiKey: '', // Configure in setup.html
    calendarIds: [],
    publicUrls: [],
    maxResults: 10
  },

  // Radio stations
  radio: [
    // Configure in setup.html
  ],

  // iMood settings
  imood: {
    userId: 'USERNAME' // Configure in setup.html
  },

  // Refresh intervals (in milliseconds)
  refresh: {
    clock: 1000,
    weather: 1800000, // 30 minutes
    rss: 600000, // 10 minutes
    calendar: 600000 // 10 minutes
  }
};

// Load user configuration from localStorage
(function loadUserConfig() {
  const userConfig = localStorage.getItem('newtab_config');
  
  if (userConfig) {
    try {
      const config = JSON.parse(userConfig);
      
      // Override with user settings
      if (config.speedDial && config.speedDial.length > 0) {
        CONFIG.speedDial = config.speedDial;
      }
      
      if (config.city) {
        CONFIG.weather.city = config.city;
      }
      
      if (config.rss && config.rss.length > 0) {
        CONFIG.rss = config.rss;
      }
      
      if (config.calendarApiKey) {
        CONFIG.calendar.apiKey = config.calendarApiKey;
      }
      if (config.calendarIds && config.calendarIds.length > 0) {
        CONFIG.calendar.calendarIds = config.calendarIds;
      }
      if (config.calendarPublicUrls && config.calendarPublicUrls.length > 0) {
        CONFIG.calendar.publicUrls = config.calendarPublicUrls;
      }
      
      if (config.radio && config.radio.length > 0) {
        CONFIG.radio = config.radio;
      }
      
      if (config.imoodUser) {
        CONFIG.imood.userId = config.imoodUser;
      }
      
      // Update username in header if provided
      if (config.username) {
        document.addEventListener('DOMContentLoaded', () => {
          const headerTitle = document.querySelector('.window-title .title-text');
          if (headerTitle) {
            headerTitle.textContent = `${config.username}@newtab:~$`;
          }
        });
      }
    } catch (e) {
      console.error('Error loading user config:', e);
    }
  }
})();
