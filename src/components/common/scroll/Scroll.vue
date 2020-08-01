<template>
  <div class="wrapper" ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'

export default {
  data() {
    return {
      scroll: null
    }
  },
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: []
    },
    //是否监听scroll的滚动
    listenScroll: {
      type: Boolean,
      default: false
    },
    //是否能上拉加载更多
    pullup: {
      type: Boolean,
      default: false
    },
    //是否监听滚动开始事件
    beforeScroll: {
      type: Boolean,
      default: false
    },
    //刷新延迟
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  mounted() {
    //确保dom渲染后初始化scroll
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  methods: {
    _initScroll() {
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })

      if (this.listenScroll) {
        //better-scroll内部的this指向better-scroll的对象，在其外部定义me指向vue实例，然后在内部通过me调用$emit方法
        let me = this
        this.scroll.on('scroll', (pos) => {
          me.$emit('scroll', pos)
        })
      }

      if (this.pullup) {
        //每次滚动结束
        this.scroll.on('scrollEnd', () => {
          //当scroll快滚动到底部了
          if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
            this.$emit('scrollToEnd')
          }
        })
      }

      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },

    //这些方法调用的时候需要确保scroll已经被创建
    enable() {
      this.scroll && this.scroll.enable()
    },
    disable() {
      this.scroll && this.scroll.disable()
    },
    refresh() {
      this.scroll && this.scroll.refresh()
    },
    scrollTo() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  },
  //数据变化，刷新scroll
  watch: {
    data() {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  }
}
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">

</style>
