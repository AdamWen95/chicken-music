<template>
  <scroll class="listview" :data="data" ref="listview" :listenScroll="listenScroll" @scroll="scroll" :probeType="probeType">
    <!-- 歌手列表 -->
    <ul>
      <li v-for="(group, index) in data" :key="index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li v-for="(item, index) in group.items" :key="index" class="list-group-item" @click="selectItem(item)">
            <img class="avatar" v-lazy="item.avatar" alt="">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 右侧快速入口 -->
    <!-- 快速入口的touchmove事件要阻止其冒泡，因为整个歌手列表也是会滚动的 -->
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <!-- 给事件对象添加data-index属性 -->
        <li v-for="(item, index) in shortcutList" :key="index" class="item" :data-index="index" :class="{'current': currentIndex === index}">
          {{item}}
        </li>
      </ul>
    </div>
    <!-- title吸顶 -->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <!-- 数据还没加载的时候展示loading组件 -->
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'components/common/scroll/Scroll'
import Loading from 'components/common/loading/Loading'

import {getData} from 'common/js/dom'

//快速入口每个元素的高度
const ANCHOR_HEIGHT = 18
//title的高度
const TITLE_HEIGHT = 30

export default {
  created() {
    //定义一个touch变量来储存触摸的位置信息，不需要双向绑定，因此不在data里面定义
    this.touch = {}
    this.listenScroll = true
    //初始化列表group的高度
    this.listHeight = []
    this.probeType = 3
  },
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      //diff：group的上限和已滚动距离的差值
      diff: -1
    }
  },
  components: {
    Scroll,
    Loading
  },
  computed: {
    //每个group的title取第一个字形成新的数组
    shortcutList() {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle() {
      //顶部往下拉的时候，不要显示两个“推荐”
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  watch: {
    //data一旦变化，重新计算列表group的高度
    data() {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    //监听滚动位置
    scrollY(newY) {
      const listHeight = this.listHeight
      //滚动到顶部
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      //在中间部分滚动
      //注意listHeight的元素个数比group个数多1个
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i+1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          //此处计算得到diff
          this.diff = height2 + newY
          return
        }
      }
      //滚动到底部，且-newY > 最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    },
    //下面的title顶起上面的title
    diff(newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      //减少dom操作，如果相等则直接return，不必操作
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  methods: {
    selectItem(item) {
      this.$emit('select', item)
    },
    //快速入口的触摸点击事件
    onShortcutTouchStart(e) {
      //获取事件对象的data-index属性值
      let anchorIndex = getData(e.target, 'index')
      //只计算第一根触碰的手指
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      //记录一开始点击的锚点的索引
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    //快速入口的触摸滑动事件
    onShortcutTouchMove(e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      //得到touchstart和移动后的距离的差值
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      //一开始触摸的锚点位置+差值就是移动的距离(锚点个数)；注意把锚点的值变成Number类型
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    //封装滚动到指定锚点（索引）的元素的方法
    _scrollTo(index) {
      //点击快速入口的事件是绑定在整个div上的，因此上下两块多出来的内容也会监听到点击事件，这两块的data-index为null
      if (!index && index !== 0) {
        return
      }
      //快速入口的touchmove中可能会移动超过上下限
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      //通过触摸右侧快速入口的滚动也需要给scrollY赋值，不然不会高亮当前的title
      this.scrollY = -this.listHeight[index]
      //第二个参数0是滚动动画的时间
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    scroll(pos) {
      this.scrollY = pos.y
    },
    //计算每个group的高度
    //注意listHeight的元素个数比group个数多1个
    _calculateHeight() {
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let item of list) {
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    //给list-view也向外暴露一个内部scroll组件的refresh方法，方便父组件调用
    refresh() {
      this.$refs.listview.refresh()
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
