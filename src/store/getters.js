export const singer = state => state.singer
export const playing = state => state.playing
export const fullScreen = state => state.fullScreen
export const playlist = state => state.playlist
export const sequenceList = state => state.sequenceList
export const mode = state => state.mode
export const currentIndex = state => state.currentIndex
//当前歌曲
export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {}
}
//歌单数据
export const disc = state => state.disc
//排行榜数据
export const topList = state => state.topList
//搜索历史数据
export const searchHistory = state => state.searchHistory
//播放历史数据
export const playHistory = state => state.playHistory
//收藏歌曲列表
export const favoriteList = state => state.favoriteList
