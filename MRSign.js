// ==UserScript==
// @name         出勤助手
// @namespace    hoyoung.assist.att.sDay
// @version      1.1
// @icon         https://www.agemys.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/qwe1187292926/MuRongManagementAssist/main/MRSign.js
// @downloadURL    https://raw.githubusercontent.com/qwe1187292926/MuRongManagementAssist/main/MRSign.js
// @description  A script enhance MR attendance management
// @author       NOBODY
// @match      https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332005
// @match      https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332015
// @match      https://mis.murongtech.com/mrmis/login.do
// @match      https://mis.murongtech.com/mrmis/
// @match      https://mis.murongtech.com/mrmis/toHome.do
// @match      https://mis.murongtech.com/mrmis/logOut.do
// @require      https://mis.murongtech.com/mrmis/js/bootstrap-datatable/bootstrap-table.js?t=202009080152320
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// 工作日字典：let dict={"1":"休","0":"班"};
// 0为工作日，1为休息日
const WORK_DAY = "0";
const ON_WORK = "01";
let WORK_DICT = {
    "05": "婚假",
    "04": "病假",
    "03": "事假",
    "02": "调休",
    "01": "√",
    "00": "未出勤",
    "12": "居家办公",
    "14": "育儿假",
    "11": "远程",
    "06": "丧假",
    "07": "陪产假",
    "08": "产假",
    "13": "病休",
    "10": "产检假",
    "09": "年假"
};

let loginUser = {
    oper_no: "",
    oper_pwd: "",
    oper_log_mod: "1",
    rad: ""
};

let MRCfg = {
    defaultLoginUser: {username: "", password: ""},
    savedUsers: [],
    proId: ""
}

function initMRCfg() {
    let saved = GM_getValue("MR_CONFIG", "")
    if (saved == "") {
        GM_setValue("MR_CONFIG", MRCfg)
    } else {
        mergeObject(saved,MRCfg)
    }
    MRCfg = saved
}

function saveMRCfg() {
    GM_setValue("MR_CONFIG", MRCfg)
}


(function () {
    'use strict';


    initMRCfg()

    // 自动填充用户名密码
    if (isLoginPage()) {
        const un_ip = $('#oper_no')
        const pwd_ip = $('#oper_pwd1')

        if (MRCfg.defaultLoginUser.password!="" && MRCfg.defaultLoginUser.username!="") {
            notify('已自动填充默认登录账号');
            pwd_ip.val(MRCfg.defaultLoginUser.password)
            un_ip.val(MRCfg.defaultLoginUser.username)
        }

        if (MRCfg.savedUsers.length>1&&MRCfg.defaultLoginUser.password=="") notify("你可以点击标题设置自动填充登录用户或者进行多账号管理！")

        const login_btn = $($('button[type=submit]')[0])
        let clearSavedUserData = $(`<a>清除已保存的用户</a>`)
        let logSavedUserData = $(`<a style="margin-left: 1rem">查看保存的用户名与密码</a>`)
        clearSavedUserData.click(clearSavedUsers);
        logSavedUserData.click(() => {
            console.log("保存的用户和密码", MRCfg.savedUsers)
        })
        $($('a[data-toggle]')[0]).parent().parent().append(clearSavedUserData)
        $($('a[data-toggle]')[0]).parent().parent().append(logSavedUserData)
        // 移除按钮登录事件
        login_btn.removeAttr('type')

        // 劫持原按钮
        login_btn.text("Save and login")
        login_btn.click((event) => {
            event.preventDefault()
            const username = $('#oper_no').val()
            const password = $('#oper_pwd1').val()
            let findInArray = MRCfg.savedUsers.find(o => o.username === username)
            if (findInArray != undefined) {
                let oPassword = findInArray.password
                // 更新密码
                if (password != oPassword) {
                    setSavedUsers(username, password)
                }
            } else {
                setSavedUsers(username, password)
            }
            login(username, password)
        })
        // 劫持标题
        $('h3.form-title').click(function () {
            initTableSavedUsers()
        })
        return;
    }
    // 欢迎
    welcome();

    // 初始化工具栏区域
    const target = $("#toolbar");

    // 切换账号的生成区域
    target.prepend(btnGenerator('hoyoung_login_user', ' 多账号管理', 'blue-stripe', 'fa fa-user', '切换账号'))

    let li = `<li id="multiAccount"><a href="#"> <i class="icon-envelope"></i> 多账号管理</a></li>`
    $('li.user ul.dropdown-menu').append(li)


    // 自定义出勤状态的生成区域
    let selectData = `<select name="chk_sts" id="hoyoung_status_data" class="m-wrap span5" style="margin-top: 0;margin-bottom:0px;margin-right:5px;max-width: 5rem">`
    let keys = Object.keys(WORK_DICT)
    let values = Object.values(WORK_DICT)
    for (let i = 0; i < keys.length; i++) {
        selectData += `<option value=${keys[i]}>${values[i]}</option>`
    }
    selectData += `</select>`
    target.prepend(btnGenerator('hoyoung_set_status_data', ' 应用', 'yellow-stripe', 'fa fa-check-square-o', '将选中行应用这个出勤状态'))
    target.prepend(selectData)

    // 智慧填充的生成区域
    target.prepend(btnGenerator('hoyoung_set_product_data', ' 智慧填充', 'green-stripe', 'fa fa-rocket', '将该项目编号填入到所有项目，并自动勾选出勤状态'));
    target.prepend('<input id="search_proid" placeholder="请输入项目编号" style="margin-right: 5px;max-width: 8rem" class="m-wrap span5" type="text" value="' + MRCfg.proId + '"/>');

    // 添加事件
    // 智慧填充
    target.find('#hoyoung_set_product_data').click(function () {
        setProductInfo(target.find("#search_proid").val())
        setWorkStatus()
    })
    // 选中行
    target.find('#hoyoung_set_status_data').click(function () {
        // setWorkStatus(target.find("#hoyoung_status_data").val());
        initConditionApply()
    })
    // 切换账号
    target.find('#hoyoung_login_user').click(function () {
        initTableSavedUsers()
    })
    $('#multiAccount').click(()=>{
        initTableSavedUsers()
    })
})();

/**
 * 添加一个用户
 * @param username
 * @param password
 */
function setSavedUsers(username, password) {
    console.log(username, password)
    let object = {username: username, password: password}
    MRCfg.savedUsers.push(object)
    saveMRCfg()
}

function delSavedUser(name) {
    MRCfg.savedUsers.splice(getIndexOfUser(name),1)
    saveMRCfg()
}

function getIndexOfUser(name){
    return MRCfg.savedUsers.findIndex(o => o.username === name);
}

/**
 * 清除保存的用户数据
 */
function clearSavedUsers() {
    MRCfg.savedUsers = []
    saveMRCfg()
    notify("数据已清除")
}

/**
 * 设置出勤
 * @param att 出勤值，可参考全局变量，为空时自动判断
 */
function setWorkStatus(att = "") {
    // 获取当前页
    const data = $("#murong-table")
    // 无参数时全选
    if (att == "") {
        data.bootstrapTable('checkAll');
    }
    const rows = data.bootstrapTable('getSelections');
    // 修改工作日为出勤
    let length = rows.length;
    for (let n = 1; n <= length; n++) {
        let row = rows[n - 1];
        // hld_flg 假日标记值 盲猜是holiday flag
        // 无参数 工作日上班 休息日休息
        if (att == "") {
            if (row.hld_flg == WORK_DAY) row.att_typ = ON_WORK
        } else {
            row.att_typ = att
        }
    }
    // 重新加载页面
    refreshTable();
    if (att == "") {
        notify('已自动勾选工作日为出勤！');
    } else {
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
            let data = res.rec[0];
            if (res.rec_num == "1" || confirm(`当前项目包含多个项目编号，是否选用最相近的结果：\n项目编号：${data.pro_id}\n项目名称：《${data.pro_nm}》\n项目负责人：${data.att_man_nm}`)) {
                console.log(res)
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
                MRCfg.proId = proId
                saveMRCfg()
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

function customMyModelView(html,title) {
    if ($('#hoyoungModal').length == 0) {
        let modelTemplate = `
    <div aria-hidden="false" aria-labelledby="myModalLabel" role="dialog" tabindex="-1" id="hoyoungModal" class="modal fade ui-draggable in" style="display: block;">
        <div class="modal-dialog" style="width: 600px;">
        <div class="portlet box blue">
        <div class="portlet-title">
            <div class="caption"><i class="icon-reorder"></i><span id="closeM">${title}</span></div>
        </div>
        <div class="portlet-body modal-body" id="mmmmodal-body">
            ${html}
        </div>
        </div>
        </div>
    </div>`
        $('body').append(modelTemplate)
        $('#closeM').click(() => {
            $('#hoyoungModal').hide()
        })

    } else {
        $('#closeM').text(title)
        $('#mmmmodal-body').html(html)
        $('#hoyoungModal').show()
    }


}

function initConditionApply() {
    customMyModelView(`
        <div style="display: flex;justify-content: space-between">
        <div class="span3">
           <label class="btn red-stripe">* 考勤月份</label>
               <span class="input-group  custom-date-range form-inline" data-date="201601" data-date-format="yyyyMM">
                  <input class="span5 m-wrap form-control date-picker dpd1" id="att_month" data-date-format="yyyy-mm" name="att_month" placeholder="" type="text" value="2022-07" required="">
               </span>
        </div>
</div>
    `,"根据条件应用 - 点我关闭")
}

/**
 * 初始化切换账号的显示
 */
function initTableSavedUsers() {
    customMyModelView(`
                <div style="display: flex;justify-content: space-between;flex-wrap: wrap;">
                    <button class="btn btn-primary" id="hoyoung_set_dfl_login_user"><i class="fa fa-check-square-o"></i>  默认登录用户</button>
                    <button class="btn btn-primary" id="hoyoung_login"><i class="fa fa-check-square-o"></i>  Login</button>
                    <button class="btn btn-primary" id="hoyoung_del_user"><i class="fa fa-check-square-o"></i>  delete</button>
                </div>
                <table class="murong-table table table-hover" id="hoyoung_table"
                  data-toggle="table" data-click-to-select="true" 
                  data-show-columns="false" 
                  data-select-item-name="myRadioName">
                </table>`,"切换登录用户 - 点我关闭")
    $table = $('#hoyoung_table')
    $table.on('click-row.bs.table', function (e, row, $element) {
        $('.success').removeClass('success');
        $($element).addClass('success');
    })
    $table.bootstrapTable({
        columns: [{
            fileid: 'state', checkbox: true,
        }, {
            title: '序号',
            field: 'index',
            align: 'center',
            valign: 'middle',
            sortable: 'true',
        }, {
            title: '用户名',
            field: 'username',
            align: 'center',
            valign: 'middle',
            sortable: 'true',
        }]
    })

    $table.on('click-row.bs.table', function (e, row, $element) {
        $('.success').removeClass('success');
        $($element).addClass('success');
    });

    $table.bootstrapTable('load', getWarpedSavedUsers());

    $('#hoyoung_set_dfl_login_user').click(function () {
        let result = $table.bootstrapTable('getSelections');
        if (result.length > 1){
            notify("坑爹呢，你默认登录这么多个用户吗？")
        }else {
            for (let i = 0; i < result.length; i++) {
                MRCfg.defaultLoginUser = MRCfg.savedUsers[getIndexOfUser(result[i].username)]
                saveMRCfg()
                notify("默认账号已设置为："+result[i].username)
            }
        }
    })
    $('#hoyoung_login').click(function () {
        let result = $table.bootstrapTable('getSelections');
        if (result.length > 1){
            notify("坑爹呢，你默认登录这么多个用户吗？")
        }else {
            login(result[0].username, MRCfg.savedUsers[getIndexOfUser(result[0].username)].password)
        }

    })
    $('#hoyoung_del_user').click(function () {
        let result = $table.bootstrapTable('getSelections');
        for (let i = 0; i < result.length; i++) {
            delSavedUser(result[i].username)
        }
        $table.bootstrapTable('load', MRCfg.savedUsers);
    })
}

function getWarpedSavedUsers() {
    return MRCfg.savedUsers.concat()
}

/**
 * 模拟登录方法 - 最外层
 * @param username
 * @param password
 */
function login(username, password) {
    setLoginUserData(username, password);
    moniFormSubmit("https://mis.murongtech.com/mrmis/login.do", loginUser)
}

/**
 * 将用户名密码加密
 * @param username
 * @param password
 */
function setLoginUserData(username, password) {
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

function moniFormSubmit(url, args) {
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
function btnGenerator(id, text, bColor = "", custom_icon = "", btnHint = '') {
    return $(`<button class='btn btn-primary ${bColor}' title=${btnHint} style='margin-left: 10px' id='${id}'><i class='${custom_icon}'/> ${text}</button><span style='display: inline-block;margin: 0 2rem;border-left: 2px solid #8080805e;'>1</span>`)
}

/**
 * 欢迎
 */
function welcome() {
    notify('智能出勤脚本加载成功！');
}

/**
 * 合并两个对象，只合并 obj1 中不包含（或为undefined, null）但 obj2 中有的属性
 * 删除 obj1 有但 obj2 中没有的属性
 */
function mergeObject(obj1, obj2) {
    function combine(object1, object2) {
        for (let i in object2) {
            if (object1[i] === undefined || object1[i] === null) object1[i] = object2[i];
            else if (!Array.isArray(object1[i]) && typeof object1[i] === 'object') combine(object1[i], object2[i]);
        }
    }
    function del(object1, object2) {
        for (let i in object1) {
            if (object2[i] === undefined || object2[i] === null) delete object1[i];
            else if (!Array.isArray(object1[i]) && typeof object1[i] === 'object') del(object1[i], object2[i]);
        }
    }
    combine(obj1, obj2);
    del(obj1, obj2);
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
function isLoginPage() {
    return getLocation() == 'https://mis.murongtech.com/mrmis/' || getLocation() == 'https://mis.murongtech.com/mrmis/login.do' || getLocation() == 'https://mis.murongtech.com/mrmis/logOut.do'
}