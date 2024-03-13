// ==UserScript==
// @name         尚课视频播放
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  尚课视频播放（自动播放，音量控制（ctrl+,ctrl-），速度控制(ctrl>, ctrl<)，自动切换）
// @author       andy
// @match        *://www.onmooc.com/learnspace/learn/learn/blue/content_video.action?params.courseId=*
// @match        *://www.onmooc.com/learnspace/learn/learn/blue/courseware_index.action?params.courseId=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webtrn.cn
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// ==/UserScript==

(function () {
    "use strict";

    const api = "http://www.onmooc.com/learnspace/learn/learnCourseItem/queryChildItem.json";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
    };

    const option = { volume: 0.5, rate: 3.0 };
    const state = { watch: false };

    const path = window.location.pathname;

    if (path.indexOf("video") > -1) {
        getVideo();
    }

    if (path.indexOf("index") > -1) {
        getSidebar();
    }

    function getVideo() {
        const player = document.getElementsByClassName("video1")[0];
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
                    getLink();
                },
                false
            );
        }
    }

    function getLink() {
        const searchParams = new URLSearchParams(window.location.search);
        const courseID = searchParams.get("params.courseId");
        const itemID = searchParams.get("params.itemId");
        const parentID = searchParams.get("params.parentId");

        const sidebar = localStorage.getItem("sidebar");
        if (!sidebar) {
            return;
        }

        setLink(JSON.parse(sidebar), courseID, itemID, parentID);
    }

    function setLink(sidebar, courseID, itemID, parentID) {
        for (let i = 0; i < sidebar.length; i++) {
            if (parentID !== sidebar[i].pointID || itemID !== sidebar[i].sectionID) {
                continue;
            }

            if (i + 1 >= sidebar.length) {
                continue;
            }

            const pointID = sidebar[i + 1].pointID;
            const sectionID = sidebar[i + 1].sectionID;
            const now = new Date().getTime();

            const query =
                "?params.courseId=" +
                courseID +
                "&params.itemId=" +
                sectionID +
                "&params.templateStyleType=0&params.parentId=" +
                pointID +
                "&_t=" +
                now;

            const path = "http://www.onmooc.com/learnspace/learn/learn/blue/content_video.action" + query;
            window.location.href = path;
        }
    }

    function getSidebar() {
        const data = [];
        const point = document.querySelectorAll(".vconlist li a");
        for (let i = 0; i < point.length; i++) {
            const pointName = point[i].innerHTML;
            const tmp = point[i].getAttribute("onclick").split("'");
            if (tmp.length !== 5) {
                continue;
            }

            const pointID = tmp[1];
            const courseID = tmp[3];

            const args = "params.parentId=" + pointID;
            fetchData("POST", api, args, headers).then((res) => {
                if (!res) {
                    return;
                }

                const item = JSON.parse(res);
                if (!item.data) {
                    return;
                }

                data.push({
                    sectionID: item.data[0].id,
                    pointID: pointID,
                    pointName: pointName,
                    courseID: courseID,
                });

                // 异步网络请求
                // 无法统一接收，无法确定顺序
                data.sort((x, y) => {
                    return x.pointName.localeCompare(y.pointName, "zh");
                });
                setSidebar(data);
            });
        }
    }

    function setSidebar(data) {
        localStorage.setItem("sidebar", JSON.stringify(data));
    }

    function fetchData(method, url, data, headers) {
        return new Promise(function (resolve, reject) {
            GM_xmlhttpRequest({
                method: method,
                url: url,
                data: data,
                anonymous: true,
                cookie: document.cookie,
                headers: headers,
                onload: function (res) {
                    resolve(res.responseText);
                },
                onerror: function (err) {
                    reject(err);
                },
            });
        });
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
