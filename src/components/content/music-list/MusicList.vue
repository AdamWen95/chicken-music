<template>
  <div class="music-list">
    <!-- 返回按钮 -->
    <div class="back">
      <i class="icon-back"></i>
    </div>
    <!-- 歌手名字 -->
    <h1 class="title" v-html="title"></h1>
    <!-- 背景图片 -->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="filter"></div>
    </div>
    <!-- 歌曲列表 为了正确计算scroll的高度，也把songs作为data传进去-->
    <!-- bg-layer背景层随着列表向上滚动，使列表在屏幕中的显示区域变大 -->
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs"></song-list>
      </div>
    </scroll>
  </div>
</template>

<script>
import Scroll from 'components/common/scroll/Scroll'
import SongList from 'components/common/song-list/SongList'

//背景层滚动到最上方后预留的高度
const RESERVED_HEIGHT = 40

export default {
  components: {
    Scroll,
    SongList
  },
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default() {
        return []
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      scrollY: 0
    }
  },
  computed: {
    //背景图片
    bgStyle() {
      return `background-image: url(${this.bgImage})`
    }
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
  },
  mounted() {
    this.imageHeight = this.$refs.bgImage.clientHeight
    //bg-layer层的最大滚动距离
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    //歌单列表距离顶部的距离设置为背景图片的高度
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  methods: {
    scroll(pos) {
      this.scrollY = pos.y
    }
  },
  watch: {
    scrollY(newY) {
      //translateY的滚动距离，最远滚至minTranslateY位置
      let translateY = Math.max(this.minTranslateY, newY)

      let zIndex = 0
      this.$refs.layer.style['transform'] = `translate3d(0, ${translateY}px, 0)`
      this.$refs.layer.style['webkitTransform'] = `translate3d(0, ${translateY}px, 0)`

      //当滚到顶部之后，改变背景图片的大小和z-index
      if (newY < this.minTranslateY) {
        zIndex = 10
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
      } else {
        //在没有到达顶部的情况下重置回原来的样式
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = 0
      }
      this.$refs.bgImage.style.zIndex = zIndex
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
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
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      // 控制宽高比为10:7
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
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
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: absolute
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      // overflow hidden
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
