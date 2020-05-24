<template>
  <div class="recommend" ref="recommend">
    <!-- 传入discList，因为数据的请求是异步操作，更新数据后scroll内部会刷新高度，防止滚动异常 -->
    <scroll class="recommend-content" :data="discList" ref="scroll">
      <div>
        <!-- 当recommends的数据请求到之后，轮播图组件才被渲染；不然会出现里面的slot还没有数据传入，却在mounted阶段调用了_setSliderWidth() -->
        <div v-if="recommends.length" class="slider-wrapper">
          <div class="slider-content">
            <slider>
              <div v-for="(item, index) in recommends" :key="index">
                <a :href="item.linkUrl">
                  <!-- 图片加载完以后做刷新，防止scroll高度计算不对 -->
                  <img @load="imgLoad" :src="item.picUrl" alt="">
                </a>
              </div>
            </slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="(item, index) in discList" :key="index" class="item" @click="selectItem(item)">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl" alt="">
              </div>
              <div class="text">
                <!-- 名称和描述中有转义字符，因此不能直接写在标签内，需要通过v-html -->
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 在歌单数据还没有获取到的时候才显示loading -->
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>

    <!-- 歌单详情页-路由占位 -->
    <router-view></router-view>
  </div>
</template>

<script>
import Slider from 'components/common/slider/Slider'
import Scroll from 'components/common/scroll/Scroll'
import Loading from 'components/common/loading/Loading'

import {getRecommend, getDiscList} from 'api/recommend'
import {ERR_OK} from 'api/config'

import {playlistMixin} from 'common/js/mixin'

import {mapMutations} from 'vuex'

export default {
  mixins: [playlistMixin],
  data() {
    return {
      // 轮播图数据
      recommends: [],
      discList: []
    }
  },
  components: {
    Slider,
    Scroll,
    Loading
  },
  created() {
    this._getRecommend();
    this._getDiscList()
  },
  methods: {
    ...mapMutations({
      setDisc: 'SET_DISC'
    }),

    //根据底部小播放器的高度，重新定义recommend的高度，并刷新scroll的高度，避免其底部被遮住
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },

    //点击列表item跳转歌单详情页
    selectItem(item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      this.setDisc(item)
    },

    //获取轮播图数据
    _getRecommend() {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          // console.log(res.data.slider)
          this.recommends = res.data.slider
        }
      })
    },
    //获取歌单数据
    _getDiscList() {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          // console.log(res)
          this.discList = res.data.list
        }
      })
    },
    imgLoad() {
      //checkLoaded防止图片加载完的刷新多次调用
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh();
        this.checkLoaded = true
      }

    }
  }
}
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
@import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        height: 0
        padding-top: 40%
        overflow: hidden
        .slider-content
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 100%
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
