function ccr_analytics(debug = false) {
  const LOCAL_STORAGE_KEY = 'session_data';
  const currentHost = window.location.hostname;

  function log(...args) {
    if (debug) console.log('[ccr_analytics]', ...args);
  }

  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utms = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_c_id', 'gclid'].forEach(key => {
      const value = params.get(key);
      if (value) utms[key] = value;
    });
    log('UTM parameters:', utms);
    return utms;
  }

  function getAllQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const raw = {};
    for (const [key, value] of params.entries()) {
      raw[key] = value;
    }
    log('Raw URL parameters:', raw);
    return raw;
  }

  function isNonDirect(utmParams, referrer) {
    const result = Object.keys(utmParams).length > 0 || (referrer && !referrer.includes(currentHost));
    log('Is non-direct traffic:', result);
    return result;
  }

  function getGACookies() {
    const cookies = document.cookie.split('; ').reduce((acc, pair) => {
      const [key, value] = pair.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const ga_cookie = cookies._ga || '';
    const ga_session_key = Object.keys(cookies).find(k => k.startsWith('_ga_') && k !== '_ga');
    const ga_session_cookie = ga_session_key ? cookies[ga_session_key] : '';

    log('GA cookies (raw):', { ga_cookie, ga_session_cookie });
    return { ga_cookie, ga_session_cookie, ga_cookie_key: '_ga', ga_session_key };
  }

  function getLastSubmitEventId() {
    try {
      const data = JSON.parse(localStorage.getItem('last_submit_event'));
      const eventId = data?.ga_event_id || null;
      log('Last GA event ID:', eventId);
      return eventId;
    } catch (e) {
      log('Failed to parse last_submit_event:', e);
      return null;
    }
  }

  function track_user(newData, overwrite = true) {
    let existingData = {};
    try {
      existingData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
    } catch (e) {
      log('Failed to parse existing session data:', e);
    }

    const mergedData = overwrite ? { ...existingData, ...newData } : { ...newData, ...existingData };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
    log('Session data saved:', mergedData);
  }

  function getGAClientId(callback) {
    if (typeof gtag !== 'undefined') {
      gtag('get', '<GA_MEASUREMENT_ID>', 'client_id', function (clientID) {
        localStorage.setItem('ga_client_id', clientID);
        log('GA client ID from gtag:', clientID);
        if (callback) callback(clientID);
      });
    } else {
      log('gtag is not defined');
      if (callback) callback('');
    }
  }

  const utmParams = getUTMParams();
  const rawParams = getAllQueryParams();
  const referrer = document.referrer;
  const pageUrl = window.location.href;
  const cleanUrl = window.location.origin + window.location.pathname;
  const gaCookieData = getGACookies();
  const submitEventId = getLastSubmitEventId();

  const dataToSave = {
    utm: utmParams,
    raw_parameters: rawParams,
    referrer: referrer || '',
    page: pageUrl,
    clean_url: cleanUrl,
    ga_cookie: gaCookieData.ga_cookie,
    ga_session_cookie: gaCookieData.ga_session_cookie,
    ga_cookie_key: gaCookieData.ga_cookie_key,
    ga_session_key: gaCookieData.ga_session_key,
    ga_event_id: submitEventId || '',
    timestamp: Date.now()
  };

  const nonDirect = isNonDirect(utmParams, referrer);

  getGAClientId(function (clientId) {
    dataToSave.ga_client_id = clientId || '';
    track_user(dataToSave, nonDirect); // overwrite only if non-direct
  });
}

ccr_analytics(true);
