function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function ScoreBoardPlayer(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (alive, auto, damage, healing, money, name, pclass, score, steam64, support, tank, team) {;pug_debug_line = 1;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctr" + (" class=\"scoreboardRow\""+pug_attr("id", steam64, true, false)) + "\u003E";
;pug_debug_line = 2;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
var divClassAndTeam = `scoreboardRow team-${team || 0} ${alive ? "" : "playerDead"}`;
;pug_debug_line = 3;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
var url = `http://steamcommunity.com/profiles/${steam64}`;
;pug_debug_line = 5;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctr" + (pug_attr("class", pug_classes([divClassAndTeam], [true]), false, false)+pug_attr("id", steam64, true, false)+pug_attr("onclick", `window.open("${url}", "_blank");`, true, false)+" style=\"cursor: pointer;\"") + "\u003E";
;pug_debug_line = 6;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
var style = "text-decoration: none; color: inherit;";
;pug_debug_line = 7;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
var spanImageClass = `class class-${pclass || 0}`;
;pug_debug_line = 9;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctd class=\"avatar\"\u003E";
;pug_debug_line = 10;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Cimg" + (pug_attr("src", (!!alive) ? "" : "images/leaderboard_dead.png", true, false)+" height=\"32\""+pug_attr("width", auto, true, false)) + "\u002F\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 11;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctd class=\"name\"\u003E";
;pug_debug_line = 11;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = (name || "")) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 12;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctd class=\"playerClass\"\u003E";
;pug_debug_line = 13;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Cspan" + (pug_attr("class", pug_classes([pclass ? spanImageClass : ""], [true]), false, false)) + "\u003E\u003C\u002Fspan\u003E\u003C\u002Ftd\u003E";
;pug_debug_line = 14;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctd class=\"score\"\u003E";
;pug_debug_line = 14;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = (score || 0)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 15;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctd class=\"damage\"\u003E";
;pug_debug_line = 15;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = (damage || 0)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 16;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctd class=\"tank\"\u003E";
;pug_debug_line = 16;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = (tank || 0)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 17;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctd class=\"healing\"\u003E";
;pug_debug_line = 17;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = (healing || 0)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 18;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctd class=\"support\"\u003E";
;pug_debug_line = 18;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = (support || 0)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E";
;pug_debug_line = 19;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + "\u003Ctd class=\"money\"\u003E";
;pug_debug_line = 19;pug_debug_filename = ".\u002Fviews\u002FScoreBoardPlayer.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = (money || 0)) ? "" : pug_interp)) + "\u003C\u002Ftd\u003E\u003C\u002Ftr\u003E\u003C\u002Ftr\u003E";}.call(this,"alive" in locals_for_with?locals_for_with.alive:typeof alive!=="undefined"?alive:undefined,"auto" in locals_for_with?locals_for_with.auto:typeof auto!=="undefined"?auto:undefined,"damage" in locals_for_with?locals_for_with.damage:typeof damage!=="undefined"?damage:undefined,"healing" in locals_for_with?locals_for_with.healing:typeof healing!=="undefined"?healing:undefined,"money" in locals_for_with?locals_for_with.money:typeof money!=="undefined"?money:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"pclass" in locals_for_with?locals_for_with.pclass:typeof pclass!=="undefined"?pclass:undefined,"score" in locals_for_with?locals_for_with.score:typeof score!=="undefined"?score:undefined,"steam64" in locals_for_with?locals_for_with.steam64:typeof steam64!=="undefined"?steam64:undefined,"support" in locals_for_with?locals_for_with.support:typeof support!=="undefined"?support:undefined,"tank" in locals_for_with?locals_for_with.tank:typeof tank!=="undefined"?tank:undefined,"team" in locals_for_with?locals_for_with.team:typeof team!=="undefined"?team:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}