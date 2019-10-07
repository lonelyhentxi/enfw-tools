// ==UserScript==
// @name         Stage1st Proxy
// @version      0.1
// @description  refresh stage1st auto
// @author       lonelyhentai
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        https://bbs.saraba1st.com/2b/home.php?mod=spacecp&ac=*
// ==/UserScript==

var inline_src = (<><![CDATA[
    window.onload = () => {
        setTimeout(()=>{
            if(window.location.href.endsWith('avatar')) {
                window.location.replace('https://bbs.saraba1st.com/2b/home.php?mod=spacecp&ac=profile');
            }
            else if(window.location.href.endsWith('profile')) {
                window.location.replace('https://bbs.saraba1st.com/2b/home.php?mod=spacecp&ac=avatar');
            }
        },1800000);
    }

]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);