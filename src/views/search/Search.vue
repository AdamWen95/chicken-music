<template>
  <div class="search">
    <!-- 搜索框 -->
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <!-- 热门搜索区 没有查询字段的时候显示 -->
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll :refreshDelay="refreshDelay" class="shortcut" :data="shortcut" ref="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <!-- 点击热搜词，将其填入input中 -->
              <li class="item" v-for="(item, index) in hotKey" :key="index" @click="addQuery(item.k)">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <!-- 搜索历史区 -->
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <!-- 搜索结果 有查询字段的时候显示 -->
    <div ref="searchResult" class="search-result" v-show="query">
      <suggest ref="suggest" :query="query" @listScroll="blurInput" @select="saveSearch"></suggest>
    </div>
    <!-- 弹窗 -->
    <confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearSearchHistory"></confirm>
    <!-- 二级路由 跳转到歌手/歌曲页面 -->
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from 'components/common/search-box/SearchBox'
import SearchList from 'components/common/search-list/SearchList'
import Confirm from 'components/common/confirm/Confirm'
import Scroll from 'components/common/scroll/Scroll'
import Suggest from 'components/content/suggest/Suggest'

import {getHotKey} from 'api/search'
import {ERR_OK} from 'api/config'

import {playlistMixin, searchMixin} from 'common/js/mixin'

import {mapActions} from 'vuex'

export default {
  mixins: [playlistMixin, searchMixin],
  data() {
    return {
      hotKey: []
      //query: ''
    }
  },
  created() {
    this._getHotKey()
  },
  computed: {
    //scroll组件根据内部的数据refresh()，但是这里有hotKey和searchHistory两个异步获取的数据，这里直接将二者拼接，任何一个改变都刷新scroll
    shortcut() {
      return this.hotKey.concat(this.searchHistory)
    }
    // ...mapGetters([
    //   'searchHistory'
    // ])
  },
  methods: {
    //有歌曲播放 改变shortcutWrapper和shortcutWrapper的高度，同时刷新scroll
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''

      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut.refresh()

      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.suggest.refresh()
    },
    //获取热搜关键词
    _getHotKey() {
      getHotKey().then((res) => {
        if (res.code === ERR_OK) {
          // console.log(res.data.hotkey)
          this.hotKey = res.data.hotkey.slice(0, 10) //截取前10个数据
        }
      })
    },
    /* 放入mixin中
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
    },
    //保存搜索数据
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    */
    //点击清空历史记录，出弹窗
    showConfirm() {
      this.$refs.confirm.show()
    },
    ...mapActions([
      //'saveSearchHistory',
      //'deleteSearchHistory',
      'clearSearchHistory'
    ])
    
  },
  watch: {
    query(newQuery) {
      if (!newQuery) {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        }, 20)
      }
    }
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
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
