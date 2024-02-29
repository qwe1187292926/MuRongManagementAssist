console.log("Moodji脚本被执行")
var body = $response.body;
var url = $request.url;
var obj = JSON.parse(body);
console.log("Moodji脚本的请求体：", JSON.stringify($request))
console.log("Moodji脚本的响应体：", JSON.stringify($response))
const skinList = [{
    "seed": "",
    "count": 1,
    "productId": "dog",
    "type": 2,
    "expireTime": 2524607999
}, {
    "seed": "",
    "count": 1,
    "productId": "capybara",
    "type": 2,
    "expireTime": 2524607999
}, {
    "seed": "",
    "count": 1,
    "productId": "dragon",
    "type": 2,
    "expireTime": 2524607999
}]

obj.products = skinList;

body = JSON.stringify(obj);
$done({body});