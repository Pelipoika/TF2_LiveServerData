function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function HudDeathNotice(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (Math, Number, bg_icon, bg_icon_h, bg_icon_w, bg_icon_x, bg_icon_y, icon, icon_h, icon_w, icon_x, icon_y, killer, killerteam, killstreak, postvictimtext, previctimtext, victim, victimteam, window) {;pug_debug_line = 1;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv class=\"row\"\u003E";
;pug_debug_line = 2;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv class=\"u-pull-right\" id=\"hudDeathNotice\"\u003E";
;pug_debug_line = 3;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes([`team-${killerteam}`], [true]), false, false)+" id=\"KillerName\"") + "\u003E";
;pug_debug_line = 3;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = killer) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
;pug_debug_line = 5;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 5;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "&nbsp;\u003C\u002Fdiv\u003E";
;pug_debug_line = 7;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
if (killstreak > 0) {
;pug_debug_line = 9;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv id=\"KillstreakNumber\"\u003E";
;pug_debug_line = 9;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = killstreak) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
;pug_debug_line = 12;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv id=\"KillstreakContainer\"\u003E";
;pug_debug_line = 13;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cimg align=\"middle\" width=\"auto\" height=\"32px\" src=\"images\u002Fleaderboard_streak.png\" id=\"iconKillstreak\"\u002F\u003E\u003C\u002Fdiv\u003E";
}
;pug_debug_line = 15;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 15;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "&nbsp;\u003C\u002Fdiv\u003E";
;pug_debug_line = 17;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv id=\"IconContainer\"\u003E";
;pug_debug_line = 19;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
var marginLeft = 0;
var bgIsBigger = (Number(bg_icon_w) > Number(icon_w));

var isChrome = !!window.chrome && !!window.chrome.webstore;

if(!bgIsBigger) {
	marginLeft = Math.abs(Number(icon_w) - Number(bg_icon_w)) / 2;
}

;pug_debug_line = 30;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cimg" + (" align=\"middle\""+pug_attr("style", pug_style(`position: absolute; margin-left: ${marginLeft}px; padding: ${bg_icon_h / 2}px ${bg_icon_w / 2}px ${bg_icon_h / 2}px ${bg_icon_w / 2}px; background: url(images/${bg_icon}.png) -${bg_icon_x}px -${bg_icon_y}px`), true, false)+" id=\"iconCritDeath\"") + "\u002F\u003E";
;pug_debug_line = 33;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
if (icon.indexOf('d_images') == -1) {
;pug_debug_line = 34;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cimg" + (" align=\"middle\" width=\"auto\" height=\"32px\""+pug_attr("src", `images/${icon}.png`, true, false)+" id=\"iconDeath\"") + "\u002F\u003E";
}
else {
;pug_debug_line = 36;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cimg" + (" align=\"middle\""+pug_attr("style", pug_style(`position: relative; z-index: 3; padding: ${icon_h / 2}px ${icon_w / 2}px ${icon_h / 2}px ${icon_w / 2}px; background: url(images/${icon}.png) -${icon_x}px -${icon_y}px;`), true, false)+" id=\"iconDeath\"") + "\u002F\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
;pug_debug_line = 38;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 38;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "&nbsp;\u003C\u002Fdiv\u003E";
;pug_debug_line = 41;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv id=\"PreVictimText\"\u003E";
;pug_debug_line = 41;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = previctimtext) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
;pug_debug_line = 43;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 43;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "&nbsp;\u003C\u002Fdiv\u003E";
;pug_debug_line = 46;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv" + (pug_attr("class", pug_classes([`team-${victimteam}`], [true]), false, false)+" id=\"VictimName\"") + "\u003E";
;pug_debug_line = 46;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = victim) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
;pug_debug_line = 48;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv\u003E";
;pug_debug_line = 48;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "&nbsp;\u003C\u002Fdiv\u003E";
;pug_debug_line = 51;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + "\u003Cdiv id=\"PostVictimText\"\u003E";
;pug_debug_line = 51;pug_debug_filename = ".\u002Fviews\u002FHudDeathNotice.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = postvictimtext) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";}.call(this,"Math" in locals_for_with?locals_for_with.Math:typeof Math!=="undefined"?Math:undefined,"Number" in locals_for_with?locals_for_with.Number:typeof Number!=="undefined"?Number:undefined,"bg_icon" in locals_for_with?locals_for_with.bg_icon:typeof bg_icon!=="undefined"?bg_icon:undefined,"bg_icon_h" in locals_for_with?locals_for_with.bg_icon_h:typeof bg_icon_h!=="undefined"?bg_icon_h:undefined,"bg_icon_w" in locals_for_with?locals_for_with.bg_icon_w:typeof bg_icon_w!=="undefined"?bg_icon_w:undefined,"bg_icon_x" in locals_for_with?locals_for_with.bg_icon_x:typeof bg_icon_x!=="undefined"?bg_icon_x:undefined,"bg_icon_y" in locals_for_with?locals_for_with.bg_icon_y:typeof bg_icon_y!=="undefined"?bg_icon_y:undefined,"icon" in locals_for_with?locals_for_with.icon:typeof icon!=="undefined"?icon:undefined,"icon_h" in locals_for_with?locals_for_with.icon_h:typeof icon_h!=="undefined"?icon_h:undefined,"icon_w" in locals_for_with?locals_for_with.icon_w:typeof icon_w!=="undefined"?icon_w:undefined,"icon_x" in locals_for_with?locals_for_with.icon_x:typeof icon_x!=="undefined"?icon_x:undefined,"icon_y" in locals_for_with?locals_for_with.icon_y:typeof icon_y!=="undefined"?icon_y:undefined,"killer" in locals_for_with?locals_for_with.killer:typeof killer!=="undefined"?killer:undefined,"killerteam" in locals_for_with?locals_for_with.killerteam:typeof killerteam!=="undefined"?killerteam:undefined,"killstreak" in locals_for_with?locals_for_with.killstreak:typeof killstreak!=="undefined"?killstreak:undefined,"postvictimtext" in locals_for_with?locals_for_with.postvictimtext:typeof postvictimtext!=="undefined"?postvictimtext:undefined,"previctimtext" in locals_for_with?locals_for_with.previctimtext:typeof previctimtext!=="undefined"?previctimtext:undefined,"victim" in locals_for_with?locals_for_with.victim:typeof victim!=="undefined"?victim:undefined,"victimteam" in locals_for_with?locals_for_with.victimteam:typeof victimteam!=="undefined"?victimteam:undefined,"window" in locals_for_with?locals_for_with.window:typeof window!=="undefined"?window:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}