import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,//播放器的展开和收起
  playlist: [],
  sequenceList: [],//顺序播放列表
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {}, //歌单被点击的item
  topList: {}, //排行榜被点击的item
  searchHistory: loadSearch(), //搜索历史，初始值应该从本地缓存去读取，而不是空数组；在cache中定义该方法
  playHistory: loadPlay(), //播放历史，初始值从缓存中读取
  favoriteList: loadFavorite() //收藏的列表
}

export default state
