import * as types from './mutation-types'

const mutations = {
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  },
  [types.SET_PLAYING_STATE] (state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN] (state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST] (state, list) {
    state.playlist = list
  },
  [types.SET_SEQUENCE_LIST] (state, list) {
    state.sequenceList = list
  },
  [types.SET_PLAY_MODE] (state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX] (state, index) {
    state.currentIndex = index
  },
  //添加被点击的歌单item
  [types.SET_DISC] (state, disc) {
    state.disc = disc
  },
  //添加被点击的排行榜item
  [types.SET_TOP_LIST] (state, topList) {
    state.topList = topList
  },
  //添加搜索历史
  [types.SET_SEARCH_HISTORY] (state, history) {
    state.searchHistory = history
  }
}

export default mutations
