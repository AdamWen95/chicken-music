import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import FastClick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'

import 'common/stylus/index.styl'

//解决移动端点击事件300ms延迟
FastClick.attach(document.body)
    //图片懒加载
Vue.use(VueLazyLoad, {
    loading: require('common/image/default.png')
})

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')