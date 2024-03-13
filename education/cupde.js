// ==UserScript==
// @name         中国石油大学视频播放
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  中国石油大学视频播放（自动播放，音量控制（ctrl+,ctrl-），速度控制(ctrl>, ctrl<)，自动切换）
// @author       andy
// @match        *://www.cupde.cn/learning/CourseImports/bjsy/*/*-*/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webtrn.cn
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const option = { volume: 0.5, rate: 3.0 };

    getVideo();

    function getVideo() {
        const player = document.getElementById("video_content");
        if (!player) {
            return;
        }

        const observer = new MutationObserver(function () {
            setVideo(player);
        });
        observer.observe(player, {
            attributes: true,
            childList: true,
            subtree: true,
        });
    }

    function setVideo(doc) {
        if (!doc) {
            return;
        }

        const video = doc.querySelector("video");
        if (!video) {
            return;
        }

        video.volume = option.volume;
        video.playbackRate = option.rate;
        if (!video.paused) {
            return;
        }

        video.play();
    }

    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey) {
            switch (e.code) {
                case "Equal": // +
                    if (option.volume <= 0.9) {
                        option.volume += 0.1;
                    }
                    break;
                case "Minus": // -
                    if (option.volume >= 0.1) {
                        option.volume -= 0.1;
                    }
                    break;
                case "Period": // >
                    if (option.rate <= 15) {
                        option.rate++;
                    }
                    break;
                case "Comma": // <
                    if (option.rate >= 1) {
                        option.rate--;
                    }
                    break;
                default:
                    console.log(e.code);
            }
            setVideo();
        }
    });
})();
