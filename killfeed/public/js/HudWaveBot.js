function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function HudWaveBot(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (count, flags, icon, idx) {;pug_debug_line = 1;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
if (count && count > 0) {
;pug_debug_line = 2;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
var bNormal          = (flags & (1 << 0)) != 0;
;pug_debug_line = 3;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
var bSupport         = (flags & (1 << 1)) != 0;
;pug_debug_line = 4;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
var bMission         = (flags & (1 << 2)) != 0;
;pug_debug_line = 5;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
var bMiniboss        = (flags & (1 << 3)) != 0;
;pug_debug_line = 6;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
var bCritical        = (flags & (1 << 4)) != 0;
;pug_debug_line = 7;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
var bSupportLimited  = (flags & (1 << 5)) != 0;
;pug_debug_line = 9;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
var bIsAnyTypeOfSupport = (bSupport || bSupportLimited || bMission);
;pug_debug_line = 11;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
pug_html = pug_html + "\u003Cdiv" + (" class=\"waveBot\""+pug_attr("data-bot-flags", flags, true, false)+pug_attr("id", idx, true, false)) + "\u003E";
;pug_debug_line = 12;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
pug_html = pug_html + "\u003Cdiv class=\"waveBotIcon\"\u003E";
;pug_debug_line = 13;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
let attributeClass = (bMiniboss && !bIsAnyTypeOfSupport ? "giant" : "normal");
if (bCritical) {
	attributeClass += " critical";
}

;pug_debug_line = 19;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
pug_html = pug_html + "\u003Cimg" + (pug_attr("class", pug_classes([attributeClass,"botIcon"], [true,false]), false, false)+pug_attr("src", `/images/leaderboard_class_${icon}.png`, true, false)) + "\u002F\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 21;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
pug_html = pug_html + "\u003Cp" + (pug_attr("style", pug_style((bIsAnyTypeOfSupport ? ("opacity: 0;margin-top: -14px") : ("opacity: 1;margin-top: -14px"))), true, false)+" id=\"count\"") + "\u003E";
;pug_debug_line = 21;pug_debug_filename = ".\u002Fviews\u002FHudWaveBot.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = count) ? "" : pug_interp)) + "\u003C\u002Fp\u003E\u003C\u002Fdiv\u003E";
}}.call(this,"count" in locals_for_with?locals_for_with.count:typeof count!=="undefined"?count:undefined,"flags" in locals_for_with?locals_for_with.flags:typeof flags!=="undefined"?flags:undefined,"icon" in locals_for_with?locals_for_with.icon:typeof icon!=="undefined"?icon:undefined,"idx" in locals_for_with?locals_for_with.idx:typeof idx!=="undefined"?idx:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}