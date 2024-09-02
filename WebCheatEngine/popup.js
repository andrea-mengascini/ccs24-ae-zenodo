function sendToInjected(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

/**
 *   ______               _     _      _     _
 *  |  ____|             | |   | |    (_)   | |
 *  | |____   _____ _ __ | |_  | |     _ ___| |_ ___ _ __   ___ _ __ ___
 *  |  __\ \ / / _ \ '_ \| __| | |    | / __| __/ _ \ '_ \ / _ \ '__/ __|
 *  | |___\ V /  __/ | | | |_  | |____| \__ \ ||  __/ | | |  __/ |  \__ \
 *  |______\_/ \___|_| |_|\__| |______|_|___/\__\___|_| |_|\___|_|  |___/
 */

const snapshotButton = document.getElementById('snapshotButton');
snapshotButton.addEventListener('click', function() {
    sendToInjected("snapshotClicked");
});

const removeChangedButton = document.getElementById('removeChangedButton');
removeChangedButton.addEventListener('click', function() {
    sendToInjected("removeChangedClicked");
});

const removeUnchangedButton = document.getElementById('removeUnchangedButton');
removeUnchangedButton.addEventListener('click', function() {
    sendToInjected("removeUnchangedClicked");
});

const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', function() {
    sendToInjected("downloadClicked");
});
