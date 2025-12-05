// ==UserScript==
// @name         ExHentai Torrent to E-Hentai
// @namespace    http://hoyoung.net/ExTorrentToEh
// @version      2025-03-01
// @description  ExHentai里站的种子下载地址，增加E-Hentai表站的下载的链接，并且修改为点击复制而不是跳转。（有时候里站的种子地址托管给nas下不动，改用E-Hentai表站下载。
// @author       Hoyoung
// @match        https://exhentai.org/gallerytorrents.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=e-hentai.org
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    console.log("ExHentai Torrent to E-Hentai Started")
    // 选择所有a标签
    const exLinks = document.querySelectorAll('a[href^="https://exhentai.org/torrent/"]');
    // const exLinks = document.querySelectorAll('a[href^="https://ehtracker.org/"]');

    exLinks.forEach(link => {
        // 解析原链接
        const url = new URL(link.href);

        const newTd = document.createElement('td');
        // 构建新链接
        const ehUrl = new URL(url.pathname.replace('/torrent', '/get') + url.search, 'https://ehtracker.org/');

        // 创建新a标签
        const newLink = document.createElement('a');
        newLink.href = ehUrl.href;
        newLink.textContent = "(E-hentai)" + link.textContent; // 保持原文案
        newLink.target = link.target;         // 复制target属性（可选）

        // 组装结构
        newTd.appendChild(newLink);                     // 将链接放入td中
        // 插入到父元素末尾
        link.parentElement.appendChild(newTd);

        // 1. 处理所有已有的a标签
        document.querySelectorAll('a').forEach(anchor => {
            anchor.addEventListener('click', copyLink);
        });
    });
})();

// 复制链接函数
function copyLink(event) {
    event.preventDefault(); // 阻止默认跳转

    // 获取当前a标签的完整URL
    const url = this.href;

    // 执行复制操作
    navigator.clipboard.writeText(url).then(() => {
        console.log('链接已复制：', url);
        // 可选：添加UI反馈
        alert(`已复制链接：${url}`);
    }).catch(err => {
        console.error('复制失败：', err);
        alert('复制链接失败，请手动复制：', url);
    });
}