import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

//找到列表中某歌曲的索引
function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

//选择播放
export const selectPlay = function({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  //如果是随机模式下点击歌曲
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

//随机播放
export const randomPlay = function({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  //产生随机列表
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

//搜索结果中点击歌曲
export const insertSong = function({commit, state}, song) {
  //通过.slice()产生列表的副本，使playlist和sequenceList的操作不会直接修改store中的state；而数值类型的currentIndex没关系
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  //记录当前歌曲
  let currentSong = playlist[currentIndex]
  //在播放列表中查找点击的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  //因为是插入歌曲，所以索引+1
  currentIndex++
  //插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  //如果列表之前已经包含了这首歌
  if (fpIndex > -1) {
    //如果当前插入的索引大于列表中原歌曲的索引
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      //如果当前插入的索引小于等于列表中原歌曲的索引
      playlist.splice(fpIndex + 1, 1)
    }
  }

  //顺序列表
  //获得要插入的位置
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentIndex, 0, song)
  if (fsIndex > -1) {
    if (currentIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
