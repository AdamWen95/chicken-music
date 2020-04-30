<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in dots" :key="index" :class="{active: currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import {addClass} from 'common/js/dom'

export default {
  data() {
    return {
      slider: null,
      dots: [],
      currentPageIndex: 0
    }
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  mounted() {
    //浏览器的刷新间隔是20毫秒
    setTimeout(() => {
      this._setSliderWidth();
      this._initDots();
      this._initSlider();
      if (this.autoPlay) {
        this._play()
      }
    }, 20)

    //监听视窗尺寸的改变，因为视窗改变会导致轮播图错位
    window.addEventListener('resize', () => {
      //如果这时没有加载slider，那么什么都不做，直接return
      if(!this.slider) {
        return
      }
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        //如果图片正在滚动中
        if (this.slider.isInTransition) {
          this._onScrollEnd()
        } else {
          if (this.autoPlay) {
            this._play()
          }
        }
        this._refresh()
      }, 60)
    })
  },
  methods: {
    //获取轮播图组件的宽度
    _setSliderWidth(isResize) {
      this.children  = this.$refs.sliderGroup.children;
      let width = 0;
      let sliderWidth = this.$refs.slider.clientWidth;
      for(let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        //给每一个子元素添加一个'slider-item'的class
        addClass(child, 'slider-item');
        //每个图片的宽度为父容器的宽度，slider的总宽度为每个图片宽度的累加
        child.style.width = sliderWidth + 'px';
        width += sliderWidth;

        //如果是因为resize而调用这个函数，则不需要再加上2*sliderWidth
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      }
    },
    //初始化dots
    _initDots() {
      this.dots = new Array(this.children.length)
    },
    //初始化轮播图
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: {
          loop: this.loop,
          threshold: 0.3,
          speed: 400
        }
      })

      this.slider.on('scrollEnd', () => {
        this._onScrollEnd()
      });

      this.slider.on('touchend', () => {
        if (this.autoPlay) {
          this._play()
        }
      })

      this.slider.on('beforeScrollStart', () => {
        if (this.autoPlay) {
          clearTimeout(this.timer)
        }
      })
    },

    _refresh() {
      if (this.slider) {
        //重新获取宽度，再刷新
        this._setSliderWidth(true);
        this.slider.refresh()
      }
    },

    //每次滚动结束调用的函数
    _onScrollEnd() {
      //获取当前滚动到的元素索引赋值给currentPageIndex
      let pageIndex = this.slider.getCurrentPage().pageX;
      this.currentPageIndex = pageIndex;
      //自动播放下一张
      if (this.autoPlay) {
        this._play()
      }
    },
    //需要自动播放时调用的函数
    _play() {
      clearTimeout(this.timer);
      // let pageIndex = this.currentPageIndex + 1;
      // if (this.loop) {
      //   pageIndex -= 1
      // }
      //直接调用better-scroll的接口goToPage定位到目标页
      this.timer = setTimeout(() => {
        //第二个参数0代表y方向
        // this.slider.goToPage(pageIndex, 0, 400)
        this.slider.next()
      }, this.interval)
    }
  },
  //页面销毁的时候清理定时器
  destroyed() {
    clearTimeout(this.timer)
  }
}
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      transform: translateZ(1px)
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
