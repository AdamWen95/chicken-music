/* 这个文件存放有关缓存的js */

import storage from 'good-storage'

const SEARCH_KEY = '__search__' //localStorage中的key
const SEARCH_MAX_LENGTH = 15 //最大储存条数

const PLAY_KEY = '__play__' 
const PLAY_MAX_LENGTH = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LENGTH = 200

//定义一个插入数组的函数
//arr => 要处理的数组；val => 要插入的值；compare => 比较函数(findIndex的参数是函数)；maxLen => 数组的最大长度
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if (index === 0) { //如果插入的值已经存在且在数组的头部
    return
  }
  if (index > 0) {
    //删掉已经存在的值
    arr.splice(index, 1)
  }
  //在数组头部插入val
  arr.unshift(val)
  //如果长度超过最大长度，删掉最后的元素
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

//定义一个从数组中删除元素的函数
function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

//将搜索记录添加到storage中
export function saveSearch(query) {
  //取出searches
  let searches = storage.get(SEARCH_KEY, [])
  //往searches中插入query
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  //存入storage中
  storage.set(SEARCH_KEY, searches)
  //返回新的searches
  return searches
}

//从本地缓存读取搜索历史数据
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

//从本地缓存删除记录
export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  //存入storage中
  storage.set(SEARCH_KEY, searches)
  //返回新的searches
  return searches
}

//清除所有搜索历史
export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

//将播放记录添加到storage中
export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, songs)
  return songs
}

//读取播放记录
export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

//将收藏的歌曲添加到storage中
export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

//删除收藏歌曲
export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

//读取收藏歌曲
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}