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
                var response = {
                    '(protocol)': parser.protocol,
                    '(endpoint)':parser.hostname,
                    '(sdk)':pathItems[1],
                    '(database)':pathItems[4],
                    '(table)':pathItems[5],
                    '(apiKey)':parser.searchParams.get("api_key"),
                    '(modified)':parser.searchParams.get("modified"),
                    '(callback)':parser.searchParams.get("callback")
                };
                var data = decodeTdBeacon(parser.searchParams.get("data"));

                for (var key in data) {
                    if(typeof data[key] === 'object'){
                        response[key] = JSON.stringify(data[key]);
                    }else{
                        response[key] = data[key];
                    }
                }
                chrome.tabs.sendMessage(currentTab.id, response);
            }
        });
    },
    {urls: ['<all_urls>']},
    []
);
