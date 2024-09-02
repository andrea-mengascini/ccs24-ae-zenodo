/**
 *   _____       _           _
 *  |_   _|     (_)         | |
 *    | |  _ __  _  ___  ___| |_
 *    | | | '_ \| |/ _ \/ __| __|
 *   _| |_| | | | |  __/ (__| |_
 *  |_____|_| |_| |\___|\___|\__|
 *             _/ |
 *            |__/
 */

// Inject the diff tracker script to body element
const body = document.getElementsByTagName('body')[0];
const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.runtime.getURL('diff_tracker.js'));
body.appendChild(script);

/**
 *   _____      _
 *  |  __ \    | |
 *  | |__) |___| | __ _ _   _
 *  |  _  // _ \ |/ _` | | | |
 *  | | \ \  __/ | (_| | |_| |
 *  |_|  \_\___|_|\__,_|\__, |
 *                       __/ |
 *                      |___/
 */

// Relay message from extension script to injected script
chrome.runtime.onMessage.addListener(
    function(message) {
        postMessage(message, '*');
    }
);

// Relay message from injected script to extension script
addEventListener('message', function(event) {
    if (event.data && event.data.replay === 'replay') {
        console.log("REPLAY");
    }
});
