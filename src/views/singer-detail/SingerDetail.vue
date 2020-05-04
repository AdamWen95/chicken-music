<template>
  <transition appear name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import {mapGetters} from 'vuex'

import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'api/config'

import {createSong, processSongsUrl, isValidMusic} from 'common/js/song'

import MusicList from 'components/content/music-list/MusicList'

export default {
  data() {
    return {
      songs: []
    }
  },
  components: {
    MusicList
  },
  computed: {
    //歌手的名字
    title() {
      return this.singer.name
    },
    //歌手的图片
    bgImage() {
      return this.singer.avatar
    },
    //映射vuex的getters
    ...mapGetters([
      'singer'
    ])
  },
  created() {
    this._getDetail()
    // console.log(this.singer)
  },
  methods: {
    _getDetail() {
      //在详情页没有数据的情况下刷新页面，强制回到singer页面
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    //格式化详情的歌曲列表数据；过滤掉付费歌曲
    _normalizeSongs (list) {
      let ret = []
      list.forEach((item) => {
        let { musicData } = item
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  // 页面加载和离开的过场动画
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
