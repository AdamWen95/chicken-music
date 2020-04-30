<template>
  <div id="app">
    <!-- 头部 -->
    <chicken-header></chicken-header>
    <!-- 标签导航栏 -->
    <tab-bar></tab-bar>
    <!-- 主页面-路由跳转 -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
import ChickenHeader from 'components/content/header/Header'
import TabBar from 'components/content/tab-bar/TabBar'

export default {
  name: "app",
  components: {
    ChickenHeader,
    TabBar
  }
}
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
</style>


