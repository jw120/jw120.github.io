/*
 *
 * Global constants
 *
 */
var apiPrefix = "https://api.twitch.tv/kraken/streams/";
var apiSuffix = "?callback="; // Name of the callback is added by fetchJSONP
var localStorageKey = "channelNames";
var infoBoxIDPrefix = "info-";
/** Channels used on first startup (based on freecodecamp suggestions) */
var defaultChannels = [
    "esl_sc2", "ogamingsc2", "cretetion", "freecodecamp",
    "storbeck", "habathcx", "robotcaleb", "noobs2ninjas"
];
/** Used for channels before the API returns (same value as API returns for a channel that is offline) */
var nullAPIReturn = {
    stream: null
};
/** Palette of background-colours to use for online channels - taken from clrs.cc */
var channelColours = [
    "#7FDBFF", "#39CCCC", "#2ECC40", "#01FF70", "#FFDC00", "#FF851B", "#FF4136"
];
/** Background colour to use for offline channels */
var offlineChannelColour = "#DDDDDDD";
/**  Foreground colour for channels */
var channelForeground = "black";
/*
 *
 * Start-up code
 *
 */
run_when_document_ready(function () {
    // We use this variable to hold our programme state - it is passed to and modified by
    // sevral of our main functions. Here we set up the basic values
    // Keys are all held in lower case
    var trackedChannels = initializeTrackedChannels();
    setupHandlers(trackedChannels);
    var refreshControl = document.querySelector("#refresh-control");
    refreshControl.className = "fa fa-refresh control-icon fa-spin";
    fetchChannels(trackedChannels)
        .then(function () {
        updateDOM(trackedChannels);
        refreshControl.className = "fa fa-refresh control-icon";
    });
});
/*
 *
 * Top-level functions
 *
 */
/** Create our map of tracked channels and set up with saved or default names and null APIReturns */
function initializeTrackedChannels() {
    // If we have storage available and a valid stored value, use it
    if (storageAvailable("localStorage")) {
        try {
            var stored = JSON.parse(localStorage.getItem(localStorageKey));
            if (stored && Array.isArray(stored)) {
                return new Map(stored.map(function (channelName) { return [channelName, nullAPIReturn]; }));
            }
        }
        catch (e) {
            console.log("Caught in storage getting/parsing", e);
        }
    }
    // Otherwise, start with the defaults
    return new Map(defaultChannels.map(function (channelName) { return [channelName, nullAPIReturn]; }));
}
/** Attach handlers to the DOM */
function setupHandlers(channels) {
    // Filter buttons toggles between showing all channels or only those which are online
    document.querySelector("#online-filter").addEventListener("click", function () {
        updateDOM(channels);
    });
    // Refresh button re-fetches the tracked channels from the API and redraws the screen
    var refreshControl = document.querySelector("#refresh-control");
    refreshControl.addEventListener("click", function () {
        refreshControl.className = "fa fa-refresh control-icon fa-spin";
        fetchChannels(channels)
            .then(function () {
            updateDOM(channels);
            refreshControl.className = "fa fa-refresh control-icon";
        });
    });
    // Add button toggles displaying the pane for adding new channels
    document.querySelector("#add-control").addEventListener("click", function () {
        var bottom = document.getElementById("bottom-box");
        bottom.style.display = bottom.style.display === "block" ? "none" : "block";
        document.getElementById("add-input").focus();
    });
    // Submit on add form allows a channel to be added
    document.querySelector(".add-form").addEventListener("submit", function (event) {
        var input = document.getElementById("add-input");
        if (channels) {
            addChannel(channels, input.value);
            saveChannels(channels);
            fetchChannels(channels)
                .then(function () { return updateDOM(channels); });
        }
        input.value = "";
        event.preventDefault();
    });
    // Add file input reads a text file and adds each line as a channel
    document.querySelector("#add-file").addEventListener("change", function (event) {
        var target = event.target;
        var fileList = target.files;
        addChannelsFromFileHandler(channels, fileList)
            .then(function () {
            saveChannels(channels);
            return fetchChannels(channels);
        })
            .then(function () {
            updateDOM(channels);
            target.value = ""; // Remove the filename shown in the control
        });
    });
    // Share takes the list of tracked channels and puts onto the clipboard to allow for relatvely easy exporting
    document.querySelector("#share-control").addEventListener("click", function () {
        var exportText = Array.from(channels.keys()).join("\n");
        window.prompt("Text below is ready for copy/paste:", exportText);
    });
}
/** Use the API to update our tracked channels */
function fetchChannels(channels) {
    // Launch one async call for each tracked channel
    var keyValuePromises = Array.from(channels.keys()).map(function (channelName) { return jsonp(apiPrefix + channelName + apiSuffix)
        .then(function (apiReturn) { return [channelName, apiReturn]; }); });
    // Complete when all async calls have returned
    return Promise.all(keyValuePromises)
        .then(function (kvs) {
        kvs.forEach(function (pair) {
            channels.set(pair[0], pair[1]);
        });
    });
}
/**
 *
 * View functions (which update the DOM)
 *
 *
 */
/** Update the .lists div in the DOM with the the given channel values */
function updateDOM(channels) {
    var list = document.querySelector(".list");
    // Remove any old search results
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    /** Colour to use for the next online channel */
    var colIndex = 0;
    // Add each of the search results
    var channelsShown = 0;
    channels.forEach(function (res, channelName) {
        if (res.error) {
            console.log(channelName, "gave error", res);
            if (!document.getElementById("online-filter").checked) {
                list.appendChild(createChannel(channels, channelName, offlineChannelColour, ((res.message) + " (" + (res.status) + ", " + (res.error) + ", " + channelName + ")")));
                channelsShown++;
            }
        }
        else if (!res.stream) {
            if (!document.getElementById("online-filter").checked) {
                list.appendChild(createChannel(channels, channelName, offlineChannelColour, channelName));
                channelsShown++;
            }
        }
        else {
            list.appendChild(createChannel(channels, channelName, channelColours[colIndex]));
            colIndex = (colIndex + 1) % channelColours.length;
            channelsShown++;
        }
    });
    if (channelsShown === 0) {
        var msg = document.createElement("div");
        msg.className = "no-channels-message-box";
        msg.appendChild(document.createTextNode("No tracked channels"));
        list.appendChild(msg);
    }
    // Add dummy channels at the end so that the bottom row is filled and its channels are not too narrow
    for (var i = 0; i < 4; i++) {
        var dummyBox = document.createElement("div");
        dummyBox.className = "channel dummy";
        list.appendChild(dummyBox);
    }
}
/** Create a DOM node representing a channel that shows either the message if given or the stored value from the API */
function createChannel(channels, channelName, bgColour, message) {
    // Extract components of the channel's API informations
    var apiReturn = channels.get(channelName);
    var stream = (apiReturn && apiReturn.stream) ? apiReturn.stream : undefined;
    var channel = (stream && stream.channel) ? stream.channel : undefined;
    // Top-level box
    var box = document.createElement("div");
    box.className = "clickable channel " + (typeof message === "string" ? (message === "" ? "offline" : "error") : "online");
    box.style.color = channelForeground;
    box.style.backgroundColor = bgColour;
    // Top part of box is always visible - logo on the left (if online), name on right
    var topBox = document.createElement("div");
    topBox.className = "channel-top";
    box.appendChild(topBox);
    var leftBox = document.createElement("div");
    leftBox.className = "channel-top-left";
    if (channel && channel.logo) {
        var logo = document.createElement("img");
        logo.className = "channel-logo";
        logo.src = channel.logo;
        leftBox.appendChild(logo);
    }
    topBox.appendChild(leftBox);
    var rightBox = document.createElement("div");
    rightBox.className = "channel-top-right";
    var anchor = null;
    if (stream) {
        anchor = document.createElement("a");
        anchor.className = "channel-link";
        anchor.style.color = channelForeground;
        // Label is the returned display_name (which is capitalized) if available, or the requested (down-cased) key if not
        anchor.appendChild(document.createTextNode(stream.channel.display_name || channelName));
        anchor.href = stream.channel.url;
        rightBox.appendChild(anchor);
    }
    else {
        rightBox.appendChild(document.createTextNode(message || channelName));
    }
    box.addEventListener("click", function (ev) {
        if (ev.target !== anchor) {
            var e = document.getElementById(infoBoxIDPrefix + channelName);
            if (e) {
                e.style.display = e.style.display === "none" ? "flex" : "none";
            }
        }
    });
    topBox.appendChild(rightBox);
    // Bottom part has its display changed on click
    var infoBox = document.createElement("div");
    infoBox.className = "channel-info" + (typeof stream === "string" ? " offline" : "");
    infoBox.id = infoBoxIDPrefix + channelName;
    infoBox.style.display = "none";
    if (stream) {
        addInfoItem(infoBox, "Game", stream.channel.game);
        addInfoItem(infoBox, "Status", stream.channel.status);
        addInfoItem(infoBox, "Viewers", stream.viewers.toString());
        addInfoItem(infoBox, "Video", stream.video_height + "px, " + stream.average_fps.toFixed(0) + "fps");
    }
    var removeBox = document.createElement("div");
    removeBox.className = "remove-box";
    var removeIcon = document.createElement("i");
    removeIcon.className = "fa fa-times remove-icon";
    removeBox.appendChild(removeIcon);
    var removeLabel = document.createElement("span");
    removeLabel.className = "remove-label";
    removeLabel.appendChild(document.createTextNode("Remove channel"));
    removeBox.appendChild(removeLabel);
    infoBox.appendChild(removeBox);
    removeIcon.addEventListener("click", function () {
        removeChannel(channels, channelName);
        saveChannels(channels);
        updateDOM(channels);
    });
    box.appendChild(infoBox);
    return box;
}
/** Add a child node with the given channel tag and content information */
function addInfoItem(parent, tag, content) {
    var item = document.createElement("div");
    item.className = "channel-info-item";
    var heading = document.createElement("h4");
    heading.appendChild(document.createTextNode(tag));
    item.appendChild(heading);
    var para = document.createElement("p");
    para.appendChild(document.createTextNode(content));
    item.appendChild(para);
    parent.appendChild(item);
}
/**
 *
 * Handler functions
 *
 */
/** Handle request to add channels form the single file in the given FileList */
function addChannelsFromFileHandler(channels, files) {
    return new Promise(function (resolve, reject) {
        if (files.length === 0) {
            reject(Error("Empty FileList in addChannelsFromFile"));
        }
        var file = files.item(0);
        var reader = new FileReader();
        reader.onload = function () {
            var fileContents = reader.result;
            var newChannels = fileContents
                .split("\n")
                .filter(function (name) { return name.trim() !== ""; });
            newChannels.forEach(function (name) {
                addChannel(channels, name);
            });
        };
        reader.readAsText(file);
        resolve();
    });
}
/*
 *
 * Helper functions
 *
 */
/** Add the given channel to our tracked channels */
function addChannel(channels, newChannel) {
    var cleanedName = newChannel.trim().toLowerCase();
    if (!channels.has(cleanedName)) {
        channels.set(cleanedName, nullAPIReturn);
    }
}
/** Remove the given channel from our tracked channels */
function removeChannel(channels, channelName) {
    channels.delete(channelName.trim().toLowerCase());
}
/** Save the names of our tracked channels into localStorage if we can */
function saveChannels(channels) {
    if (storageAvailable("localStorage")) {
        var keys = Array.from(channels.keys());
        localStorage.setItem(localStorageKey, JSON.stringify(keys));
    }
}
/*
 *
 * Library functions
 *
 */
/** Run the given function when document load is complete */
function run_when_document_ready(fn) {
    if (document.readyState !== "loading") {
        fn();
    }
    else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
/**
 * Simple function to make a jsonp request and wrap in a Promise
 *
 * Url paramater will have the name of the callback appended
 * Adapted from https://github.com/camsong/fetch-jsonp
 */
function jsonp(url) {
    return new Promise(function (resolve) {
        // Create a random name for the callback function (so we can create many of them indpendently)
        var callbackName = "callback_jsonp_" + (Date.now()) + "_" + (Math.ceil(Math.random() * 100000));
        // Add our callback function to the global window object which handles the JSON response from the URL
        window[callbackName] = function (response) {
            // Pass the received JSON to the Promsie
            resolve(response);
            // Remove the script tag and the name in the the global window object
            var script = document.getElementById(callbackName);
            document.getElementsByTagName("head")[0].removeChild(script);
            delete window[callbackName];
        };
        // Add a script object to our document which will call our callback
        var script = document.createElement("script");
        script.setAttribute("src", url + callbackName);
        script.id = callbackName;
        document.getElementsByTagName("head")[0].appendChild(script);
    });
}
/** Utility function from MDN that returns true if local storage is available (from MDN) */
function storageAvailable(type) {
    try {
        var storage = window[type];
        var x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=twitch.js.map