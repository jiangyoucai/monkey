// ==UserScript==
// @name         网梯科技视频播放
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  网梯科技视频播放（自动播放，音量控制（ctrl+,ctrl-），速度控制(ctrl>, ctrl<)，自动切换）
// @author       andy
// @match        *://mdedu-kfkc.webtrn.cn/learnspace/learn/learn/templateeight/index.action?params.courseId=*
// @match        *://mdedu-kfkc.webtrn.cn/learnspace/learn/learn/templateeight/courseware_index.action?params.courseId=*
// @match        *://mdedu-kfkc.webtrn.cn/learnspace/learn/learn/templateeight/content_video.action?params.courseId=*
// @match        *://mdedu-kfkc.webtrn.cn/learnspace/learn/learn/templateeight/content_doc.action?params.courseId=*
// @match        *://mdedu-kfkc.webtrn.cn/learnspace/learn/learn/templateeight/content_text.action?params.courseId=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webtrn.cn
// @grant        none
// ==/UserScript==

// layui-layer-move
(function () {
    "use strict";

    const option = { volume: 0.5, rate: 2.0 };
    const state = { watch: false };

    const path = window.location.pathname;
    if (path.indexOf("/index.action") > -1) {
        getDialog();
    }

    if (path.indexOf("/content_doc.action") > -1) {
        getDocument();
    }

    if (path.indexOf("/content_text.action") > -1) {
        getText();
    }

    if (path.indexOf("/content_video.action") > -1) {
        getVideo();
    }

    if (path.indexOf("/courseware_index.action") > -1) {
        getSidebar();
    }

    function getDocument() {
        setTimeout(() => {
            getLink();
        }, 5000);
    }

    function getText() {
        setTimeout(() => {
            getLink();
        }, 5000);
    }

    function getVideo() {
        const player = document.querySelector(".video1");
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
            if (parentID !== sidebar[i].sectionID || itemID !== sidebar[i].pointID) {
                continue;
            }

            if (i + 1 >= sidebar.length) {
                continue;
            }

            const category = sidebar[i + 1].category;
            const pointID = sidebar[i + 1].pointID;
            const sectionID = sidebar[i + 1].sectionID;
            const now = new Date().getTime();

            const query =
                "?params.courseId=" +
                courseID +
                "&params.itemId=" +
                pointID +
                "&params.templateStyleType=0&params.parentId=" +
                sectionID +
                "&_t=" +
                now;

            const path =
                "https://mdedu-kfkc.webtrn.cn/learnspace/learn/learn/templateeight/content_" + category + ".action" + query;
            window.location.href = path;
        }
    }

    function getSidebar() {
        const data = [];
        const section = document.getElementsByClassName("s_section");
        for (let i = 0; i < section.length; i++) {
            const s = getSection(section[i]);
            if (!s.node) {
                continue;
            }

            const point = s.node.getElementsByClassName("s_point");
            for (let j = 0; j < point.length; j++) {
                const p = getPoint(point[j]);
                data.push({
                    sectionID: s.sectionID,
                    sectionName: s.sectionName,
                    pointID: p.pointID,
                    pointName: p.pointName,
                    category: p.category,
                });
            }
        }
        setSidebar(data);
    }

    function getSection(item) {
        const sectionID = item.getAttribute("id").replace(/s_section_/, "");
        const sectionName = item.innerText;
        const node = item.nextElementSibling;
        return {
            sectionID: sectionID,
            sectionName: sectionName,
            node: node,
        };
    }

    function getPoint(item) {
        const pointID = item.getAttribute("id").replace(/s_point_/, "");
        const pointName = item.innerText;
        const category = item.getAttribute("itemtype");
        return {
            pointID: pointID,
            pointName: pointName,
            category: category,
        };
    }

    function setSidebar(data) {
        localStorage.setItem("sidebar", JSON.stringify(data));
    }

    function getDialog() {
        const body = document.querySelector(".body-screen");
        const observer = new MutationObserver(function () {
            setDialog();
        });
        observer.observe(body, {
            attributes: true,
            childList: true,
            subtree: true,
        });
    }

    function setDialog() {
        const dialog = document.getElementById("layui-layer1");
        if (!dialog) {
            return;
        }

        const button = doc.querySelector(".layui-layer-btn0");
        if (!button) {
            return;
        }
        button.click();
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
