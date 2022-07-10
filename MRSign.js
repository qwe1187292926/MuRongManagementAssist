// ==UserScript==
// @name         出勤助手
// @namespace    hoyoung.assist.att.sDay
// @version      0.9
// @icon         https://www.agemys.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/qwe1187292926/MuRongManagementAssist/main/MRSign.js
// @downloadURL    https://raw.githubusercontent.com/qwe1187292926/MuRongManagementAssist/main/MRSign.js
// @description  A script enhance MR attendance management
// @author       NOBODY
// @match      https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332005
// @match      https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332015
// @match      https://mis.murongtech.com/mrmis/login.do
// @match      https://mis.murongtech.com/mrmis/
// @match      https://mis.murongtech.com/mrmis/logOut.do
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// 工作日字典：let dict={"1":"休","0":"班"};
// 0为工作日，1为休息日
const WORK_DAY = "0";
const ON_WORK = "01";
let WORK_DICT={"05":"婚假","04":"病假","03":"事假","02":"调休","01":"√","00":"未出勤","12":"居家办公","14":"育儿假","11":"远程","06":"丧假","07":"陪产假","08":"产假","13":"病休","10":"产检假","09":"年假"};

let loginUser = {
    oper_no:"",
    oper_pwd:"",
    oper_log_mod:"1",
    rad:""
};

let savedUsers = {};

(function () {
    'use strict';

    // 自动填充用户名密码
    if (isLoginPage()) {
        notify('已自动填充密码，可点击标题配置账号密码');
        const un_ip = $('#oper_no')
        const pwd_ip = $('#oper_pwd1')
        un_ip.val(GM_getValue("un",""))
        pwd_ip.val(GM_getValue("pwd",""))
        // 标题事件
        $('h3[class=form-title]').click(() => {
            GM_setValue("un", prompt("username"))
            GM_setValue("pwd", prompt("password"))
            un_ip.val(GM_getValue("un", ""))
            pwd_ip.val(GM_getValue("pwd", ""))
        })
        return
    }

    // 欢迎
    welcome();

    // 初始化工具栏区域
    const target = $("#toolbar");
    let selectData = `<select name="chk_sts" id="hoyoung_status_data" class="m-wrap span5" style="margin-top: 0;margin-bottom:0px;margin-right:5px;max-width: 5rem">`
    let keys = Object.keys(WORK_DICT)
    let values = Object.values(WORK_DICT)
    for (let i=0;i<keys.length;i++) {
        selectData += `<option value=${keys[i]}>${values[i]}</option>`
    }
    selectData += `</select>`
    target.prepend(btnGenerator('hoyoung_set_status_data', ' 应用', 'fa fa-check-square-o'))
    target.prepend(selectData)
    target.prepend(btnGenerator('hoyoung_set_product_data', ' 智慧填充', 'fa fa-rocket'));
    target.prepend('<input id="search_proid" placeholder="请输入项目编号" style="margin-right: 5px;max-width: 8rem" class="m-wrap span5" type="text" value="' + GM_getValue("proId", "") + '"/>');
    target.find('#hoyoung_set_product_data').click(function () {
        setProductInfo(target.find("#search_proid").val())
        setWorkStatus()
    })
    target.find('#hoyoung_set_status_data').click(function () {
        // 修改工作日为出勤
        const rows = $("#murong-table").bootstrapTable('getSelections');
        let length = rows.length;
        for (let n = 1; n <= length; n++) {
            let row = rows[n - 1];
            // hld_flg 假日标记值 盲猜是holiday flag
            // if (row.hld_flg == WORK_DAY) row.att_typ = ON_WORK
            row.att_typ = target.find("#hoyoung_status_data").val()
        }
        refreshTable()
    })
})();

function isLoginPage(){
    return getLocation() == 'https://mis.murongtech.com/mrmis/' || getLocation() == 'https://mis.murongtech.com/mrmis/login.do' || getLocation() == 'https://mis.murongtech.com/mrmis/logOut.do'
}

function setLoginUserData(username,password){
    $.ajax({
        url: "/mrmis/common/srand_num.jsp?"
            + new Date().getTime(),
        type: "POST",
        async: false,
        success: function (srand_num) {
            console.log("1234")
            loginUser.oper_pwd = strEnc(password, srand_num);
            loginUser.oper_no = username;
            loginUser.rad = srand_num;
        }
    });
}

function getSavedUsers(){
    let raw = GM_getValue('save_users', "");
    let users = raw.split("|");
    for (const user in users) {
        let userArray = user.split("：")
        eval("savedUsers."+ userArray[0] + " = " + userArray[1])
    }
}

function refreshTable() {
    // 此方式加载表格会导致分页异常，无法加载下一页。可以用筛选条件-初始化来解决。
    const data = $("#murong-table")
    data.bootstrapTable('load', data.bootstrapTable('getData'))
}

function setWorkStatus(){
    // 获取当前页
    const data = $("#murong-table")
    data.bootstrapTable('checkAll');
    const rows = data.bootstrapTable('getSelections');
    // 修改工作日为出勤
    let length = rows.length;
    for (let n = 1; n <= length; n++) {
        let row = rows[n - 1];
        // hld_flg 假日标记值 盲猜是holiday flag
        if (row.hld_flg == WORK_DAY) row.att_typ = ON_WORK
    }
    // 重新加载页面
    refreshTable();
    notify('已自动勾选工作日为出勤！');
}

function setProductInfo(proId) {
    $HTTP('post', 'https://mis.murongtech.com/mrmis/attProjectQuery.do',
        "search=&t=" + Date.now() + "&limit=10&offset=0&totalRows=8&pro_nm=" + proId,
        function (res) {
            res = JSON.parse(res.responseText)
            if (res.rec_num == "1") {
                console.log(res)
                let data = res.rec[0];
                const table = $("#murong-table");
                table.bootstrapTable('checkAll');
                const rows = table.bootstrapTable('getSelections');
                const length = rows.length;
                for (let n = 1; n <= length; n++) {
                    const row = rows[n - 1];
                    for (let key in data) {
                        eval("row." + key + "= data['" + key + "']")
                    }
                }
                refreshTable();
                GM_setValue("proId", proId);
                notify(`${proId} 项目编号已记录`);
            } else {
                console.log("ads", res)
                notify("项目查询结果包含多个或无结果！");
            }
        }, function (res) {
            console.log(res);
            notify("请求失败，详见控制台！");
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

function login(username,password) {
    setLoginUserData(username,password);
    moniFormSubmit("https://mis.murongtech.com/mrmis/login.do",loginUser)
}

function moniFormSubmit(url,args) {
    var body = $(document.body),//目标容器
        form = $("<form method='post'></form>"),//虚拟表单创建
        input;//表单
    form.attr({"action": url});//url
    $.each(args, function (key, value) { //遍历
        input = $("<input type='hidden'>");
        input.attr({"name": key});
        input.val(value);
        form.append(input);
    });

    form.appendTo(document.body);//插入
    form.submit();//提交
}

function getLocation() {
    return location.toString();
}

function btnGenerator(id, text, custom_icon) {
    return $("<button class='btn btn-primary green-stripe' style='margin-left: 10px' id='" + id + "'><i class='" + custom_icon + "'/> " + text + "</button><span style='display: inline-block;margin: 0 2rem;border-left: 2px solid #8080805e;'>1</span>")
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