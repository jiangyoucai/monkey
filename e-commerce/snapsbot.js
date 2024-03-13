// ==UserScript==
// @name         Snapsbot - 快照机
// @namespace    https://snapsbot.com
// @version      0.0.2
// @description  淘宝/天猫产品详情页图片下载
// @author       andy.jiang
// @match        *://detail.tmall.com/item.htm?*
// @match        *://item.taobao.com/item.htm?*
// @require      https://cdn.bootcdn.net/ajax/libs/jszip/3.10.1/jszip.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const code = {
        menu: `<div style="position:fixed;width:56px;height:56px;right:0;bottom:50px;display:flex;flex-direction:column;justify-content:center;align-items:center;background-color:#fff;border-radius:18px 0 0 18px;cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" style="width:20px;height:20px"><path fill-rule="evenodd" d="M5.478 5.559A1.5 1.5 0 0 1 6.912 4.5H9A.75.75 0 0 0 9 3H6.912a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H15a.75.75 0 0 0 0 1.5h2.088a1.5 1.5 0 0 1 1.434 1.059l2.213 7.191H17.89a3 3 0 0 0-2.684 1.658l-.256.513a1.5 1.5 0 0 1-1.342.829h-3.218a1.5 1.5 0 0 1-1.342-.83l-.256-.512a3 3 0 0 0-2.684-1.658H3.265l2.213-7.191Z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V3a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"/></svg></div>`,
        progress: `<div style="position:fixed;top:0;left:0;z-index:100;background:rgba(0,0,0,.5);width:100vw;height:100vh;display:flex;justify-content:center;align-items:center"><div style="background:#fff;width:256px;height:160px;border-radius:16px;overflow:hidden;display:flex;justify-content:center;align-items:center;flex-direction:column"><div style="text-align:center"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" style="height:24px;margin:8px auto;color:gray"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg></div><div style="font-size:14px">下载 <span id="current">-</span> <span style="margin:0 2px">/</span> <span id="total">-</span> 张</div></div></div>`,
    };

    const setMenu = () => {
        const menu = document.getElementById("menu");
        if (menu !== null) {
            return;
        }

        const element = document.createElement("div");
        element.setAttribute("id", "menu");

        element.innerHTML = code.menu;

        document.body.appendChild(element);
        element.addEventListener("click", () => {
            getMedia();
        });
    };

    const setProgress = () => {
        const progress = document.getElementById("progress");
        if (progress !== null) {
            return;
        }

        const element = document.createElement("div");
        element.setAttribute("id", "progress");

        element.innerHTML = code.progress;
        document.body.appendChild(element);
    };

    const getMedia = () => {
        let hub = [];

        console.log("-----------video-----------");
        const videoList = document.getElementsByClassName("lib-video");
        for (let i = 0; i < videoList.length; i++) {
            const item = videoList[i];
            const source = item.getAttribute("src");
            if (source) {
                const path = getPath(source);
                const name = getFile("video", i, getExtension(path));

                hub.push({ name: name, url: path });
            }
        }

        console.log("-----------thumb-----------");
        const thumbList = document.getElementsByClassName("PicGallery--thumbnailPic--1spSzep");
        for (let i = 0; i < thumbList.length; i++) {
            const item = thumbList[i];
            const source = item.getAttribute("src");
            if (source) {
                const path = getPath(source);
                const name = getFile("thumb", i, getExtension(path));

                hub.push({ name: name, url: path });
            }
        }

        console.log("-----------sku-----------");
        const skuList = document.getElementsByClassName("skuIcon");
        for (let i = 0; i < skuList.length; i++) {
            const item = skuList[i];
            const source = item.getAttribute("src");
            if (source) {
                const path = getPath(source);
                const name = getFile("sku", i, getExtension(path));

                hub.push({ name: name, url: path });
            }
        }

        console.log("-----------detail-----------");
        const singList = document.getElementsByClassName("descV8-singleImage");
        for (let i = 0; i < singList.length; i++) {
            const tmp = singList[i].getElementsByClassName("lazyload");
            for (let index = 0; index < tmp.length; index++) {
                const item = tmp[index];
                const source = item.getAttribute("src");
                if (source) {
                    const path = getPath(source);
                    const name = getFile("detail", i, getExtension(path));

                    hub.push({ name: name, url: path });
                }
            }
        }

        console.log("-----------detail-----------");
        const richList = document.getElementsByClassName("descV8-richtext");
        for (let i = 0; i < richList.length; i++) {
            const tmp = richList[i].getElementsByClassName("lazyload");
            for (let index = 0; index < tmp.length; index++) {
                const item = tmp[index];
                const source = item.getAttribute("src");
                if (source) {
                    const path = getPath(source);
                    const name = getFile("detail", index, getExtension(path));

                    hub.push({ name: name, url: path });
                }
            }
        }

        setProgress();
        setDownload(hub);
    };

    const getPath = (source) => {
        const args = ["_.webp", "_60x60q50.jpg", "_110x10000Q75.jpg", "_110x10000.jpg"];
        for (let i = 0; i < args.length; i++) {
            const item = args[i];

            if (source.endsWith(item)) {
                source = source.replace(item, "");
            }
        }

        if (source.startsWith("//")) {
            source = "https:" + source;
        }

        const path = new URL(source);
        path.search = "";
        path.hash = "";

        return path.toString();
    };

    const getExtension = (name) => {
        const ext = name.split(".").pop().toLowerCase();
        return "." + ext;
    };

    const getFile = (category, index, ext) => {
        const number = (index + 1).toString().padStart(2);
        const name = category + "_" + number;
        return name + ext;
    };

    const getFolder = () => {
        const ext = ".zip";
        const name = new URL(window.location.href).searchParams.get("id");
        return name + ext;
    };

    const setDownload = (source) => {
        document.getElementById("total").innerHTML = source.length;

        let zip = new JSZip();
        let folder = zip.folder("files");
        Promise.resolve()
            .then(() => {
                return source.reduce((accumulator, file, index) => {
                    return accumulator.then(() =>
                        fetch(file.url)
                            .then((resp) => resp.blob())
                            .then((blob) => {
                                document.getElementById("current").innerHTML = index + 1;

                                folder.file(file.name, blob);
                            })
                            .catch((error) => console.log(error))
                    );
                }, Promise.resolve());
            })
            .then(() => {
                folder.generateAsync({ type: "blob" }).then((content) => {
                    saveAs(content, getFolder());

                    document.getElementById("progress").remove();
                    document.getElementById("menu").remove();
                });
            });
    };

    window.onscroll = () => {
        // scrollTop是滚动条滚动时，距离顶部的距离
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        // windowHeight是可视区的高度
        const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
        // scrollHeight是滚动条的总高度
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

        // 滚动条到底部的条件
        const distance = 1600;
        if (scrollHeight - scrollTop - windowHeight <= distance) {
            setMenu();
        }
    };
})();
