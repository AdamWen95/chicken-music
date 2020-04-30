import originJSONP from 'jsonp'

//将url和data拆开
export default function jsonp(url, data, option) {
    //url中是否已经有?，如果有，则拼接&；如果没有，则拼接?
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

    return new Promise((resolve, reject) => {
        originJSONP(url, option, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}

// 拼接data的函数
function param(data) {
    let url = '';
    for (let k in data) {
        let value = data[k] !== undefined ? data[k] : '';
        url += `&${k}=${encodeURIComponent(value)}`
    }
    //如果不为空，那么把第一个"&"去掉
    return url ? url.substring(1) : ''
}