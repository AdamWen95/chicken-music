<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!-- touchstart和touchmove需要阻止默认行为，加上.prevent防止其拖动浏览器 -->
      <div class="progress-btn-wrapper" ref="progressBtn" @touchstart.prevent="progressTouchStart" @touchmove.prevent="progressTouchMove" @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {prefixStyle} from 'common/js/dom'
//按钮的宽度
const progressBtnWidth = 16
const transform = prefixStyle('transform')

export default {
  props: {
    //播放进度百分比
    percent: {
      type: Number,
      default: 0
    }
  },
  created() {
    //用于记录点击事件的一些数据
    this.touch = {}
  },
  methods: {
    progressTouchStart(e) {
      this.touch.initiated = true //touch状态初始化
      this.touch.startX = e.touches[0].pageX //初始位置的横坐标值
      this.touch.left = this.$refs.progress.clientWidth //点击时按钮已经移动的距离（左边的长度）
    },
    progressTouchMove(e) {
      //如果没有初始化（没有经过touchstart）就进入move这一步，直接return
      if (!this.touch.initiated) {
        return
      }
      const deltaX = e.touches[0].pageX - this.touch.startX //偏移距离
      //已播放距离 = start时的left+偏移距离，其值不能为负，也不能超过最大长度
      const offsetWidth = Math.min(Math.max(0, this.touch.left + deltaX), this.$refs.progressBar.clientWidth - progressBtnWidth)
      this._offset(offsetWidth)
    },
    progressTouchEnd() {
      //touch状态重置为false
      this.touch.initiated = false
      //修改percent，不然拖动结束,监听到percent的值，按钮会跳回原来的位置
      this._triggerPercent()
    },
    //进度条点击事件
    progressClick(e) {
      //如果点击到按钮上，那么offsetX很小，进度条会移动到很前面
      // this._offset(e.offsetX)

      //进度条元素的大小和相对视口的位置
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      this._triggerPercent()
    },

    //已播放进度条伸缩和按钮位置偏移
    _offset(offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
    },
    //发射percent修改事件
    _triggerPercent() {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChange', percent)
    }
  },
  watch: {
    percent(newPercent) {
      //拖动过程中，歌曲依然自动播放，二者的进度滚动有冲突，拖动的优先级更高，因此必须在这里加上this.touch.initiated = false的条件
      if (newPercent > 0 && !this.touch.initiated) {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth //进度条总长，要减去按钮的宽度
        const offsetWidth = newPercent * barWidth
        this._offset(offsetWidth)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
