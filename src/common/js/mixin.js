import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

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

//player和playlist共用的mixin
export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'fullScreen',
      'playlist',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList'
    ])
  },
  methods: {
    //改变播放模式
    changeMode() {
      //只有3种状态，因此取余
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)

      //根据不同模式改变播放列表
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      //确保列表顺序改变后当前的歌曲不变
      this.resetCurrentIndex(list)
      this.setPlaylist(list)
    },
    //播放列表顺序更新后找到新列表的当前歌曲index并设置为currentIndex
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    })
  }
}

//search和addSong共用的mixin
export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    //点击热搜词，将其填入input中（调用searchBox的方法）
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },
    //根据search-box传过来的query改变query的值
    onQueryChange(query) {
      this.query = query
    },
    //搜索结果开始滚动，输入框失去焦点
    blurInput() {
      this.$refs.searchBox.blur()
    },
    //保存搜索数据
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}