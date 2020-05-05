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
    <!-- 播放器 -->
    <player></player>
  </div>
</template>

<script>
import ChickenHeader from 'components/content/header/Header'
import TabBar from 'components/content/tab-bar/TabBar'
import Player from 'components/content/player/Player'

export default {
  name: "app",
  components: {
    ChickenHeader,
    TabBar,
    Player
  }
}
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
</style>


