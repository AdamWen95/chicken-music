<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/content/music-list/MusicList'

import {getSongList} from 'api/recommend'
import {ERR_OK} from 'api/config'

import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'

import {mapGetters} from 'vuex'

export default {
  components: {
    MusicList
  },
  computed: {
    ...mapGetters([
      'disc'
    ]),

    //music-list的标题和背景图片
    title() {
      return this.disc.dissname
    },
    bgImage() {
      return this.disc.imgurl
    }
  },
  data() {
    return {
      songs: []
    }
  },
  created() {
    this._getSongList()
  },
  methods: {
    //请求歌曲列表
    _getSongList() {
      //在详情页面刷新会回退到父级路由
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      getSongList(this.disc.dissid).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    //格式化歌曲列表数据
    _normalizeSongs(list) {
      let ret = []
      list.forEach((musicData) => {
        if (isValidMusic(musicData)) {
          //和歌手的歌曲数据格式相同，这里可以调用common/js/song中的方法
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  }
}
</script>

<style lang="stylus" scoped>
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
