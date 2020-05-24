import {playMode} from 'common/js/config'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,//播放器的展开和收起
  playlist: [],
  sequenceList: [],//顺序播放列表
  mode: playMode.sequence,
  currentIndex: -1,

  disc: {}, //歌单被点击的item

  topList: {} //排行榜被点击的item
}

export default state
