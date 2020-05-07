<template>
  <div class="player" v-show="playlist.length > 0">
    <!-- 大播放器 -->
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <!-- 背景图 -->
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" alt="">
        </div>

        <!-- 顶部 -->
        <div class="top">
          <!-- 返回按钮 -->
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <!-- 歌曲和歌手名称 -->
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>

        <!-- 中部 -->
        <div class="middle">
          <div class="middle-l">
            <!-- 唱片 -->
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd">
                <img :class="cdCls" :src="currentSong.image" class="image">
              </div>
            </div>
          </div>
        </div>

        <!-- 底部 -->
        <div class="bottom">
          <!-- 操作区 -->
          <div class="operators">
            <div class="icon i-left">
              <i class="icon-sequence"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon-not-favorite"></i>
            </div>
          </div>
        </div>
    </div>
    </transition>

    <!-- 小播放器 -->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <!-- 小唱片图片 -->
        <div class="icon">
          <div class="imgWrapper">
            <img :class="cdCls" width="40" height="40" :src="currentSong.image">
          </div>
        </div>
        <!-- 歌曲和歌手名称 -->
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <!-- 播放按钮 -->
        <div class="control">
          <!-- 阻止点击事件冒泡，防止点击播放键导致播放器展开 -->
          <i :class="miniIcon" @click.stop="togglePlaying"></i>
        </div>
        <!-- 展开播放列表按钮 -->
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>

    <!-- 监听canplay：歌曲请求到了才能播放（调用ready方法修改songReady值）和error：歌曲加载发生错误 事件；歌曲ready了才能点击下一首 -->
    <audio :src="currentSong.url" ref="audio" @canplay="ready" @error="error"></audio>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
//第三方库，通过js写css3动画
import animations from 'create-keyframe-animation'

import {prefixStyle} from 'common/js/dom'

const transform = prefixStyle('transform')

export default {
  data() {
    return {
      songReady: false
    }
  },
  computed: {
    ...mapGetters([
      'fullScreen',
      'playlist',
      'currentSong',
      'playing',
      'currentIndex'
    ]),
    //播放/暂停图标
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    //唱片旋转样式
    cdCls() {
      return this.playing ? 'play' : ''
    },
    //根据songReady切换按钮是否可以点击的样式
    disableCls() {
      return this.songReady ? '' : 'disable'
    }
  },
  methods: {
    //不能直接修改store的数据，需要通过mutations的方法
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX'
    }),
    //缩小与展开播放器
    back() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },

    //唱片动画设置
    //飞入动画
    enter(el, done) {//done回调函数，结束后调用afterEnter
      const {x, y, scale} = this._getPosAndScale()
      //飞入以后放大再缩到正常大小
      let animation = {
        0: {
          transform : `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform : `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform : `translate3d(0, 0, 0) scale(1)`
        }
      }
      //注册动画
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      //运行动画
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    //离开动画
    leave(el, done) {
      //这里直接通过js写，不用create-keyframe-animation
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      //监听cdWrapper的动画完成事件，回调done -> afterLeave
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    _getPosAndScale() {
      //小唱片的位置和大小
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      //大唱片的位置和大小
      const paddingTop = 80
      const width = window.innerWidth * 0.8 //屏幕宽度的80%
      //缩放比例
      const scale = targetWidth / width
      //移动距离
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width/2 - paddingBottom

      return {
        x,
        y,
        scale
      }
    },
    //播放/暂停
    togglePlaying() {
      //如果没有ready，则无法切换
      if (!this.songReady) {
        return
      }

      this.setPlayingState(!this.playing)
    },
    //下一首
    next() {
      //如果没有ready，无法点击进入下一首
      if (!this.songReady) {
        return
      }

      let index = this.currentIndex + 1
      //最后一首的情况->回到开头
      if (index === this.playlist.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      //暂停情况下，切到下一首歌变为播放状态
      if (!this.playing) {
        this.togglePlaying()
      }

      //点击完重置songReady
      this.songReady = false
    },
    //前一首
    prev() {
      if (!this.songReady) {
        return
      }

      let index = this.currentIndex - 1
      if (index === -1) {
        //第一首的情况
        index = this.playlist.length - 1
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }

      this.songReady = false
    },
    ready() {
      this.songReady = true
    },
    //如果网络错误或者url有问题，会导致下一首、播放按钮等点击事件无法进行切歌，因此在error发生的时候也将songReady设为true
    error() {
      this.songReady = true
    }
  },
  watch: {
    //监听currentSong改变->播放歌曲
    currentSong() {
      //需要加一个延时，确保dom渲染后再播放
      this.$nextTick(() => {
        this.$refs.audio.play()
      })
    },
    //监听playing的改变->控制播放和暂停
    playing(newPlaying) {
      const audio = this.$refs.audio
      //需要加一个延时，确保dom渲染后再播放；点击某首歌曲的时候通过actions将state中的playing状态改为true了
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              .play
                animation: rotate 20s linear infinite
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  // 旋转动画的定义
  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
