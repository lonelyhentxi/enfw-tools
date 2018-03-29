// ==UserScript==
// @name         cnmooc-agent
// @version      0.1
// @author       You
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        http://www.cnmooc.org/study/unit/*
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
/* jshint ignore:end */
    /* jshint esnext: false */
    /* jshint esversion: 6 */

    // Your code here...
    window.onload=function(){
        setTimeout(function(){
            let speedUp = setInterval(function(){
                if(document.querySelectorAll("#mediaplayer_controlbar_rate_option_6")[0]){
                    document.querySelectorAll("#mediaplayer_controlbar_rate_option_6")[0].click();
                    clearInterval(speedUp);
                    }},1000);
            let toNext = setInterval(function(){
                if(!document.querySelectorAll("#playOver")[0].style.display){
                    return;
                }
                let lessons = [...document.querySelectorAll(".sub-nav-text")].filter((val)=>{return !(/习题/.test(val.innerText));});
                let nextLessonIndex = lessons.indexOf(document.querySelectorAll("a.sub-nav-text.current")[0])+1;
                if(lessons[nextLessonIndex]){
                    lessons[nextLessonIndex].click();
                }
                else{
                    console.log("all lessons finished");
                    clearInterval(toNext);
                }
            },1000);
        },1000);
    };

/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */