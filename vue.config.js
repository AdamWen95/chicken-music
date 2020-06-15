const path = require('path')
const bodyParser = require('body-parser')
const axios = require('axios')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  //别名配置
  configureWebpack: {
    resolve: {
      alias: {
        'assets': '@/assets',
        'common': '@/common',
        'components': '@/components',
        'views': '@/views',
        'api': '@/api'
      }
    }
  },

  devServer: {
        before(app) {
            /*对从QQ官网获取的接口数据做了处理，
            拼接出轮播图需要的图片 url 和链接跳转的 url，
            其中链接跳转 url 的生成逻辑则是通过点击PC站点轮播图跳转的 url 分析得到的*/
            app.get('/api/getTopBanner', function(req, res) {
                const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
                const jumpPrefixMap = {
                    10002: 'https://y.qq.com/n/yqq/album/',
                    10014: 'https://y.qq.com/n/yqq/playlist/',
                    10012: 'https://y.qq.com/n/yqq/mv/v/'
                }

                axios.get(url, {
                    headers: {
                        referer: 'https://u.y.qq.com/',
                        host: 'u.y.qq.com'
                    },
                    params: req.query
                }).then((response) => {
                    response = response.data
                    if (response.code === 0) {
                        const slider = []
                        const content = response.focus.data && response.focus.data.content
                        if (content) {
                            for (let i = 0; i < content.length; i++) {
                                const item = content[i]
                                const sliderItem = {}
                                const jumpPrefix = jumpPrefixMap[item.type || 10002]
                                sliderItem.id = item.id
                                sliderItem.linkUrl = jumpPrefix + item.jump_info.url + '.html'
                                sliderItem.picUrl = item.pic_info.url
                                slider.push(sliderItem)
                            }
                        }
                        res.json({
                            code: 0,
                            data: {
                                slider
                            }
                        })
                    } else {
                        res.json(response)
                    }
                }).catch((e) => {
                    console.log(e)
                })
            })

            //获取歌单数据
            app.get('/api/getDiscList', function(req, res) {
                const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
                axios.get(url, {
                    headers: {
                        referer: 'https://c.y.qq.com/',
                        host: 'c.y.qq.com'
                    },
                    params: req.query
                }).then((response) => {
                    res.json(response.data)
                }).catch((e) => {
                    console.log(e)
                })
            })

            /**这里我们代理了一个 post 请求，我们本地实现了 /api/getPurlUrl 这个 post 接口，并且接受的是 json 格式的数据，然后转发给 QQ 官网接口的时候，我们添加了 headers，伪造了 referer 和 origin，并且把 Content-Type 设置为 application/x-www-form-urlencoded，目的就是为了满足 QQ 官网接口的请求格式 */
            app.post('/api/getPurlUrl', bodyParser.json(), function (req, res) {
              const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
              axios.post(url, req.body, {
                headers: {
                  referer: 'https://y.qq.com/',
                  origin: 'https://y.qq.com',
                  'Content-type': 'application/x-www-form-urlencoded'
                }
              }).then((response) => {
                res.json(response.data)
              }).catch((e) => {
                console.log(e)
              })
            })

            //歌词请求
            app.get('/api/lyric', function (req, res) {
              const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

              axios.get(url, {
                headers: {
                  referer: 'https://c.y.qq.com/',
                  host: 'c.y.qq.com'
                },
                params: req.query
              }).then((response) => {
                let ret = response.data
                if (typeof ret === 'string') {
                  const reg = /^\w+\(({.+})\)$/
                  const matches = ret.match(reg)
                  if (matches) {
                    ret = JSON.parse(matches[1])
                  }
                }
                res.json(ret)
              }).catch((e) => {
                console.log(e)
              })
            })

            //歌单的歌曲列表数据请求
            app.get('/api/getCdInfo', function (req, res) {
              const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
              axios.get(url, {
                headers: {
                  referer: 'https://c.y.qq.com/',
                  host: 'c.y.qq.com'
                },
                params: req.query
              }).then((response) => {
                let ret = response.data
                if (typeof ret === 'string') {
                  const reg = /^\w+\(({.+})\)$/
                  const matches = ret.match(reg)
                  if (matches) {
                    ret = JSON.parse(matches[1])
                  }
                }
                res.json(ret)
              }).catch((e) => {
                console.log(e)
              })
            })

            //搜索结果请求
            app.get('/api/search', function (req, res) {
              const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
              axios.get(url, {
                headers: {
                  referer: 'https://c.y.qq.com/',
                  host: 'c.y.qq.com'
                },
                params: req.query
              }).then((response) => {
                res.json(response.data)
              }).catch((e) => {
                console.log(e)
              })
            })
        }
  }
}
