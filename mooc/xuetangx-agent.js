// ==UserScript==
// @name         enfw-xuetangx
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       lonelyhentai
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @match        https://*.xuetangx.com/lms
// ==/UserScript==

var inline_src = (<><![CDATA[
    const log = (str) => {
        console.log("[ENFW-XUETANGX]: " + str);
    }
    
    const activateAllChapters = () => {
        return new Promise((resolve, _) => {
            const chapters = document.querySelectorAll(".tree-chapter-item");
            for(const c of chapters) {
                const isActive = !(c.querySelector('.icon-plus'));
                if(isActive) {
                    c.click();
                }
            }
            requestAnimationFrame(()=> {
                resolve();
            });
        })
    }
    
    const activateAllSections = () => {
        return new Promise((resolve, _)=>{
            const sections = document.querySelectorAll('.tree-section-item');
            for(const s of sections) {
                const arrowDown = (s.querySelector('.el-icon-arrow-down'));
                if(!!arrowDown) {
                    arrowDown.click();
                }
            }
            requestAnimationFrame(()=>{
                resolve();
            })
        })
    }
    
    const changeToNextElement = async (timer) => {
        log("Find next element")
        await activateAllChapters();
        await activateAllSections();
        const elements = [...document.querySelectorAll('.section-video-name')]
        const currentElement = document.querySelector('.video-active');
        let next = -1;
        for(let i=0;i<elements.length;i++) {
            if(Object.is(elements[i], currentElement)){
                if(i+1>=elements.length) {
                    alert("finished all tasks");
                } else {
                    log("Go to next task");
                    next = i + 1;
                }
                break;
            }
        }
        if(next!==-1) {
            elements[next].querySelector(".element-wrap").click();
        }
        clearInterval(timer);
        setTimeout(doCurrentElementTask, 5000);
    }
    
    const isVideoEnded = (video) => {
        if(Math.ceil(video.currentTime)>=Math.ceil(video.duration)&&video.paused) {
            return true;
        }
        return false;
    }
    
    const keepCurrentVideoPlaying =  (video, timer) => {
        const ended = isVideoEnded(video);
        if(ended) {
            log("Video ended")
            changeToNextElement(timer);
        } else {
            if(video.paused) {
                log("Video paused, replay it");
                video.play();
            }
            if(!video.muted) {
                log("Video not muted, mute it");
                video.muted = true;
            }
            if(parseInt(document.querySelector('.xt_video_player_common_value').textContent)!==2) {
                log("Set video speed to 2x")
                const speed2x = document.querySelector('.xt_video_player_common_list li:nth-child(1)');
                if(!!speed2x) {
                    speed2x.click();
                }
            }
        }
    }
    
    const doCurrentElementTask = () => {
        log("To do current task...")
        const video = document.querySelector('video');
        if(!video) {
            log("Not video, skipping...")
            changeToNextElement();
        }
        else {
            log("Video task, playing...")
            const timer = setInterval(() => keepCurrentVideoPlaying(video, timer), 1000);
        }
    }
    
    window.onload = () => {
        doCurrentElementTask();
    }
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);