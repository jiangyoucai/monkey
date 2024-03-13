// ==UserScript==
// @name         奥鹏教育视频播放
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  奥鹏教育视频播放（自动播放，音量控制（ctrl+,ctrl-），速度控制(ctrl>, ctrl<)，自动切换）
// @author       andy
// @match        *://learn.open.com.cn/StudentCenter/CourseWare/VideoPlayer?id=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const option = { volume: 0.5, rate: 2.0 };
    const state = { watch: false };

    getVideo();

    function getVideo() {
        const player = document.getElementById("J_prismPlayer");
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

        if (!state.watch) {
            state.watch = true;
            video.addEventListener(
                "ended",
                () => {
                    setLink();
                },
                false
            );
        }
    }

    function setLink() {
        const link = document.querySelector(".nextlink");
        if (!link) {
            return;
        }
        link.click();
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
