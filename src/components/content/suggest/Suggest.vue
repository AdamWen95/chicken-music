<template>
  <scroll class="suggest" :data="result" :pullup="pullup" :beforeScroll="beforeScroll" @scrollToEnd="searchMore" ref="suggest" @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="(item, index) in result" :key="index">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>

    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'components/common/scroll/Scroll'
import Loading from 'components/common/loading/Loading'
import NoResult from 'components/common/no-result/NoResult'

import {search} from 'api/search'
import {ERR_OK} from 'api/config'

import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'
import Singer from 'common/js/singer'

import {mapMutations, mapActions} from 'vuex'

const TYPE_SINGER = 'singer'
const perpage = 20

export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    //是否展示歌手数据
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      result: [], //搜索结果数据
      pullup: true, //上拉加载更多
      hasMore: true, //是否有更多数据
      beforeScroll: true //监听滚动开始
    }
  },
  methods: {
    search() {
      //新query的搜索为第一次搜索，需要将页面置为1，并将scroll组件滚动到顶部
      this.page = 1
      this.$refs.suggest.scrollTo(0, 0)
      this.hasMore = true
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          //给result赋值的是格式化后的数据，修改后的版本是异步任务，_genResult返回promise对象
          this._genResult(res.data).then((result) => {
            this.result = result
            setTimeout(() => {
              this._checkMore(res.data)
            }, 20)
          })
        }
      })
    },
    //上拉加载更多
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          //将新的数据拼接到之前的result之后
          //修改后的版本 此步骤是个异步任务 _genResult的返回结果是一个promise对象
          this._genResult(res.data).then((result) => {
            this.result = this.result.concat(result)
            setTimeout(() => {
              this._checkMore(res.data)
            }, 20)
          })
        }
      })
    },
    //item的图标（歌手/歌曲）
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    //item的文本内容
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    selectItem(item) {
      //如果点击的是歌手item
      if (item.type === TYPE_SINGER) {
        //根据Singer类创建歌手实例
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        //通过mutations向vuex中setSinger
        this.setSinger(singer)
      } else {
        //如果点击的是歌曲，通过actions来向vuex中添加歌曲
        this.insertSong(item)
      }
    },
    //列表开始滚动，发射事件给search组件，以隐藏手机键盘（输入框blur）
    listScroll() {
      this.$emit('listScroll')
    },
    //格式化搜索结果数据
    _genResult(data) {
      let ret = []
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        ret.push({...data.zhida, ...{type: TYPE_SINGER}}) //type用来区分该条数据是歌手还是歌曲
      }
      return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
        ret = ret.concat(songs)
        return ret
      })
    },
    //格式化歌曲列表数据
    _normalizeSongs(list) {
      let ret = []
      list.forEach((musicData) => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    //检查是否有更多数据
    _checkMore(data) {
      const song = data.song
      if (!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
        this.hasMore = false
      }
    },

    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    //监听query的变化，根据其变化来请求搜索数据
    query() {
      this.search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>