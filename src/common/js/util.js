//生成min和max之间的随机整数
function getRandomInt(min, max) {
  //+1为了能取到上限值
  return Math.floor(Math.random() * (max - min + 1) + min)
}

//洗牌函数，用于打乱歌单
export function shuffle(arr) {
  //生成一个arr的副本，避免影响原来的列表
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let temp = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = temp
  }
  return _arr
}

//防抖
export function debounce(func, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}