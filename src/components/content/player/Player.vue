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
        <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
          <!-- 唱片 -->
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd">
                <img :class="cdCls" :src="currentSong.image" class="image">
              </div>
            </div>
            <!-- 播放时展示在cd下的一行歌词 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>

          <!-- 歌词页 -->
          <!-- 在有数据的情况下才传递数据到scroll组件 -->
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <!-- currentLineNum和索引相同时高亮当前行歌词 -->
                <p ref="lyricLine" class="text" v-for="(line, index) in currentLyric.lines" :key="index"
                :class="{'current': currentLineNum === index}">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>

        <!-- 底部 -->
        <div class="bottom">
          <!-- cd、歌词切换小点 -->
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <!-- 进度条 -->
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <!-- 操作区 -->
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
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
              <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
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
          <!-- 传入半径的值32 -->
          <progress-circle :radius="radius" :percent="percent">
            <!-- 阻止点击事件冒泡，防止点击播放键导致播放器展开 -->
            <i :class="miniIcon" class="icon-mini" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <!-- 展开播放列表按钮 .stop防止其冒泡到父容器（父容器也有click事件=>打开大播放器）-->
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>

    <!-- 播放列表 -->
    <playlist ref="playlist"></playlist>

    <!-- 监听canplay：歌曲请求到了才能播放（调用ready方法修改songReady值）和error：歌曲加载发生错误 事件；歌曲ready了才能点击下一首 -->
    <!-- timeupdate：播放器播放时间更新事件 -->
    <audio :src="currentSong.url" ref="audio" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script>
import ProgressBar from 'components/common/progress-bar/ProgressBar'
import ProgressCircle from 'components/common/progress-circle/ProgressCircle'
import Scroll from 'components/common/scroll/Scroll'
import Playlist from 'components/content/playlist/Playlist'

import {mapGetters, mapMutations, mapActions} from 'vuex'
//第三方库，通过js写css3动画
import animations from 'create-keyframe-animation'
//第三方库，解析歌词字符串
import Lyric from 'lyric-parser'

import {prefixStyle} from 'common/js/dom'
import {playMode} from 'common/js/config'
//import {shuffle} from 'common/js/util'
import {playerMixin} from 'common/js/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
  mixins: [playerMixin],
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  },
  data() {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      //当前播放到的歌词行
      currentLineNum: 0,
      //展示的是cd页还是歌词页
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  computed: {
    ...mapGetters([
      'fullScreen',
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
    //播放模式的图标切换
    // iconMode() {
    //   return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    // },

    //唱片旋转样式
    cdCls() {
      return this.playing ? 'play' : ''
    },
    //根据songReady切换按钮是否可以点击的样式
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    //播放百分比
    percent() {
      return this.currentTime / this.currentSong.duration
    }
  },
  created() {
    this.touch = {}
  },
  methods: {
    //不能直接修改store的数据，需要通过mutations的方法
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      
    }),
    ...mapActions(['savePlayHistory']),

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

      //歌词也需要暂停/播放
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    //歌曲播放结束
    end() {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    //循环播放
    loop() {
      //将歌曲进度重置为0
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      //歌曲回到开头，歌词也需要回到0位置，这里调用了seek方法
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    //下一首
    next() {
      //如果没有ready，无法点击进入下一首
      if (!this.songReady) {
        return
      }

      if (this.playlist.length === 1) {
        //如果列表里面只有一首歌曲，直接调用循环，否则currentSong不改变，后面的逻辑不会执行
        this.loop()
      } else {
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
      }

      //点击完重置songReady
      this.songReady = false
    },
    //前一首
    prev() {
      if (!this.songReady) {
        return
      }

      if (this.playlist.length === 1) {
        //如果列表里面只有一首歌曲，直接调用循环，否则currentSong不改变，后面的逻辑不会执行
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          //第一首的情况
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }

      this.songReady = false
    },
    ready() {
      this.songReady = true
      //保存播放历史
      this.savePlayHistory(this.currentSong)
    },
    //如果网络错误或者url有问题，会导致下一首、播放按钮等点击事件无法进行切歌，因此在error发生的时候也将songReady设为true
    error() {
      this.songReady = true
    },

    updateTime(e) {
      //audio的当前播放时间赋值给currentTime
      this.currentTime = e.target.currentTime
    },
    //播放时间格式化
    format(interval) {
      interval = interval | 0 //取整
      const minute = interval / 60 | 0 //分
      const second = this._pad(interval % 60) //秒
      return `${minute}:${second}`
    },
    //根据进度条组件发射的percent修改事件来改变播放进度
    onProgressBarChange(percent) {
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = currentTime
      //如果是暂停状态，则拖动完毕开始播放
      if (!this.playing) {
        this.togglePlaying()
      }
      //歌词根据进度条的拖动移动到相应的位置（单位是ms）
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    /*这部分放入mixin中

    //改变播放模式
    changeMode() {
      //只有3种状态，因此取余
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)

      //根据不同模式改变播放列表
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      //确保列表顺序改变后当前的歌曲不变
      this.resetCurrentIndex(list)
      this.setPlaylist(list)
    },
    //播放列表顺序更新后找到新列表的当前歌曲index并设置为currentIndex
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    */

    //请求歌词
    getLyric() {
      //调用歌曲对象中的请求歌词的方法
      this.currentSong.getLyric().then((lyric) => {
        //解析歌词
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => {
        //歌词获取失败的情况
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    //歌词每一行发生改变的时候回调的函数
    handleLyric({lineNum, txt}) {
      //当前播放的那行歌词
      this.currentLineNum = lineNum
      //当播放到超过5行的时候，滚动到当前行-5的元素位置，保证当前行在屏幕中间
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        //否则滚动到顶部
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      //将当前行的歌词内容赋值给playingLyric
      this.playingLyric = txt
    },
    middleTouchStart(e) {
      //初始化
      this.touch.initiated = true
      //第一根手指
      const touch = e.touches[0]
      //开始触碰时x y坐标
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    //拖动歌词页
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      //如果纵向的滚动距离大于横向的，那么什么都不发生，只支持横向滚动
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      //歌词页的左边距离屏幕右边的距离
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      //歌词页移动的距离left + deltaX，最大值0，最小值-window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      //歌词页在手指接触下拖动的距离占整个屏幕宽度的比例
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)

      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      //cd页的透明度，和percent负相关
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd() {
      let offsetWidth
      let opacity
      if (this.currentShow === 'cd') {
        //拖动超过10%，则滑动到歌词页面（cd页面透明度为0），否则回到原页面
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          opacity = 1
          this.currentShow = 'cd'
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }

      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      //设置一个移动的动画时长
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`

      //cd页的透明度
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    },

    //展开播放列表
    showPlaylist() {
      this.$refs.playlist.show()
    },

    //数字补位，默认是2位
    _pad(num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    }
  },
  watch: {
    //监听currentSong改变->播放歌曲
    currentSong(newSong, oldSong) {
      //如果删除掉最后一首，那么newSong为undefined，不需要向下进行，会报错
      if (!newSong.id) {
        return
      }

      //在暂停时切换播放模式，歌曲id不变，不让其自动播放
      if (newSong.id === oldSong.id) {
        return
      }

      //清除定时器
      if (this.currentLyric) {
        this.currentLyric.stop()
      }

      //需要加一个延时，确保dom渲染后再播放
      //采用1000ms延迟，确保手机从后台切到前台歌曲能继续播放
      setTimeout(() => {
        this.$refs.audio.play()
        //请求歌词
        this.getLyric()
      }, 1000)
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
