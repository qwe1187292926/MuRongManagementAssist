// ==UserScript==
// @name         出勤助手
// @namespace    https://github.com/qwe1187292926/
// @version      1001
// @icon         https://www.agemys.com/favicon.ico
// @description  A script enhance MR attendance management
// @homepageURL    https://github.com/qwe1187292926/MuRongManagementAssist
// @supportURL     https://github.com/qwe1187292926/MuRongManagementAssist/issue
// @updateURL    https://cdn.jsdelivr.net/gh/qwe1187292926/MuRongManagementAssist/MRHelper.min.js
// @downloadURL    https://cdn.jsdelivr.net/gh/qwe1187292926/MuRongManagementAssist/MRHelper.min.js
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

// 用webpack-cli
// 工作日字典：let dict={"1":"休","0":"班"};
// 0为工作日，1为休息日


var nzhcn;
!function (t, e) {
    nzhcn = e()
}(this, function () {
    "use strict";

    function t(t, e) {
        var r = i.getNumbResult(t);
        if (!r) return t;
        e = e || {};
        var n = this.ch, c = this.ch_u, h = this.ch_f || "", u = this.ch_d || ".", a = n.charAt(0), s = r.int,
            l = r.decimal, o = r.minus, f = "", g = "", p = o ? h : "";
        if (l) {
            l = i.clearZero(l, "0", "$");
            for (var d = 0; d < l.length; d++) g += n.charAt(+l.charAt(d));
            g = g ? u + g : ""
        }
        if (f = function t(r, h, u) {
            r = i.getNumbResult(r).int;
            var s = "", l = arguments.length > 1 ? arguments[1] : e.tenMin, o = r.length;
            if (1 == o) return n.charAt(+r);
            if (o <= 4) for (var f = 0, g = o; g--;) {
                var p = +r.charAt(f);
                s += l && 2 == o && 0 == f && 1 == p ? "" : n.charAt(p), s += p && g ? c.charAt(g) : "", f++
            } else {
                for (var d = r.length / 4 >> 0, A = r.length % 4; 0 == A || !c.charAt(3 + d);) A += 4, d--;
                var m = r.substr(0, A), v = r.substr(A);
                s = t(m, l) + c.charAt(3 + d) + ("0" == v.charAt(0) ? a : "") + t(v, v.length > 4 && l)
            }
            return s = i.clearZero(s, a)
        }(s), e.ww && c.length > 5) {
            var A = c.charAt(4), m = c.charAt(5), v = f.lastIndexOf(m);
            ~v && (f = f.substring(0, v).replace(new RegExp(m, "g"), A + A) + f.substring(v))
        }
        return p + f + g
    }

    function e(t) {
        t = t.toString();
        var e = t.split(this.ch_d), r = e[0].replace(this.ch_f, ""), n = e[1], c = !!~e[0].indexOf(this.ch_f),
            h = this.ch_u.charAt(1), u = this.ch_u.charAt(4), a = this.ch_u.charAt(5);
        r = r.replace(new RegExp(u + "{2}", "g"), a);
        for (var s = r.split(""), l = 0, o = 0, f = [], g = [], p = [], d = 0; d < s.length; d++) {
            var A = s[d], m = 0, v = 0;
            if (~(m = this.ch.indexOf(A))) m > 0 && p.unshift(m); else if (~(v = this.ch_u.indexOf(A))) {
                var _ = i.getDigit(v);
                l > v ? (i.unshiftZero(p, _), i.centerArray(g, p)) : v >= o ? (0 == d && (p = [1]), i.centerArray(f, g, p), f.length > 0 && i.unshiftZero(f, _), o = v) : (0 == p.length && h == A && (p = [1]), i.centerArray(g, p), i.unshiftZero(g, i.getDigit(v)), l = v)
            }
        }
        i.centerArray(f, g, p).reverse(), 0 == f.length && f.push(0);
        var x = 0;
        if (n) {
            f.push("."), x = "0.";
            for (var d = 0; d < n.length; d++) x += this.ch.indexOf(n.charAt(d)), f.push(this.ch.indexOf(n.charAt(d)));
            x = +x
        }
        return c && f.unshift("-"), parseFloat(f.join(""))
    }

    function r(e, r) {
        var n = {ww: !0, complete: !1, outSymbol: !0, unOmitYuan: !1}, c = i.getNumbResult(e), h = this.ch.charAt(0);
        if (r = "object" == typeof r ? r : {}, !c) return e;
        r = i.extend(n, r);
        var u = c.int, a = c.decimal || "", s = r.outSymbol ? this.m_t : "", l = c.minus ? this.ch_f : "", o = "";
        if (r.complete) {
            for (var f = 1; f < this.m_u.length; f++) o += t.call(this, a.charAt(f - 1) || "0") + this.m_u.charAt(f);
            l += t.call(this, u, r) + this.m_u.charAt(0)
        } else {
            var g = r.unOmitYuan || "0" !== u;
            if (a = a.substr(0, this.m_u.length - 1), a = i.clearZero(a, "0", "$")) for (var p, f = 0; f < this.m_u.length - 1; f++) a.charAt(f) && "0" != a.charAt(f) && (o += t.call(this, a.charAt(f)) + this.m_u.charAt(f + 1), p = !1), "0" !== a.charAt(f) || p || (0 == f && "0" === u || (o += h), p = !0);
            !g && o || (l += t.call(this, u, r) + this.m_u.charAt(0) + (c.decimal ? "" : this.m_z))
        }
        return s + l + o
    }

    function n(t, e) {
        return {
            encodeS: function (e, r) {
                return r = i.extend({ww: !0, tenMin: !0}, r), c.CL.call(t, e, r)
            }, encodeB: function (t, r) {
                return r = i.extend({ww: !0}, r), c.CL.call(e, t, r)
            }, decodeS: function () {
                return c.unCL.apply(t, arguments)
            }, decodeB: function () {
                return c.unCL.apply(e, arguments)
            }, toMoney: function (t, r) {
                return r = i.extend({ww: !0}, r), c.toMoney.call(e, t, r)
            }
        }
    }

    var i = function (t, e) {
        return e = {exports: {}}, t(e, e.exports), e.exports
    }(function (t, e) {
        var r = /^([+-])?0*(\d+)(\.(\d+))?$/, n = /^([+-])?0*(\d+)(\.(\d+))?e(([+-])?(\d+))$/i,
            i = e.e2ten = function (t) {
                var e = n.exec(t.toString());
                if (!e) return t;
                var r = e[2], i = e[4] || "", c = e[5] ? +e[5] : 0;
                if (c > 0) {
                    var h = i.substr(0, c);
                    h = h.length < c ? h + new Array(c - h.length + 1).join("0") : h, i = i.substr(c), r += h
                } else {
                    c = -c;
                    var u = r.length - c;
                    u = u < 0 ? 0 : u;
                    var a = r.substr(u, c);
                    a = a.length < c ? new Array(c - a.length + 1).join("0") + a : a, r = r.substring(0, u), i = a + i
                }
                return r = "" == r ? "0" : r, ("-" == e[1] ? "-" : "") + r + (i ? "." + i : "")
            };
        e.getNumbResult = function (t) {
            var e = r.exec(t.toString());
            if (!e && n.test(t.toString()) && (e = r.exec(i(t.toString()))), e) return {
                int: e[2],
                decimal: e[4],
                minus: "-" == e[1],
                num: e.slice(1, 3).join("")
            }
        }, e.centerArray = function t(e, r) {
            if (e.splice.apply(e, [0, r.length].concat(r.splice(0, r.length))), arguments.length > 2) {
                var n = [].slice.call(arguments, 2);
                n.unshift(e), t.apply(null, n)
            }
            return e
        };
        var c = e.hasAttr = function (t, e) {
            return Object.prototype.hasOwnProperty.call(t, e)
        };
        e.extend = function (t) {
            for (var e, r = arguments[0] || {}, n = Array.prototype.slice.call(arguments, 1), i = 0; i < n.length; i++) {
                var h = n[i];
                for (e in h) c(h, e) && (r[e] = h[e])
            }
            return r
        }, e.getDigit = function (t) {
            return t >= 5 ? 4 * (t - 4) + 4 : t
        }, e.unshiftZero = function (t, e) {
            if (null == e && (e = 1), !(e <= 0)) for (; e--;) t.unshift(0)
        }, e.clearZero = function (t, e, r) {
            if (null == t) return "";
            var n = ~"*.?+$^[](){}|\\/".indexOf(e) ? "\\" + e : e, i = new RegExp("^" + n + "+"),
                c = new RegExp(n + "+$"), h = new RegExp(n + "{2}", "g");
            return t = t.toString(), "^" == r && (t = t.replace(i, "")), r && "$" != r || (t = t.replace(c, "")), r && "nto1" != r || (t = t.replace(h, e)), t
        }
    }), c = (i.e2ten, i.getNumbResult, i.centerArray, i.hasAttr, i.extend, i.getDigit, i.unshiftZero, i.clearZero, {
        CL: t,
        unCL: e,
        toMoney: r
    }), h = n, u = {ch: "零一二三四五六七八九", ch_u: "个十百千万亿", ch_f: "负", ch_d: "点"}, a = {
        ch: "零壹贰叁肆伍陆柒捌玖",
        ch_u: "个拾佰仟万亿",
        ch_f: "负",
        ch_d: "点",
        m_t: "人民币",
        m_z: "整",
        m_u: "元角分"
    }, s = {s: u, b: a};
    return h(s.s, s.b)
});

const WORK_DAY = "0";
const ON_WORK = "01";

const TRAVEL_DICT = {"1": "出差", "0": "正常"}, WORK_DICT = {
    "03": "事假",
    "04": "病假",
    "05": "婚假",
    "02": "调休",
    "00": "未出勤",
    "12": "居家办公",
    "14": "育儿假",
    "11": "远程",
    "06": "丧假",
    "07": "陪产假",
    "08": "产假",
    "13": "病休",
    "10": "产检假",
    "09": "年假",
    "01": "√"
};

let loginUser = {
    oper_no: "",
    oper_pwd: "",
    oper_log_mod: "1",
    rad: ""
}, MRCfg = {
    IamBusinessTrip: false,
    resetFirstLoadRows: 0,
    enableSavedPwd: false,
    defaultLoginUser: {username: "", password: ""},
    savedUsers: [],
    proId: "",
    welcomeWords: "智能出勤脚本加载成功！",
    order: ""
}, readConfigArray = [undefined]

function initMRCfg() {
    let saved = GM_getValue("MR_CONFIG", "")
    if (saved == "") {
        GM_setValue("MR_CONFIG", MRCfg)
        saved = MRCfg
    } else {
        mergeObject(saved, MRCfg)
    }
    MRCfg = saved
}

function saveMRCfg() {
    GM_setValue("MR_CONFIG", MRCfg)
}


(function () {
    'use strict';


    initMRCfg()
    let order = MRCfg.order, W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow
    if (order !== "") {
        let t = order.split("|")
        let action = t[0];
        let param = t[1];
        switch (action) {
            case "r":
                MRCfg.order = "";
                saveMRCfg();
                window.location.href = param;
                break;
            default:
                break;
        }
    }

    // 自动填充用户名密码
    if (isLoginPage()) {
        const un_ip = $('#oper_no')
        const pwd_ip = $('#oper_pwd1')

        if (MRCfg.defaultLoginUser.password != "" && MRCfg.defaultLoginUser.username != "") {
            notify('已自动填充默认登录账号');
            pwd_ip.val(MRCfg.defaultLoginUser.password)
            un_ip.val(MRCfg.defaultLoginUser.username)
        }

        if (MRCfg.savedUsers.length > 1 && MRCfg.defaultLoginUser.password == "") notify("你可以点击标题设置自动填充登录用户或者进行多账号管理！")

        const login_btn = $($('button[type=submit]')[0])
        $("body").append($("<input type='file' id='Hoyoung_config_file' style='display:none'>"))
        const inputConfig_input = $("#Hoyoung_config_file");
        inputConfig_input.on("change", importConfig);
        let exportConfig_a = $(`<a>导出脚本配置</a>`)
        let importConfig_a = $(`<a style="margin-left: 1rem">导入脚本配置</a>`)
        let delConfig_a = $(`<a style="margin-left: 1rem">恢复默认配置</a>`)
        exportConfig_a.click(() => {
            exportConfig(MRCfg)
        });
        delConfig_a.click(() => {
            MRCfg = ""
            saveMRCfg()
            notify("已清空配置文件，将在三秒后刷新页面")
            setTimeout(() => {
                W.location.reload()
            }, 3000);
        });
        importConfig_a.click(() => {
            // 导入配置按钮
            readConfigArray[1] = $.Deferred();
            inputConfig_input.click();
            readConfigArray[1].then(() => {
                let json = readConfigArray[0];
                MRCfg = json.MY_CONFIG;
                saveMRCfg()
                notify('配置导入成功，3秒后将自动刷新页面');
                setTimeout(() => {
                    W.location.reload()
                }, 3000);
            })
        });
        $($('a[data-toggle]')[0]).parent().parent().append(exportConfig_a)
        $($('a[data-toggle]')[0]).parent().parent().append(importConfig_a)
        $($('a[data-toggle]')[0]).parent().parent().append(delConfig_a)
        // 移除按钮登录事件
        login_btn.removeAttr('type')

        // 劫持原按钮
        login_btn.text("Save and login")
        login_btn.click((event) => {
            event.preventDefault()
            const username = $('#oper_no').val()
            const password = $('#oper_pwd1').val()
            let findInArray = MRCfg.savedUsers.find(o => o.username === username)
            if (findInArray != undefined && MRCfg.enableSavedPwd) {
                let oPassword = findInArray.password
                // 更新密码
                if (password != oPassword) {
                    setSavedUsers(username, password)
                }
            } else if (MRCfg.enableSavedPwd) {
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

    if (target.length !== 0) {
        target.prepend(btnGenerator('hoyoung_status_data_count', ' 状态统计', 'purple-stripe', 'fa fa-check-square-o', '自动统计当月差旅费、加班天数明细等'))
        // 自定义出勤状态的生成区域
        target.prepend(btnGenerator('hoyoung_set_status_data', ' 自选条件填充', 'yellow-stripe', 'fa fa-check-square-o', '将选中行应用这个出勤状态'))

        // 智慧填充的生成区域
        target.prepend(btnGenerator('hoyoung_set_product_data', ' 智慧填充', 'green-stripe', 'fa fa-rocket', '将该项目编号填入到所有项目，并自动勾选出勤状态'));
        target.prepend('<input id="search_proid" placeholder="请输入项目编号" style="margin: 0 5px !important;max-width: 8rem" class="m-wrap span5" type="text" value="' + MRCfg.proId + '"/>');

        // 添加事件
        // 智慧填充
        target.find('#hoyoung_set_product_data').click(function () {
            const table = getMRTable();
            table.bootstrapTable('checkAll');
            const rows = table.bootstrapTable('getSelections');
            setProductInfo(target.find("#search_proid").val(), rows)
            setWorkStatus()
        })
        // 选中行
        target.find('#hoyoung_set_status_data').click(function () {
            // setWorkStatus(target.find("#hoyoung_status_data").val());
            initConditionApply()
        })
        target.find('#hoyoung_status_data_count').click(function () {
            // setWorkStatus(target.find("#hoyoung_status_data").val());
            initStateCount()
        })

        if (MRCfg.resetFirstLoadRows != 0 && isChuQingPage()) {
            $('table#murong-table').bootstrapTable('getOptions').pageSize = MRCfg.resetFirstLoadRows;
            conditionQuery();
        }

        jQuery('.popovers').popover();
    }

    // 切换账号的生成区域
    let li = `<li id="multiAccount"><a href="#"><i class="icon-user"></i>多账号管理</a></li>`
    $('ul.nav li.user').before(li)

    // 脚本设置的生成区域
    li = `<li id="hoyoung_setting"><a href="#"><i class="icon-cogs"></i>脚本设置</a></li>`
    $('ul.nav li.user').before(li)

    // 切换账号
    $('#multiAccount').click(() => {
        initTableSavedUsers()
    })
    $('#hoyoung_setting').click(() => {
        initSettingModal()
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
    MRCfg.savedUsers.splice(getIndexOfUser(name), 1)
    saveMRCfg()
}

function getIndexOfUser(name) {
    return MRCfg.savedUsers.findIndex(o => o.username === name);
}

/**
 * 设置出勤
 * @param att 出勤值，可参考全局变量，为空时自动判断
 */
function setWorkStatus() {
    // 获取当前页
    const data = getMRTable()
    // 无参数时全选
    data.bootstrapTable('checkAll');
    const rows = data.bootstrapTable('getSelections');
    // 修改工作日为出勤
    let length = rows.length;
    for (let n = 1; n <= length; n++) {
        let row = rows[n - 1];
        // hld_flg 假日标记值 盲猜是holiday flag
        // 无参数 工作日上班 休息日休息
        if (row.hld_flg == WORK_DAY) row.att_typ = ON_WORK
        if (MRCfg.IamBusinessTrip) {
            // TODO 硬编码
            row.travel_flg = 1
        }
    }
    if (MRCfg.IamBusinessTrip) {
        notify('出差辛苦了~已勾选全部自然日为出差！');
    }
    // 重新加载页面
    refreshTable();
    notify('已自动勾选工作日为出勤！');
}

function gbkToUtf8(str) {
    let utf8str = '';
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code >= 0x80 && code <= 0xFF) {
            // GBK 编码中，汉字通常是两个字节
            let byte1 = str.charCodeAt(i++);
            let byte2 = str.charCodeAt(i);
            let codePoint = ((byte1 & 0xFF) << 8) | (byte2 & 0xFF);
            utf8str += String.fromCharCode(((codePoint >> 8) & 0xFF) | ((codePoint << 8) & 0xFF00));
        } else {
            utf8str += str.charAt(i);
        }
    }
    return utf8str;
}

/**
 * 填充项目信息，并自动出勤
 * @param proId
 */
function setProductInfo(proId, rows, isSave = true) {
    $HTTP('post', 'https://mis.murongtech.com/mrmis/attProjectQuery.do',
        "search=&t=" + Date.now() + "&limit=10&offset=0&totalRows=2507&flag=1&pro_nm=" + proId,
        function (res) {
            console.log(res, "res")
            let text = res
            res = JSON.parse(text)
            let data;
            try {
                data = res.rec[0]
            } catch (e) {
                notify(`获取项目信息失败：${res.gda.msg_inf}`)
                return
            }
            if (res.rec_num == "1" || confirm("当前项目包含多个项目编号，是否选用最相近的结果：\n项目编号：" + data.pro_id + "\n项目名称：《" + data.pro_nm + "》\n项目负责人：" + data.att_man_nm)) {
                console.log(res)
                const length = rows.length;
                for (let n = 1; n <= length; n++) {
                    const row = rows[n - 1];
                    for (let key in data) {
                        eval("row." + key + "= data['" + key + "']")
                    }
                }
                refreshTable();
                if (isSave) {
                    MRCfg.proId = proId
                    saveMRCfg()
                    notify(`${proId} 项目编号已记录`);
                }
                notify(`已应用${proId}到选中行`);
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
    $.post(url, data, onSuccess);
    // GM_xmlhttpRequest({
    //     method: method,
    //     url: url,
    //     data: data,
    //     headers: {
    //         "Referer": getLocation(),
    //         'Accept-Charset': 'UTF-8',
    //         "Content-Type": "application/x-www-form-urlencoded; charset=GBK",
    //         "Cookie": document.cookie
    //     },
    //
    //     onload: onSuccess,
    //     onerror: onFailed
    // });
}

let modalCurView = ""

function customMyModelView(html, title) {
    if ($('#hoyoungModal').length == 0) {
        modalCurView = title
        let modelTemplate = '<div aria-hidden="false"aria-labelledby="myModalLabel"role="dialog"tabindex="-1"id="hoyoungModal"class="modal fade ui-draggable in"style="display: block;"><div class="modal-dialog"style="width: 600px;"><div class="portlet box blue"><div class="portlet-title"><div class="caption"><i class="icon-reorder"></i><span id="closeM">' + title + '</span></div></div><div class="portlet-body modal-body"id="mmmmodal-body">' + html + '</div></div></div></div>'
        $('body').append(modelTemplate)
        $('#hoyoungModal').hide();
        $('#hoyoungModal').modal('show');
        $('#closeM').click(() => {
            hideModal()
        })

    } else {
        // 缓存相等不修改
        if (modalCurView !== title) {
            modalCurView = title
            $('#closeM').text(title)
            $('#mmmmodal-body').html(html)
        }
        $('#hoyoungModal').modal('show');
    }

}

let getMRTable = () => {
    return $("#murong-table");
}

function initStateCount() {
    let amountADay = 60;
    let rows = getMRTable().bootstrapTable('getOptions').data;
    let date = []
    let count = 0
    let curMonth = ''
    rows.filter((val) => {
        if (curMonth === '') {
            curMonth = val.att_dt.substring(0, 6)
        }
        if (val.travel_flg === '1') {
            count += 0.5
        }
    })
    rows.filter((val) => {
        if ((val.att_typ == ON_WORK && val.hld_flg == '1')) {
            date.push(val.att_dt + ' ' + (val.att_tm === '01' ? '上午' : '下午'))
        }
    })
    let selectData = '<div class="tab-pane profile-classic row-fluid active"><ul class="unstyled span10"><li>'
    if (date.length > 0) {
        selectData += ('<span>当月休日加班天数:</span>' + date.length / 2 + '天' + '</li>')
        selectData += ('<li><span>当月休日加班明细:</span>' + date.join(' / ') + '</li>')
    } else {
        selectData += '<span>这个月没有加班哦~ 996可是打工人的福报啊</span></li>'
    }
    selectData += '<li xmlns="http://www.w3.org/1999/html"><span>当月出差天数：</span><input id="outWorkDate" type="number" value="' + count + '" />天</li>'
    let amount = amountADay * count
    selectData += `<li id="lowerAmount"><span>当月出差金额：</span> ${amountADay}元/天 * ${count}天 = ` + amount + '元</li>'
    selectData += '<li id="upperAmount"><span>当月出差金额大写：</span>' + nzhcn.toMoney(amount).replace('人民币', '') + '</li>'
    selectData += '<li><span></span></li>'
    selectData += '<li><span>不知道其他等级的差补是多少钱，用的是我的' + amountADay + '一天，有其他档位的欢迎email补充: 1187292926@qq.com</span></li>'
    selectData += '</ul></div>'
    customMyModelView(selectData, curMonth + "状态统计")

    $('#outWorkDate').change(() => {
        let amount = 80 * $('#outWorkDate').val()
        $('#upperAmount').text('当月出差金额大写：' + nzhcn.toMoney(amount).replace('人民币', ''))
        $('#lowerAmount').text('当月出差金额：80元/天 * ' + $('#outWorkDate').val() + '天 = ' + amount + '元')
    })

}

function initConditionApply() {
    // 出勤情况
    let productId = "";
    let selectData = `<div>出勤情况：<select name="chk_sts" id="hoyoung_custom_status_data" class="m-wrap span5" style="margin: 0 0px 0 1rem;padding:0;max-width: 5rem">`
    let keys = Object.keys(WORK_DICT)
    let values = Object.values(WORK_DICT)
    for (let i = 0; i < keys.length; i++) {
        selectData += `<option value=${keys[i]}>${values[i]}</option>`
    }
    selectData += `</select></div>`
    // 是否出差
    selectData += `<div>是否出差：<select name="chk_sts" id="hoyoung_custom_travel_data" class="m-wrap span5" style="margin:0 0px 0 1rem;padding:0;max-width: 5rem">`
    keys = Object.keys(TRAVEL_DICT)
    values = Object.values(TRAVEL_DICT)
    for (let i = 0; i < keys.length; i++) {
        selectData += `<option value=${keys[i]}>${values[i]}</option>`
    }
    selectData += `</select></div>`
    customMyModelView('<div style="/* display:flex; *//* justify-content: flex-start; *//* align-content: center; *//* flex-wrap: nowrap; *//* flex-direction: row; */"><div class="span3"style="width: 100%;display: flex;margin-left: 0;align-content: center;justify-content: space-between;flex-wrap: wrap;flex-direction: row;align-items: center;"><div><label class="btn green-stripe" style="margin: 0;">起始日期</label><input class="span5 m-wrap" placeholder="日期格式: YYmmdd" id="hoyoung_custom_start_date" value="' + dateFormat("YYmm", new Date()) + '01" style="margin: 0 0 0 1rem;width: fit-content;"></div>—<div><label class="btn green-stripe"style="margin: 0;">结束日期</label><input class="span5 m-wrap" placeholder="日期格式: YYmmdd" value="' + dateFormat("YYmmdd", new Date()) + '" id="hoyoung_custom_end_date" style="margin: 0 0 0 1rem;width: fit-content;"></div></div><div class="span3"style="width: 100%;padding-top: 1rem;display: flex;margin-left: 0;align-content: center;justify-content: space-between;flex-wrap: wrap;flex-direction: row;align-items: center;">' + selectData + '</div><div class="pull-right"><label for="skipHoliday"style="width: fit-content;margin-top: 2rem;margin-left: auto;"><input type="checkbox"id="skipHoliday"style="margin: 0;">&nbsp;忽略节假日</label><label for="applyProduct" style="width: fit-content;margin-left: auto;"><input type="checkbox" id="applyProduct" style="margin: 0;"><span id="apSpan">&nbsp;另设项目编号</span></label><button class="pull-right btn yellow-stripe"style=""id="hoyoung_custom_apply">应用到所选日期区间</button></div><div class="span3"style="width: 100%;padding-top: 1rem;display: flex;margin-left: 0;align-content: center;justify-content: space-between;flex-wrap: wrap;flex-direction: row;color: green;align-items: center;">*日期的填写格式为YYmmdd，即年月日，需要满足八位长度（例如2022年1月1日对应的是20220101），毋须携带横杠</div></div>', "按自选规则填充")

    $('#applyProduct').unbind().click(() => {
        if ($('#applyProduct').prop('checked')) {
            productId = prompt("输入项目编号")
            if (productId !== "" && productId !== null && productId !== undefined) {
                $('#apSpan').text(' 另设项目编号' + "(" + productId + ")")
            }
        } else {
            $('#apSpan').text(' 另设项目编号')
        }
    })

    $('#hoyoung_custom_apply').unbind().click(function () {
        let fIndex = -1;
        const table = getMRTable();
        table.bootstrapTable('uncheckAll');
        let rows = table.bootstrapTable('getOptions').data;
        const isSkipHoliday = $('#skipHoliday').prop('checked')
        let cStartDate = $('#hoyoung_custom_start_date').val()
        let cEndDate = $('#hoyoung_custom_end_date').val()
        $.each(rows, function (index, value) {
            let vDate = parseInt(value.att_dt)
            if (vDate >= cStartDate && vDate <= cEndDate) {
                // 是否跳过节假日（仅应用工作日）
                if (isSkipHoliday) {
                    // 不是工作日，当即退出
                    if (value.hld_flg !== WORK_DAY) {
                        return true;
                    }
                }
                if (fIndex === -1) fIndex = index
                value.state = true
                value.att_typ = $('#hoyoung_custom_status_data').val()
                value.travel_flg = $('#hoyoung_custom_travel_data').val()
            }
        })
        if (productId !== "" && productId !== null && productId !== undefined) {
            rows = table.bootstrapTable('getSelections');
            notify("请稍后，正在应用项目编号，禁止操作")
            setProductInfo(productId, rows, false)
        }
        hideModal()
        refreshTable()
        console.log($('tbody tr')[fIndex])
        $('tbody tr')[fIndex].scrollIntoView()
    })
}

function initSettingModal() {
    let checkedAble = MRCfg.IamBusinessTrip ? "checked" : "";
    customMyModelView('<div style="/* display:flex; *//* justify-content: flex-start; *//* align-content: center; *//* flex-wrap: nowrap; *//* flex-direction: row; */"><div class="span3"style="width: 100%;display: flex;margin-left: 0;align-content: center;justify-content: space-between;flex-wrap: wrap;flex-direction: row;align-items: center;"><label class="btn green-stripe"style="margin: 0;">修改默认加载数据的条数</label><input class="span5 m-wrap"name="hoyoung-setting"id="resetFirstLoadRows"value="' + MRCfg.resetFirstLoadRows + '"style="margin: 0 1rem 0 0;width: fit-content;"></div><div class="span3"style="width: 100%;display: flex;margin-left: 0;margin-top: 1rem;align-content: center;justify-content: space-between;flex-wrap: wrap;flex-direction: row;align-items: center;"><label class="btn blue-stripe"style="margin: 0;">脚本启动提示</label><input class="span5 m-wrap"name="hoyoung-setting"id="welcomeWords"value="' + MRCfg.welcomeWords + '"style="margin: 0 1rem 0 0;width: fit-content;"></div><div class="span3" style="width: 100%;display: flex;margin-left: 0;margin-top: 1rem;align-content: center;justify-content: space-between;flex-wrap: wrap;flex-direction: row;align-items: center;"><label class="btn blue-stripe" style="margin: 0;">出差设置</label><label for="IamBusinessTrip" style="width: fit-content;margin-left: auto;"><input type="checkbox" name="hoyoung-setting" id="IamBusinessTrip" ' + checkedAble + ' style="vertical-align: middle;margin: auto;">&nbsp;我在出差</label></div><button class="btn pull-right yellow-stripe"style="margin-top: 1rem;"id="hoyoung-save-setting">保存设置</button><div class="span3"style="width: 100%;padding-top: 1rem;display: flex;margin-left: 0;align-content: center;justify-content: space-between;flex-wrap: wrap;color: green;flex-direction: row;align-items: center;"><p style="margin: 0">* 数据默认加载条数，默认为10条，当该值被设置为0时，不再劫持默认加载条数。</p><p style="margin: 0">&nbsp;&nbsp;当脚本启动提示参数被设置为空时，启动完毕不再发出提醒。</p></div></div>', "出勤脚本设置");
    $('#hoyoung-save-setting').unbind().click(function () {
        $('input[name=hoyoung-setting]').each((i, obj) => {
            let v = getValue(obj)

            eval("MRCfg." + $(obj).attr("id") + "=" + v)
            saveMRCfg()
            hideModal()
        })
        console.log(MRCfg)
    })
}

function getValue(obj) {
    if ($(obj).attr('type') == 'checkbox') {
        return $(obj).prop("checked");
    } else {
        v = $(obj).val();
        if (parseFloat(v).toString() === 'NaN') v = "'" + v + "'";
        return v;
    }
}

function hideModal() {
    $('#hoyoungModal').modal('hide');
}

/**
 * 初始化切换账号的显示
 */
function initTableSavedUsers() {
    customMyModelView('<div style="display: flex;justify-content: space-between;flex-wrap: wrap;"><button class="btn btn-primary"id="hoyoung_set_dfl_login_user"><i class="fa fa-check-square-o"></i>默认登录用户</button><button class="btn btn-primary"id="hoyoung_login"><i class="fa fa-check-square-o"></i>Login</button><button class="btn btn-primary"id="hoyoung_del_user"><i class="fa fa-check-square-o"></i>delete</button></div><table class="murong-table table table-hover"id="hoyoung_table"data-toggle="table"data-click-to-select="true"data-show-columns="false"data-select-item-name="myRadioName"></table>', "切换登录用户")
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

    $('#hoyoung_set_dfl_login_user').unbind().click(function () {
        let result = $table.bootstrapTable('getSelections');
        if (result.length > 1) {
            notify("坑爹呢，你默认登录这么多个用户吗？")
        } else {
            for (let i = 0; i < result.length; i++) {
                MRCfg.defaultLoginUser = MRCfg.savedUsers[getIndexOfUser(result[i].username)]
                saveMRCfg()
                notify("默认账号已设置为：" + result[i].username)
            }
        }
    })
    $('#hoyoung_login').unbind().click(function () {
        let result = $table.bootstrapTable('getSelections');
        if (result.length > 1) {
            notify("坑爹呢，你默认登录这么多个用户吗？")
        } else {
            MRCfg.order = "r|https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332005#"
            saveMRCfg()
            login(result[0].username, MRCfg.savedUsers[getIndexOfUser(result[0].username)].password)
        }
    })
    $('#hoyoung_del_user').unbind().click(function () {
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
 * 导出配置文件
 * @param MY_CONFIG MY_API.CONFIG
 */
function exportConfig(MY_CONFIG) {
    const exportJson = {
        VERSION: GM_info.script.version,
        MY_CONFIG: MY_CONFIG
    };
    return downFile('MRHelper_CONFIG.json', exportJson);
}

/**
 * 导入配置文件
 */
function importConfig() {
    let selectedFile = document.getElementById("Hoyoung_config_file").files[0];
    let reader = new FileReader();
    reader.onload = function () {
        try {
            readConfigArray[0] = JSON.parse(decodeURIComponent(this.result));
            if (typeof readConfigArray[0] == 'object' && readConfigArray[0]) {
                const list = ["VERSION", "MY_CONFIG"];
                for (const i of list) {
                    if (!readConfigArray[0].hasOwnProperty(i)) return wrongFile();
                }
                return readConfigArray[1].resolve();
            } else {
                return wrongFile();
            }
        } catch (e) {
            return wrongFile();
        }
    };
    reader.readAsText(selectedFile);

    function wrongFile(msg = '文件格式错误') {
        return notify(msg);
    }
}

/**
 * 保存文件到本地
 * @param fileName 文件名
 * @param fileContent 文件内容
 */
function downFile(fileName, fileContent) {
    let elementA = document.createElement("a");
    elementA.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(fileContent))
    );
    elementA.setAttribute("download", fileName);
    elementA.style.display = "none";
    document.body.appendChild(elementA);
    elementA.click();
    document.body.removeChild(elementA);
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
    const data = getMRTable()
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
    return $(`<button class='btn btn-primary ${bColor} popovers' data-trigger='hover' data-original-title="沐融管理系统考勤助手 v0.49" data-placement='top' data-content='${btnHint}' style='margin-left: 10px' id='${id}'><i class='${custom_icon}'/> ${text}</button><span style='display: inline-block;margin: 0 2rem;border-left: 2px solid #8080805e;'>1</span>`)
}

/**
 * 欢迎
 */
function welcome() {
    if (MRCfg.welcomeWords !== "") notify(MRCfg.welcomeWords);
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
    return getLocation() == 'https://mis.murongtech.com/mrmis/' || getLocation().indexOf('https://mis.murongtech.com/mrmis/login.do') !== -1 || getLocation().indexOf('https://mis.murongtech.com/mrmis/logOut.do') !== -1
}

/**
 * 是否出勤页
 * @returns {boolean}
 */
function isChuQingPage() {
    return getLocation().indexOf("https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332005") !== -1 || getLocation().indexOf('https://mis.murongtech.com/mrmis/toMenu.do?menu_id=332015') !== -1
}

/**
 * 日期格式化
 * @param fmt
 * @param date
 * @returns {*}
 */
function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        }
        ;
    }
    ;
    return fmt;
}