// ==UserScript==
// @name         出勤助手
// @namespace    hoyoung.assist.att.sDay
// @version      0.1
// @icon         https://www.agemys.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/qwe1187292926/MuRongManagementAssist/main/MRSign.js
// @downloadURL    https://raw.githubusercontent.com/qwe1187292926/MuRongManagementAssist/main/MRSign.js
// @description  A script enhance MR attendance management
// @author       NOBODY
// @match      https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332005
// @match      https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332015
// @match      https://mis.murongtech.com/mrmis/login.do
// @match      https://mis.murongtech.com/mrmis/
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

let username = '', password = '';
(function () {
    'use strict';

    // 自动填充用户名密码
    if (getLocation() == 'https://mis.murongtech.com/mrmis/' || getLocation() == 'https://mis.murongtech.com/mrmis/login.do') {
        notify('已自动填充密码，可在脚本文件中配置账号密码');
        $('#oper_no').val(String(username))
        $('#oper_pwd1').val(String(password))
        return
    }

    // 欢迎
    welcome();

    // 出勤字典：var dict={"05":"婚假","04":"病假","03":"事假","02":"调休","01":"√","00":"未出勤","12":"居家办公","14":"育儿假","11":"远程","06":"丧假","07":"陪产假","08":"产假","13":"病休","10":"产检假","09":"年假"};
    // 工作日字典：var dict={"1":"休","0":"班"};
    // 0为工作日，1为休息日
    var WORK_DAY = "0"
    var ON_WORK = "01"
    // 初始化工具栏区域
    var target = $("#toolbar");
    target.prepend(btnGenerator('hoyoung_auto_setStatus', '一键出勤', 'fa fa-plane'));
    target.prepend(btnGenerator('hoyoung_set_product_data', '一键同步项目到每行', ''));
    target.prepend('<input id="search_proid" placeholder="请输入项目名称/项目编号" style="margin-right: 5px" class="m-wrap span5" type="text" value="' + GM_getValue("proId", "") + '"/>');

    target.find("#hoyoung_auto_setStatus").click(function () {
        // 获取当前页
        var data = $("#murong-table")
        data.bootstrapTable('checkAll');
        var rows = data.bootstrapTable('getSelections');
        // 修改工作日为出勤
        var length = rows.length;
        for (var n = 1; n <= length; n++) {
            var row = rows[n - 1];
            // hld_flg 假日标记值 盲猜是holiday flag
            if (row.hld_flg == WORK_DAY) row.att_typ = ON_WORK
        }
        // 重新加载页面
        refleshTable()
        notify('已自动勾选工作日为出勤！');
    })
    target.find('#hoyoung_set_product_data').click(function () {
        setProductInfo(target.find("#search_proid").val())
    })
})();

function refleshTable() {
    // 此方式加载表格会导致分页异常，无法加载下一页。可以用筛选条件-初始化来解决。
    var data = $("#murong-table")
    data.bootstrapTable('load', data.bootstrapTable('getData'))
}

function setProductInfo(proId) {
    $HTTP('post', 'https://mis.murongtech.com/mrmis/attProjectQuery.do', "search=&t=" + Date.now() + "&limit=10&offset=0&totalRows=8&pro_nm=" + proId, function (res) {
        res = JSON.parse(res.responseText)
        if (res.rec_num == "1") {
            console.log(res)
            var data = res.rec[0];
            notify(data.pro_nm + "-" +data.att_man_nm)
            var table = $("#murong-table");
            table.bootstrapTable('checkAll');
            var rows = table.bootstrapTable('getSelections');
            var length = rows.length;
            for (var n = 1; n <= length; n++) {
                var row = rows[n - 1];
                for (key in data) {
                    eval("row." + key + "= data['" + key + "']")
                }
            }
            refleshTable();
            notify("已完成，成功的项目编号将自动保存");
            GM_setValue("proId", proId)
        } else {
            console.log("ads", res)
            notify("项目查询结果包含多个或无结果！")
        }
    }, function (res) {
        console.log(res)
        notify("请求失败，详见控制台！")
    })
}

function $HTTP(method, url, data, onSuccess, onFailed) {
    GM_xmlhttpRequest({
        method: method,
        url: url,
        data: data,
        headers: {
            "Referer": "https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332005",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": document.cookie
        },

        onload: onSuccess,
        onerror: onFailed
    });
}

function getLocation() {
    return location.toString();
}

function btnGenerator(id, text, custom_icon) {
    return $("<button class='btn btn-primary' id='" + id + "' style='margin-right: 15px'><i class='" + custom_icon + "'/> " + text + "</button>")
}

function welcome() {
    notify('智能出勤脚本加载成功！');
}

function notify(msg) {
    Messenger().post({
        singleton: true,
        message: msg
    });
}