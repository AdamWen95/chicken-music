<template>
  <div class="search">
    <!-- 搜索框 -->
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <!-- 热门搜索区 没有查询字段的时候显示 -->
    <div class="shortcut-wrapper" v-show="!query">
      <div class="shortcut">
        <div class="hot-key">
          <h1 class="title">热门搜索</h1>
          <ul>
            <!-- 点击热搜词，将其填入input中 -->
            <li class="item" v-for="(item, index) in hotKey" :key="index" @click="addQuery(item.k)">
              <span>{{item.k}}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 搜索结果 有查询字段的时候显示 -->
    <div class="search-result" v-show="query">
      <suggest :query="query" @listScroll="blurInput"></suggest>
    </div>
    <!-- 二级路由 跳转到歌手/歌曲页面 -->
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from 'components/common/search-box/SearchBox'
import Suggest from 'components/content/suggest/Suggest'

import {getHotKey} from 'api/search'
import {ERR_OK} from 'api/config'

export default {
  data() {
    return {
      hotKey: [],
      query: ''
    }
  },
  created() {
    this._getHotKey()
  },
  methods: {
    //获取热搜关键词
    _getHotKey() {
      getHotKey().then((res) => {
        if (res.code === ERR_OK) {
          // console.log(res.data.hotkey)
          this.hotKey = res.data.hotkey.slice(0, 10) //截取前10个数据
        }
      })
    },
    //点击热搜词，将其填入input中（调用searchBox的方法）
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    //根据search-box传过来的query改变query的值
    onQueryChange(query) {
      this.query = query
    },
    //搜索结果开始滚动，输入框失去焦点
    blurInput() {
      this.$refs.searchBox.blur()
    }
  },
  components: {
    SearchBox,
    Suggest
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
