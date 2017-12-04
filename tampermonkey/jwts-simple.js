// ==UserScript==
// @name         jwts-simple
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       lonelyhentai
// @match        http://jwts.hitsz.edu.cn/*
// @grant        unsafeWindow
// ==/UserScript==

    function changeValidateCode(obj) {
        obj.src="/captchaImage?id=1";
   }

    $().ready(function(){});
    console.log(changeValidateCode);
    window.onload = setTimeout(function() {
        $("#usercode").val('用户名');
        $("#password").val('密码');
    },1000);