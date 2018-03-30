// ==UserScript==
// @name         zhihuishu-agent
// @namespace    http://tampermonkey.net/
// @version      0.2
// @author       anonymous
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        http://course.zhihuishu.com/learning/videoList?courseId=*
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
    /* jshint ignore:end */
    /* jshint esnext: false */
    /* jshint esversion: 6 */
    setInterval(function(){
        let cancelButtons = document.querySelectorAll('.popbtn_cancel');
        if(cancelButtons.length!==0){
            let cancelButton = cancelButtons[0];
            cancelButton.click();
        }
        let passTimes = document.querySelectorAll('.passTime');
        if(passTimes.length!==0){
            let passTime = passTimes[0];
            if(/100%/.test(passTime.style.width)){
                let videoList = document.querySelectorAll('.clearfix.video');
                console.log(videoList);
                let current = document.getElementsByClassName('progressbar_box')[0].parentNode;
                videoList[[...videoList].indexOf(current)+1].click();
            }
        }
        if(document.getElementsByClassName('speedBox')[0].style&&!/1\.5-1\.png/.test(document.getElementsByClassName('speedBox')[0].style['cssText']))
        {
            [...document.getElementsByClassName('speedTab15')[0].attributes].filter(val=>{return val.name==='rate';})[0].value = '1.5';
            document.getElementsByClassName('speedTab15')[0].click();
        }
        if(document.getElementsByClassName('volumeNone').length!==1)
        {
            document.getElementsByClassName('volumeIcon')[0].click();
        }
    },1000);
/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */
