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
