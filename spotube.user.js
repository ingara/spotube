// ==UserScript==
// @id          ingara.spotube
// @name        Spotube
// @version     1
// @namespace   ingara
// @author      Ingar Almklov
// @description Uses the title of youtube videos to try to find them on Spotify
// @include     http://www.youtube.com/watch*
// @include     https://www.youtube.com/watch*
// @match       http://www.youtube.com/watch*
// @match       https://www.youtube.com/watch*
// @run-at      document-end
// ==/UserScript==
 
// Credits to https://gist.github.com/jashandeep-sohi/875dcf9e30cfb50b3300

function build_action_span() {
    var span = document.createElement("span");
    var button = document.createElement("button");
    var inner_span = document.createElement("span");

    inner_span.setAttribute("class", "yt-uix-button-content");
    inner_span.textContent = "Spotube";

    button.setAttribute("class", "yt-uix-button yt-uix-button-size-default yt-uix-button-text action-panel-trigger yt-uix-tooltip");
    button.setAttribute("data-button-toggle", "true");
    button.setAttribute("data-trigger-for", "action-panel-download");
    button.setAttribute("type", "button");
    button.setAttribute("onclick", ";return false;");
    button.setAttribute("title", "");
    button.appendChild(inner_span);
    span.appendChild(button);
    return span;
}

function build_action_panel() {
  var div = document.createElement("div");
  var inner_div = document.createElement("div");
  
  div.setAttribute("id", "action-panel-download");
  div.setAttribute("class", "action-panel-content hid");
  div.setAttribute("data-panel-loaded", "true");
  div.setAttribute("style", "");
  
  inner_div.setAttribute("id", "spotube-description");
  inner_div.setAttribute(
    "class",
    "yt-uix-expander yt-uix-expander-collapsed yt-uix-button-panel"
  );
  div.appendChild(inner_div);
  return div;   
}

function get_spotify_items(callback) {
    var url = "https://api.spotify.com/v1/search?q={{query}}&type=track&limit=10";
    var query = document.title.replace(" - YouTube", "");
    url = url.replace("{{query}}", query.replace(" ", "%20"));

    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        var items = xhr.response.tracks.items.map(function(item) {
            var a = document.createElement("a");
            a.setAttribute("href", "http://open.spotify.com/track/" + item.id);
            a.textContent = item.artists[0].name +
                            " - " +
                            item.name +
                            " (" +
                            item.album.name +
                            ")";
            return a;
        });
        callback(items, xhr.status);
      } else {
        var p = document.createElement("p");
        p.textContent = "Could not get results";
        callback([p], xhr.status);
      }
    };
    xhr.send();
}

window.addEventListener("load", function() {
    var action_span = build_action_span();
    document.body.querySelector("#watch7-secondary-actions")
                 .appendChild(action_span);
    var action_panel = build_action_panel();
    document.body.querySelector("#watch7-action-panels")
                 .insertBefore(action_panel);
    
    get_spotify_items(function(items, status_code) {
        if(status_code != 200) {
            var p = document.createElement("p");
            p.textContent = "Could not get results";
            action_panel.appendChild(p);
        }
        else if(items.length == 0) {
            var p = document.createElement("p");
            p.textContent = "No results";
            action_panel.appendChild(p);
        }
        else {
            items.forEach(function(item) {
                var p = document.createElement("p");
                p.appendChild(item);
                action_panel.appendChild(p);
            });
        }
    });
});