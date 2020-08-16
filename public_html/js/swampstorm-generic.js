function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        if (contains(value, "#")) {
            vars[key] = value.substring(0, value.indexOf("#"));
        } else {
            vars[key] = value;
        }
    });
    return vars;
}

function toUrlParam(text) {
    var urlParam = replaceAll(text, " ", "-");
    return urlParam.toLowerCase();
}

function fromUrlParam(urlParam) {
    var text = replaceAll(urlParam, "-", " ");
    return toTitleCase(text);
}

function setParam(name, value) {
    var l = window.location;

    /* build params */
    var params = {};
    var x = /(?:\??)([^=&?]+)=?([^&?]*)/g;
    var s = l.search;
    for (var r = x.exec(s); r; r = x.exec(s)) {
        r[1] = decodeURIComponent(r[1]);
        if (!r[2]) r[2] = '%%';
        params[r[1]] = r[2];
    }

    /* set param */
    params[name] = encodeURIComponent(value);

    /* build search */
    var search = [];
    for (var i in params) {
        var p = encodeURIComponent(i);
        var v = params[i];
        if (v != '%%') p += '=' + v;
        search.push(p);
    }
    search = search.join('&');

    /* execute search */
    l.search = search;
}

function contains(value, searchFor) {
    return (value || '').indexOf(searchFor) > -1;
}

function getBracketsByEvent(event) {
    for (var i = 0; i < tournamentsJson.tournaments.length; i++) {
        if (event === toUrlParam(tournamentsJson.tournaments[i].Event)) {
            return tournamentsJson.tournaments[i].brackets;
        }
    }
    alert("No matching event found!");
    return {};
}

function getLaddersByEvent(event) {
    for (var i = 0; i < tournamentsJson.tournaments.length; i++) {
        if (event === toUrlParam(tournamentsJson.tournaments[i].Event)) {
            return tournamentsJson.tournaments[i].ladders;
        }
    }
    alert("No matching event found!");
    return {};
}

function getTeamCountry(team) {
    for (var i = 0; i < teamsJson.teams.length; i++) {
        if (team === teamsJson.teams[i].name) {
            return teamsJson.teams[i].country;
        }
    }
}

function drawConnections(connections) {
    for (var i = 0; i < connections.length; i++) {
        $("#" + connections[i].from + ", " + "#" + connections[i].to).connections();
    }
}

function appendTournament(event, location, from, to, ladders, brackets) {
    var tournamentsTable = document.getElementById("tournaments");

    var row = document.createElement("tr");

    var eventColumn = document.createElement("td");
    eventColumn.appendChild(
        document.createTextNode(event)
    );

    var locationColumn = document.createElement("td");
    locationColumn.appendChild(
        document.createTextNode(location)
    );

    var fromColumn = document.createElement("td");
    fromColumn.appendChild(
        document.createTextNode(from)
    );

    var toColumn = document.createElement("td");
    toColumn.appendChild(
        document.createTextNode(to)
    );

    var ladderColumn = document.createElement("td");
    if (ladders == null) {
        ladderColumn.appendChild(
            document.createTextNode("-")
        );
    } else {
        var ladderAnchor = document.createElement("a");
        ladderAnchor.title = event;
        ladderAnchor.href = "ladder.html" + "?" + "event" + "=" + toUrlParam(event);

        var ladderImg = document.createElement("img");
        ladderImg.style.width = "25px";
        ladderImg.style.height = "25px";
        ladderImg.src = "images/ladder.svg";
        ladderImg.alt = "";

        ladderAnchor.appendChild(ladderImg);
        ladderColumn.appendChild(ladderAnchor);
    }

    var bracketColumn = document.createElement("td");
    if (brackets == null) {
        bracketColumn.appendChild(
            document.createTextNode("-")
        );
    } else {
        var bracketAnchor = document.createElement("a");
        bracketAnchor.title = event;
        bracketAnchor.href = "fixture.html" + "?" + "event" + "=" + toUrlParam(event);

        var bracketImg = document.createElement("img");
        bracketImg.style.width = "25px";
        bracketImg.style.height = "25px";
        bracketImg.src = "images/fixtures.svg";
        bracketImg.alt = "";

        bracketAnchor.appendChild(bracketImg);
        bracketColumn.appendChild(bracketAnchor);
    }

    row.appendChild(eventColumn);
    row.appendChild(locationColumn);
    row.appendChild(fromColumn);
    row.appendChild(toColumn);
    row.appendChild(ladderColumn);
    row.appendChild(bracketColumn);

    tournamentsTable.appendChild(row);
}

function search() {
    var searchTerm = document.getElementById("s").value;

    //Clear Tournaments Table
    var table = document.getElementById("tournaments");
    var rowCount = table.rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    //Populate Tournaments Table
    if (searchTerm === "") {
        var page = getUrlVars()["p"];
        if (page == null) {
            page = 1;
        }
        for (var i = ((Number(page) - 1)*10); i < (((Number(page) - 1)*10)+9) && i < tournamentsJson.tournaments.length; i++) {
            appendTournament(
                tournamentsJson.tournaments[i].Event,
                tournamentsJson.tournaments[i].Location,
                tournamentsJson.tournaments[i].From,
                tournamentsJson.tournaments[i].To,
                tournamentsJson.tournaments[i].ladders,
                tournamentsJson.tournaments[i].brackets
            );
        }
    } else {
        for (var i = 0; i < tournamentsJson.tournaments.length; i++) {
            if (contains(tournamentsJson.tournaments[i].Event.toLowerCase(), searchTerm.toLowerCase())) {
                appendTournament(
                    tournamentsJson.tournaments[i].Event,
                    tournamentsJson.tournaments[i].Location,
                    tournamentsJson.tournaments[i].From,
                    tournamentsJson.tournaments[i].To,
                    tournamentsJson.tournaments[i].ladders,
                    tournamentsJson.tournaments[i].brackets
                );
            }
        }
    }
}

function generatePagination() {
    var paginationContainer = document.getElementById("swampstorm-pagination");
    var page = getUrlVars()["p"];
    if (page == null) {
        page = 1;
    }

    var nav = document.createElement("nav");
    nav.className = "post-pagination";
    
    var ul = document.createElement("ul");
    ul.className = "pagination";
    
    var firstLi = document.createElement("li");
    firstLi.className = "pagination-first";
    var firstAnchor = document.createElement("a");
    firstAnchor.href = "?" + "p" + "=" + "1";
    firstAnchor.appendChild(
        document.createTextNode(" First ")
    );
    firstLi.appendChild(firstAnchor);
    
    var prevLi = document.createElement("li");
    prevLi.className = "pagination-prev";
    var prevAnchor = document.createElement("a");
    if (page <= 1) {
        prevAnchor.href = "?" + "p" + "=" + "1";
    } else {
        prevAnchor.href = "?" + "p" + "=" + (page - 1);
    }
    prevAnchor.appendChild(
        document.createTextNode(" " + "\u00ab"+ " ") // « &laquo;
    );
    prevLi.appendChild(prevAnchor);
    
    if (page <= 1) {
        var xLi = document.createElement("li");
        xLi.className = "pagination-num current";
        var xAnchor = document.createElement("a");
        xAnchor.href = "?" + "p" + "=" + "1";
        xAnchor.appendChild(
            document.createTextNode(" " + "1" + " ")
        );
        xLi.appendChild(xAnchor);
        
        var yLi = document.createElement("li");
        yLi.className = "pagination-num";
        var yAnchor = document.createElement("a");
        yAnchor.href = "?" + "p" + "=" + "2";
        yAnchor.appendChild(
            document.createTextNode(" " + "2" + " ")
        );
        yLi.appendChild(yAnchor);
        
        var zLi = document.createElement("li");
        zLi.className = "pagination-num";
        var zAnchor = document.createElement("a");
        zAnchor.href = "?" + "p" + "=" + "3";
        zAnchor.appendChild(
            document.createTextNode(" " + "3" + " ")
        );
        zLi.appendChild(zAnchor);
    } else {
        var x = Number(page) - 1;
        var xLi = document.createElement("li");
        xLi.className = "pagination-num";
        var xAnchor = document.createElement("a");
        xAnchor.href = "?" + "p" + "=" + x;
        xAnchor.appendChild(
            document.createTextNode(" " + x + " ")
        );
        xLi.appendChild(xAnchor);
        
        var y = Number(page);
        var yLi = document.createElement("li");
        yLi.className = "pagination-num current";
        var yAnchor = document.createElement("a");
        yAnchor.href = "?" + "p" + "=" + y;
        yAnchor.appendChild(
            document.createTextNode(" " + y + " ")
        );
        yLi.appendChild(yAnchor);
        
        var z = Number(page) + 1;
        var zLi = document.createElement("li");
        zLi.className = "pagination-num";
        var zAnchor = document.createElement("a");
        zAnchor.href = "?" + "p" + "=" + z;
        zAnchor.appendChild(
            document.createTextNode(" " + z + " ")
        );
        zLi.appendChild(zAnchor);
    }
    
    var nextLi = document.createElement("li");
    nextLi.className = "pagination-next";
    var nextAnchor = document.createElement("a");
    nextAnchor.href = "?" + "p" + "=" + (Number(page) + 1);
    nextAnchor.appendChild(
        document.createTextNode(" " + "\u00bb" + " ") //» &raquo; 
    );
    nextLi.appendChild(nextAnchor);
    
    var lastLi = document.createElement("li");
    lastLi.className = "pagination-last";
    var lastAnchor = document.createElement("a");
    lastAnchor.href = "?" + "p" + "=" + ~~(tournamentsJson.tournaments.length / 10 + 1);
    lastAnchor.appendChild(
        document.createTextNode(" Last ")
    );
    lastLi.appendChild(lastAnchor);

    ul.appendChild(firstLi);
    ul.appendChild(prevLi);
    ul.appendChild(xLi);
    ul.appendChild(yLi);
    ul.appendChild(zLi);
    ul.appendChild(nextLi);
    ul.appendChild(lastLi);
    
    nav.appendChild(ul);
    
    paginationContainer.appendChild(nav);
    
    window.scrollTo(0, 850); 
}