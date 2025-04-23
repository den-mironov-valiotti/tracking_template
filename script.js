
// add to form tracking
 gtag('get', 'G-0DV54HZ9MB', 'session_id', (id) => { console.log(id); } ); // get session_id
 gtag('get', 'G-0DV54HZ9MB', 'client_id', (id) => { console.log(id); } ); //get client_id
  var referrer = document.referrer; // referrer
  var pageUrl = window.location.href; // full url
// and get utms and ref/pageUrl/cleanUrl - from session storage if current url doenst have them
// 
<script>
function va_analytics(debug) {
  var LOCAL_STORAGE_KEY = '_va_session_data';
  var currentHost = window.location.hostname;

  function log() {
    if (debug) console.log.apply(console, ['[va_analytics]'].concat([].slice.call(arguments)));
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

  function isNonDirect(utmParams, referrer) {
    var result = Object.keys(utmParams).length > 0 || (referrer && referrer.indexOf(currentHost) === -1);
    log('Is non-direct traffic:', result);
    return result;
  }

  function shouldUpdate(newIsNonDirect) {
    try {
      var stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
      var existingIsNonDirect = stored && stored.utm_params && Object.keys(stored.utm_params).length > 0 || (stored.referrer && stored.referrer.indexOf(currentHost) === -1);
      return newIsNonDirect || !existingIsNonDirect;
    } catch (e) {
      return true;
    }
  }

  function track_user(newData, overwrite) {
    if (overwrite === void 0) overwrite = true;
    if (overwrite) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
      log('Session data saved:', newData);
    } else {
      log('Skipped storing session data due to overwrite = false');
    }
  }

  var utmParams = getUTMParams();
  var referrer = document.referrer;
  var pageUrl = window.location.href;

  var dataToSave = {
    utm_params: utmParams,
    referrer: referrer || '',
    page_url: pageUrl,
    timestamp: Date.now()
  };

  var nonDirect = isNonDirect(utmParams, referrer); // check current visit
  var allowUpdate = shouldUpdate(nonDirect); // check last saved sources 
  track_user(dataToSave, allowUpdate); // allow update if nonDirect = true every time or if nonDirect = false and last source is also non direct
}

va_analytics(true);
</script>
