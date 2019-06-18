function decodeTdBeacon(raw) {
    decoded = decodeURIComponent(escape(atob(raw)));
    return JSON.parse(decoded);
}

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        chrome.tabs.query({
            active: true,
            windowId: chrome.windows.WINDOW_ID_CURRENT
        }, (result) => {
            var currentTab = result.shift();
            if (details.url.match(/\/event\/.*?\?api_key=.*?&data=.*&callback.*/)) {
                var parser = new URL(details.url);
                var pathItems = parser.pathname.split('/');
                var response = decodeTdBeacon(parser.searchParams.get("data"));
                response['(protocol)'] = parser.protocol;
                response['(endpoint)'] = parser.hostname;
                response['(sdk)'] = pathItems[1];
                response['(database)'] = pathItems[4];
                response['(table)'] = pathItems[5];
                response['(apiKey)'] = parser.searchParams.get("api_key");
                response['(modified)'] = parser.searchParams.get("modified");
                response['(callback)'] = parser.searchParams.get("callback");
                chrome.tabs.sendMessage(currentTab.id, response);
            }
        });
    },
    {urls: ['<all_urls>']},
    []
);
