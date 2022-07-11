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
        const login_btn = $($('button[type=submit]')[0])
        let clearSavedUserData = $(`<a>清除已保存的用户</a>`)
        clearSavedUserData.click(clearSavedUsers);
        $($('a[data-toggle]')[0]).parent().parent().append(clearSavedUserData)
        login_btn.removeAttr('type')
        un_ip.val(GM_getValue("un",""))
        pwd_ip.val(GM_getValue("pwd",""))
        // 标题事件
        login_btn.click((event)=> {
            event.preventDefault()
            initSavedUsers()
            const username = $('#oper_no').val()
            const password = $('#oper_pwd1').val()
            if (username in savedUsers){
                let oPassword = eval("savedUsers." + username)
                // 更新密码
                if (password != oPassword){
                    setSavedUsers(username,password)
                }
            }else {
                setSavedUsers(username,password)
            }
            console.log(savedUsers)
            login(username,password)
        })
        return;
    }
    // 欢迎
    welcome();

    // 初始化工具栏区域
    const target = $("#toolbar");

    // 切换账号的生成区域
    initSavedUsers()
    let userSelectData = `<select name="chk_sts" id="hoyoung_user_data" class="m-wrap span5" style="margin-top: 0;margin-bottom:0px;margin-right:5px;max-width: 8rem">`
    let userKeys = Object.keys(savedUsers)
    let userValues = Object.values(savedUsers)
    for (let i=0;i<userKeys.length;i++) {
        userSelectData += `<option value=${userValues[i]}>${userKeys[i]}</option>`
    }
    userSelectData += `</select>`
    target.prepend(btnGenerator('hoyoung_login_user', ' 切换', 'blue-stripe','fa fa-user','切换账号'))
    target.prepend(userSelectData)

    // 自定义出勤状态的生成区域
    let selectData = `<select name="chk_sts" id="hoyoung_status_data" class="m-wrap span5" style="margin-top: 0;margin-bottom:0px;margin-right:5px;max-width: 5rem">`
    let keys = Object.keys(WORK_DICT)
    let values = Object.values(WORK_DICT)
    for (let i=0;i<keys.length;i++) {
        selectData += `<option value=${keys[i]}>${values[i]}</option>`
    }
    selectData += `</select>`
    target.prepend(btnGenerator('hoyoung_set_status_data', ' 应用', 'yellow-stripe','fa fa-check-square-o','将选中行应用这个出勤状态'))
    target.prepend(selectData)

    // 智慧填充的生成区域
    target.prepend(btnGenerator('hoyoung_set_product_data', ' 智慧填充', 'green-stripe','fa fa-rocket','将该项目编号填入到所有项目，并自动勾选出勤状态'));
    target.prepend('<input id="search_proid" placeholder="请输入项目编号" style="margin-right: 5px;max-width: 8rem" class="m-wrap span5" type="text" value="' + GM_getValue("proId", "") + '"/>');

    // 添加事件
    target.find('#hoyoung_set_product_data').click(function () {
        setProductInfo(target.find("#search_proid").val())
        setWorkStatus()
    })
    target.find('#hoyoung_set_status_data').click(function () {
        setWorkStatus(target.find("#hoyoung_status_data").val());
    })
    target.find('#hoyoung_login_user').click(function () {

        login(target.find("#hoyoung_user_data option:selected").text(),target.find("#hoyoung_user_data").val());
    })
})();


/**
 * 获取保存的全部用户
 * 该方法用于一键登录
 */
function initSavedUsers(){
    let raw = GM_getValue('save_users', "");
    let users = raw.split("|");
    console.log(users)
    for (const user in users) {
        if (users[user] == "") break;
        let userArray = users[user].split("：")
        console.log(userArray)
        eval("savedUsers."+ userArray[0] + " = '" + userArray[1]+"'")
    }
    console.log(savedUsers)
}

/**
 * 添加一个用户
 * @param username
 * @param password
 */
function setSavedUsers(username,password){
    if (savedUsers.length==0){
        initSavedUsers();
    }
    eval("savedUsers." + username + "='" +password+"'")
    let userKeys = Object.keys(savedUsers)
    let userValues = Object.values(savedUsers)
    let saved_users_string = ""
    for (let i=0;i<userKeys.length;i++) {
        saved_users_string += userKeys[i] + "：" +userValues[i]+"|"
    }
    GM_setValue("save_users", saved_users_string);
}

/**
 * 清除保存的用户数据
 */
function clearSavedUsers(){
    savedUsers = {}
    GM_setValue("save_users", "");
    notify("数据已清除")
}

/**
 * 设置出勤
 * @param att 出勤值，可参考全局变量，为空时自动判断
 */
function setWorkStatus(att = ""){
    // 获取当前页
    const data = $("#murong-table")
    // 无参数时全选
    if (att==""){
        data.bootstrapTable('checkAll');
    }
    const rows = data.bootstrapTable('getSelections');
    // 修改工作日为出勤
    let length = rows.length;
    for (let n = 1; n <= length; n++) {
        let row = rows[n - 1];
        // hld_flg 假日标记值 盲猜是holiday flag
        // 无参数 工作日上班 休息日休息
        if (att==""){
            if (row.hld_flg == WORK_DAY) row.att_typ = ON_WORK
        }else {
            row.att_typ = att
        }
    }
    // 重新加载页面
    refreshTable();
    if (att=="") {
        notify('已自动勾选工作日为出勤！');
    }else {
        notify('选中行已勾选指定状态')
    }
}

/**
 * 填充项目信息，并自动出勤
 * @param proId
 */
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

/**
 * 自定义http发送器
 * @param method post, get
 * @param url String
 * @param data
 * @param onSuccess function
 * @param onFailed function
 */
function $HTTP(method, url, data, onSuccess, onFailed) {
    GM_xmlhttpRequest({
        method: method,
        url: url,
        data: data,
        headers: {
            "Referer": getLocation(),
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": document.cookie
        },

        onload: onSuccess,
        onerror: onFailed
    });
}

/**
 * 模拟登录方法 - 最外层
 * @param username
 * @param password
 */
function login(username,password) {
    setLoginUserData(username,password);
    moniFormSubmit("https://mis.murongtech.com/mrmis/login.do",loginUser)
}

/**
 * 将用户名密码加密
 * @param username
 * @param password
 */
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

/**
 * 刷新表格 ⚠会导致默认翻页失效⚠
 */
function refreshTable() {
    // 此方式加载表格会导致分页异常，无法加载下一页。可以用筛选条件-初始化来解决。
    const data = $("#murong-table")
    data.bootstrapTable('load', data.bootstrapTable('getData'))
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

/**
 * 生成带样式的按钮
 * @param id  按钮id
 * @param text  文本
 * @param bColor  边框颜色
 * @param custom_icon  awesome icon
 * @returns {*|jQuery|HTMLElement}
 */
function btnGenerator(id, text, bColor="",custom_icon="",btnHint='') {
    return $(`<button class='btn btn-primary ${bColor}' title=${btnHint} style='margin-left: 10px' id='${id}'><i class='${custom_icon}'/> ${text}</button><span style='display: inline-block;margin: 0 2rem;border-left: 2px solid #8080805e;'>1</span>`)
}

/**
 * 欢迎
 */
function welcome() {
    notify('智能出勤脚本加载成功！');
}

/**
 * 通知
 * @param msg 消息
 */
function notify(msg) {
    Messenger().post({
        singleton: true,
        message: msg
    });
}

/**
 * 是否登录页
 * @returns {boolean}
 */
function isLoginPage(){
    return getLocation() == 'https://mis.murongtech.com/mrmis/' || getLocation() == 'https://mis.murongtech.com/mrmis/login.do' || getLocation() == 'https://mis.murongtech.com/mrmis/logOut.do'
}