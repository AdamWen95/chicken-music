<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/content/music-list/MusicList'

import {getMusicList} from 'api/rank'
import {ERR_OK} from 'api/config'

import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'

import {mapGetters} from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'topList'
    ]),
    title() {
      return this.topList.topTitle
    },
    bgImage() {
      //背景图采用第一首歌的图片
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    }
  },
  components: {
    MusicList
  },
  data() {
    return {
      songs: [],
      rank: true //为musicList传值，为排行榜样式
    }
  },
  created() {
    this._getMusicList()
  },
  methods: {
    _getMusicList() {
      //在此页面刷新，回退到父级路由
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }
      getMusicList(this.topList.id).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.songlist)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    //格式化歌单数据
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        const musicData = item.data
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
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
