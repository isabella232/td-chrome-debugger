var mapping = {};
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('./mapping.json'), true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            mapping = JSON.parse(xhr.responseText);
        }
    };
    xhr.send();
}

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        chrome.tabs.query({
            active: true,
            windowId: chrome.windows.WINDOW_ID_CURRENT
        }, (result) => {
            var currentTab = result.shift();
            if (details.url.match(/\/ingestly-ingest\/.*/)) {
                var parser = new URL(details.url);
                var response = {
                    Protocol: {Column: '__n/a__', Value: parser.protocol},
                    Endpoint: {Column: '__n/a__', Value: parser.hostname}
                };
                for(var param of parser.searchParams){
                    response[param[0]] = {
                        Column: mapping[param[0]],
                        Value: param[1]
                    };
                }
                chrome.tabs.sendMessage(currentTab.id, response);
            }
        });
    },
    {urls: ['<all_urls>']},
    []
);

