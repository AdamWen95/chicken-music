import {mapGetters} from 'vuex'

//适配列表和底部的小播放器，使列表的scroll高度减去底部播放器的高度
export const playlistMixin = {
  computed: {
    ...mapGetters(['playlist'])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    //这个方法需要在各个组件里面具体定义，如果组件内没有定义，那么会调用mixin中的handlePlaylist方法，抛出error
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}
