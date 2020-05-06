//给元素添加class的方法
export function addClass(el, className) {
    // if (hasClass(el, className)) {
    //     return
    // }
    // let newClass = el.className.split(' ');
    // newClass.push(className);
    // el.className = newClass.join(' ')
    el.classList.add(className)
}


//检查元素是否已有该class的方法
export function hasClass(el, className) {
    // let reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
    // rerurn reg.test(el.className)
    return el.classList.contains(className)
}

//获取el的data-...的属性
export function getData(el, name, val) {
    const prefix = 'data-';
    name = prefix + name;
    if (val) {
        return el.setAttribute(name, val)
    } else {
        return el.getAttribute(name)
    }
}


//考虑兼容性，给style按照各个浏览器的内核加前缀
let elementStyle = document.createElement('div').style
//立即执行函数
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  //返回前缀名称
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  return false
})()

export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }
  //前缀+style的首字母大写+后续的字母
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
