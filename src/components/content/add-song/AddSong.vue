<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <!-- 头部 -->
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-box-wrapper">
        <search-box ref="searchBox" placeholder="搜索歌曲" @query="onQueryChange"></search-box>
      </div>

      <!-- 最近播放/搜索历史 -->
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <!-- 最近播放 -->
          <scroll ref="songList" class="list-scroll" v-if="currentIndex === 0" :data="playHistory">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <!-- 搜索历史 -->
          <scroll :refreshDelay="refreshDelay" ref="searchList" class="list-scroll" v-if="currentIndex === 1" :data="searchHistory">
            <div class="list-inner">
              <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
      </div>
    </div>

    <!-- 提示栏 -->
    <top-tip ref="topTip">
      <div class="tip-title">
        <i class="icon-ok"></i>
        <span class="text">1首歌曲已经添加到播放队列</span>
      </div>
    </top-tip>
  </transition>
</template>

<script>
import SearchBox from 'components/common/search-box/SearchBox'
import Switches from 'components/common/switches/Switches'
import Scroll from 'components/common/scroll/Scroll'
import SongList from 'components/common/song-list/SongList'
import SearchList from 'components/common/search-list/SearchList'
import TopTip from 'components/common/top-tip/TopTip'
import Suggest from 'components/content/suggest/Suggest'

import {searchMixin} from 'common/js/mixin'

import {mapGetters, mapActions} from 'vuex'

export default {
  mixins: [searchMixin],
  data() {
    return {
      showFlag: false,
      //query: '',
      showSinger: false, //这里不需要搜索歌手
      currentIndex: 0, //switches中的currentIndex
      switches: [
        {name: '最近播放'},
        {name: '搜索历史'}
      ]
    }
  },
  components: {
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopTip
  },
  computed: {
    ...mapGetters(['playHistory'])
  },
  methods: {
    show() {
      this.showFlag = true
      //每次加载显示列表的时候要刷新scroll，重新计算高度，防止不能滚动
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songList.refresh()
        } else {
          this.$refs.searchList.refresh()
        }
      }, 20)
    },
    hide() {
      this.showFlag = false;
    },
    selectSuggest() {
      this.saveSearch()
      this.showTip()
    },
    switchItem(index) {
      this.currentIndex = index
    },
    //点击最近播放的歌曲
    selectSong(song, index) {
      //如果是第一首，则是当前播放的歌曲，不需要加到播放列表
      if (index !== 0) { 
        this.insertSong(song)
      }
      this.showTip()
    },
    showTip() {
      this.$refs.topTip.show()
    },

    ...mapActions(['insertSong'])
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>