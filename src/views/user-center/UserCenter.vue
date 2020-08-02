<template>
  <transition name="slide">
    <div class="user-center">

      <!-- 返回按钮 -->
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>

      <!-- 我喜欢的/最近听的 -->
      <div class="switches-wrapper">
        <switches @switch="switchItem" :switches="switches" :currentIndex="currentIndex"></switches>
      </div>

      <!-- 播放按钮 -->
      <div class="play-btn" ref="playBtn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>

      <!-- 歌曲列表 -->
      <div class="list-wrapper" ref="listWrapper">
        <!-- 我喜欢的 -->
        <scroll ref="favoriteList" class="list-scroll" v-if="currentIndex === 0" :data="favoriteList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <!-- 最近听的 -->
        <scroll ref="playList" class="list-scroll" v-if="currentIndex === 1" :data="playHistory">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>

      <!-- 没有内容的提示 -->
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
import Switches from 'components/common/switches/Switches'
import Scroll from 'components/common/scroll/Scroll'
import SongList from 'components/common/song-list/SongList'
import NoResult from 'components/common/no-result/NoResult'

import Song from 'common/js/song'
import {playlistMixin} from 'common/js/mixin'

import {mapGetters, mapActions} from 'vuex'

export default {
  mixins: [playlistMixin],
  data() {
    return {
      currentIndex: 0,
      switches: [
        {name: '我喜欢的'},
        {name: '最近听的'}
      ]
    }
  },
  components: {
    Switches,
    Scroll,
    SongList,
    NoResult
  },
  computed: {
    //是否显示no-result
    noResult() {
      if (this.currentIndex === 0) {
        return !this.favoriteList.length
      } else {
        return !this.playHistory.length
      }
    },
    //no-result的内容
    noResultDesc() {
      if (this.currentIndex === 0) {
        return '暂无收藏歌曲'
      } else {
        return '你还没有听过歌曲'
      }
    },
    ...mapGetters([
      'favoriteList',
      'playHistory'
    ])
  },
  methods: {
    //适配列表和底部小播放器
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.listWrapper.style.bottom = bottom
      this.$refs.favoriteList && this.$refs.favoriteList.refresh()
      this.$refs.playList && this.$refs.playList.refresh()
    },
    back() {
      this.$router.back()
    },
    switchItem(index) {
      this.currentIndex = index
    },
    selectSong(song) {
      //插入的是song实例化的对象
      this.insertSong(new Song(song))
    },
    //随机播放列表歌曲
    random() {
      let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
      //没有歌曲，什么都不做，直接返回
      if (list.length === 0) {
        return
      }
      //需要把list中的song变成song的实例
      list = list.map((song) => {
        return new Song(song)
      })
      this.randomPlay({list})
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ])
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>