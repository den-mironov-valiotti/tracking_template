<script>
(function() {
  var LOCAL_STORAGE_KEY = 'session_data';
  var currentHost = window.location.hostname;

  function log() {
    if (false) console.log.apply(console, ['[ccr_analytics]'].concat([].slice.call(arguments)));
  }

  function getUTMParams() {
    var params = new URLSearchParams(window.location.search);
    var utms = {};
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_campaign_id', 'gclid'];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = params.get(key);
      if (value) utms[key] = value;
    }
    log('UTM parameters:', utms);
    return utms;
  }

  function getAllQueryParams() {
    var params = new URLSearchParams(window.location.search);
    var raw = {};
    params.forEach(function(value, key) {
      raw[key] = value;
    });
    log('Raw URL parameters:', raw);
    return raw;
  }

  function isNonDirect(utmParams, referrer) {
    var result = Object.keys(utmParams).length > 0 || (referrer && referrer.indexOf(currentHost) === -1);
    log('Is non-direct traffic:', result);
    return result;
  }

  function getGACookies() {
    var cookies = document.cookie.split('; ');
    var cookieMap = {};
    for (var i = 0; i < cookies.length; i++) {
      var pair = cookies[i].split('=');
      cookieMap[pair[0]] = pair[1];
    }

    var ga_cookie = cookieMap._ga || '';
    var ga4_data = {};

    for (var key in cookieMap) {
      if (key.indexOf('_ga_') === 0 && key !== '_ga') {
        ga4_data[key] = {
          session_cookie: cookieMap[key], // raw GS cookie value
          session_key: key, // cookie key name
          client_id: ga_cookie.split('.').slice(2).join('.') // parsed from _ga cookie
        };
      }
    }

    log('GA cookies parsed:', ga4_data);
    return {
      ga_cookie: ga_cookie,
      ga4: ga4_data
    };
  }

  function track_user(newData, overwrite) {
    if (overwrite === void 0) overwrite = true;
    var existingData = {};
    try {
      existingData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
    } catch (e) {
      log('Failed to parse existing session data:', e);
    }

    var mergedData = overwrite ? mergeObjects(existingData, newData) : mergeObjects(newData, existingData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
    log('Session data saved:', mergedData);
  }

  function mergeObjects(obj1, obj2) {
    var result = {};
    for (var key in obj1) result[key] = obj1[key];
    for (var key in obj2) result[key] = obj2[key];
    return result;
  }

  var utmParams = getUTMParams();
  var rawParams = getAllQueryParams();
  var referrer = document.referrer;
  var pageUrl = window.location.href;
  var cleanUrl = window.location.origin + window.location.pathname;
  var gaCookieData = getGACookies();

  var dataToSave = {
    utm: utmParams,
    raw_parameters: rawParams,
    referrer: referrer || '',
    page: pageUrl,
    clean_url: cleanUrl,
    ga_cookie: gaCookieData.ga_cookie, // Full _ga cookie with client id
    ga4: gaCookieData.ga4, // Nested GA4 cookie/session structure with tag breakdowns
    timestamp: Date.now()
  };

  var nonDirect = isNonDirect(utmParams, referrer);
  track_user(dataToSave, nonDirect);
})();
</script>


// function ccr_analytics(debug = false) {
//   const LOCAL_STORAGE_KEY = 'session_data';
//   const currentHost = window.location.hostname;

//   function log(...args) {
//     if (debug) console.log('[ccr_analytics]', ...args);
//   }

//   function getUTMParams() {
//     const params = new URLSearchParams(window.location.search);
//     const utms = {};
//     ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_campaign_id', 'gclid'].forEach(key => {
//       const value = params.get(key);
//       if (value) utms[key] = value;
//     });
//     log('UTM parameters:', utms);
//     return utms;
//   }

//   function getAllQueryParams() {
//     const params = new URLSearchParams(window.location.search);
//     const raw = {};
//     for (const [key, value] of params.entries()) {
//       raw[key] = value;
//     }
//     log('Raw URL parameters:', raw);
//     return raw;
//   }

//   function isNonDirect(utmParams, referrer) {
//     const result = Object.keys(utmParams).length > 0 || (referrer && !referrer.includes(currentHost));
//     log('Is non-direct traffic:', result);
//     return result;
//   }

//   function getGACookies() {
//     const cookies = document.cookie.split('; ').reduce((acc, pair) => {
//       const [key, value] = pair.split('=');
//       acc[key] = value;
//       return acc;
//     }, {});

//     const ga_cookie = cookies._ga || '';
//     const ga_session_key = Object.keys(cookies).find(k => k.startsWith('_ga_') && k !== '_ga');
//     const ga_session_cookie = ga_session_key ? cookies[ga_session_key] : '';

//     log('GA cookies (raw):', { ga_cookie, ga_session_cookie });
//     return { ga_cookie, ga_session_cookie, ga_cookie_key: '_ga', ga_session_key };
//   }

//   function getLastSubmitEventId() {
//     try {
//       const data = JSON.parse(localStorage.getItem('last_submit_event'));
//       const eventId = data?.ga_event_id || null;
//       log('Last GA event ID:', eventId);
//       return eventId;
//     } catch (e) {
//       log('Failed to parse last_submit_event:', e);
//       return null;
//     }
//   }

//   function track_user(newData, overwrite = true) {
//     let existingData = {};
//     try {
//       existingData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
//     } catch (e) {
//       log('Failed to parse existing session data:', e);
//     }

//     const mergedData = overwrite ? { ...existingData, ...newData } : { ...newData, ...existingData };
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedData));
//     log('Session data saved:', mergedData);
//   }

//   function getGAClientId(callback) {
//     if (typeof gtag !== 'undefined') {
//       gtag('get', 'G-0DV54HZ9MB', 'client_id', function (clientID) {
//         localStorage.setItem('ga_client_id', clientID);
//         log('GA client ID from gtag:', clientID);
//         if (callback) callback(clientID);
//       });
//     } else {
//       log('gtag is not defined');
//       if (callback) callback('');
//     }
//   }

//   const utmParams = getUTMParams();
//   const rawParams = getAllQueryParams();
//   const referrer = document.referrer;
//   const pageUrl = window.location.href;
//   const cleanUrl = window.location.origin + window.location.pathname;
//   const gaCookieData = getGACookies();
//   const submitEventId = getLastSubmitEventId();

//   const dataToSave = {
//     utm: utmParams,
//     raw_parameters: rawParams,
//     referrer: referrer || '',
//     page: pageUrl,
//     clean_url: cleanUrl,
//     ga_cookie: gaCookieData.ga_cookie,
//     ga_session_cookie: gaCookieData.ga_session_cookie,
//     ga_cookie_key: gaCookieData.ga_cookie_key,
//     ga_session_key: gaCookieData.ga_session_key,
//     ga_event_id: submitEventId || '',
//     timestamp: Date.now()
//   };

//   const nonDirect = isNonDirect(utmParams, referrer);

//   getGAClientId(function (clientId) {
//     dataToSave.ga_client_id = clientId || '';
//     track_user(dataToSave, nonDirect); // overwrite only if non-direct
//   });
// }

ccr_analytics(true);
