import { NotImplementedError, HttpForbidden } from '../common/errors'
import { parseUrlParams } from '../common/tools'


const API_HOST = 'http://127.0.0.1:8000/'
var headers = {
  'Accept': 'application/json',
}


class ResourceManager {
  constructor() {
    this.data = {}
    this.idListMap = {}  //idListMap = {key: [idList]}
    this.listApiPromise = {}
    this.itemApiPromise = {}
  }

  async getItem(id) {
    let item = this.data[id]
    if (item === undefined) {
      if (!this.itemApiPromise[id]) {
        this.itemApiPromise[id] = this.getItemFromApi(id)
      }
      try {
        item = await this.itemApiPromise[id]
      } catch (error) {
        this.itemApiPromise[id] = undefined
        throw error
      }
      if (item) { this.setItem(item) }
      else { return item }
    }
    return Object.assign({}, item)
  }

  getItemSync(id) {
    let item = this.data[id]
    if (item) {
      item = Object.assign({}, item)
    }
    return item
  }

  setItem(item) {
    this.data[item.id] = item
  }

  async getList(key) {
    let list = this.getListSync(key)
    if (list === undefined) {
      if (!this.listApiPromise[key]) {
        this.listApiPromise[key] = this.getListFromApi(key)
      }
      try {
        list = await this.listApiPromise[key]
      } catch (error) {
        this.listApiPromise[key] = undefined
        throw error
      }
      this.setlistData(key, list)
    }
    return list
  }

  getListSync(key) {
    let idList = this.idListMap[key]
    let list = []
    if (idList) {
      list = idList.map((id, index) => (
        Object.assign({}, this.data[id])
      ))
      return list
    } else {
      return idList
    }
  }

  setlistData(key, list) {
    let idList
    if (list) {
      idList = list.map((item, index) => {
        this.data[item.id] = Object.assign({}, item)
        return item.id
      })
    } else {
      idList = list
    }
    this.idListMap[key] = idList
  }

  async getItemFromApi(id) {
    throw new NotImplementedError()
  }

  async getListFromApi(key) {
    throw new NotImplementedError()
  }
}


class ArticleManager extends ResourceManager {
  baseApi = API_HOST + 'article/'
  pageInfo = {}
  setPageInfo(key, pageSize, total) {
    this.pageInfo[key] = {
      pageSize: pageSize,
      total: total,
    }
  }
  makeListKey(params) {
    // 收集key用于获取文章列表
    let key = {}
    let { page, cate_id, topic_id, q } = params
    if (page) { key.page = page }
    if (cate_id) { key.cate_id = cate_id }
    if (topic_id) { key.topic_id = topic_id }
    if (q) { key.q = q }
    return JSON.stringify(key)
  }
  parsePage(params) {
    let { page } = params
    page = parseInt(page)
    page = (page ? page : 1)
    return page
  }
  parseCateId(params) {
    let { cate_id } = params
    if (cate_id) { cate_id = parseInt(cate_id) }
    return cate_id
  }
  parseTopicId(params) {
    let { topic_id } = params
    if (topic_id) { topic_id = parseInt(topic_id) }
    return topic_id
  }
  parseQ(params) {
    let { q } = params
    if (q) { q = decodeURI(q) }
    return q
  }

  async getItemFromApi(id) {
    if (!id) {
      return undefined
    }
    let url = `${this.baseApi}${id}/`
    let rsp = await fetch(url, { headers: headers })
    if (rsp.status === 404) {
      return {}
    }
    let rawData = await rsp.json()
    return rawData
  }

  async getListFromApi(key) {
    let { page, cate_id, topic_id, q } = JSON.parse(key)
    let url = this.baseApi
    let params = []
    if (cate_id) {
      url = `${url}category/${cate_id}/`
    } else if (topic_id) {
      url = `${url}topic/${topic_id}/`
    } else if (q) {
      url = `${url}search/`
      params.push(`q=${q}`)
    }
    if (page) {
      params.push(`page=${page}`)
    }
    if (params.length > 0) {
      url += '?' + params.join('&')
    }
    let rsp = await fetch(url, { headers: headers })
    if (rsp.status === 404) {
      return []
    }
    let rawData = await rsp.json()
    if (rawData.pageInfo) {
      this.setPageInfo(key, rawData.pageInfo.pageSize, rawData.pageInfo.total)
    }
    return rawData.data
  }
}
const articleManager = new ArticleManager()


class CategoryManager extends ResourceManager {
  // 文章分类
  baseApi = API_HOST + 'category/'

  async getListFromApi(key) {
    let url = this.baseApi
    let rsp = await fetch(url, { headers: headers })
    let rawData = await rsp.json()
    return rawData.data
  }

  async getItemFromApi(id) {
    if (Object.keys(this.data).length === 0) {
      await this.getList()
    }
    return this.data[id]
  }
}
const categoryManager = new CategoryManager()


class TopicManager extends CategoryManager {
  // 文章话题
  baseApi = API_HOST + 'topic/'
}
const topicManager = new TopicManager()


class LinkManager extends CategoryManager {
  // 友情链接
  baseApi = API_HOST + 'link/'
}
const linkManager = new LinkManager()


class UserManager extends ResourceManager {
  // 用户管理
  constructor() {
    super()
    this.currentUserId = null
    this.currentUserApiPromise = null
    this.callbacks = {
      readNotice: [],
      login: [],
      logout: [],
    }
  }
  baseApi = API_HOST + 'account/'
  profileUrl = API_HOST + 'account/profile/'
  preLoginUrl = API_HOST + 'account/login/prepare/'
  devLoginUrl = API_HOST + 'account/oauth/github/'
  logoutUrl = API_HOST + 'account/logout/'

  async getCurrentUser(refresh = false) {
    let currentUser = this.getItemSync(this.currentUserId)
    if (!currentUser || refresh) {
      if (!this.currentUserApiPromise || refresh) {
        this.currentUserApiPromise = this.getCurrentUserFromApi()
      }
      try {
        currentUser = await this.currentUserApiPromise
      } catch (error) {
        this.currentUserApiPromise = null
        throw error
      }
      if (currentUser) {
        this.currentUserId = currentUser.id
        this.setItem(currentUser)
      }
    }
    return currentUser
  }

  async getCurrentUserFromApi() {
    let rsp = await fetch(this.profileUrl, { headers: headers, credentials: 'include' })
    let rawData = await rsp.json()
    return rawData
  }

  async prepareLogin(next) {
    let url = this.preLoginUrl + (next ? '?next=' + next : '')
    let rsp = await fetch(url, { headers: headers, credentials: 'include' })
    let rawData = await rsp.json()
    return rawData
  }

  async devLogin(id, githubOauthUrl) {
    let params = parseUrlParams(githubOauthUrl)
    let url = this.devLoginUrl + '?id=' + id
    if (params.state) {
      url += '&state=' + params.state
    }
    let rsp = await fetch(url, { headers: headers, credentials: 'include', redirect: 'manual' })
    // 调用回调
    this.callbacks.login.forEach(func => {
      func({ login: true })
    })
    return rsp
  }

  async logout() {
    let rsp = await fetch(this.logoutUrl, { headers: headers, credentials: 'include', redirect: 'manual' })
    this.callbacks.logout.forEach(func => {
      func({ login: false })
    })
    return rsp
  }

  async readNotice() {
    let currentUser = await this.getCurrentUser()
    if (currentUser.new_notice) {
      currentUser.new_notice = false
      this.setItem(currentUser)
      // 调用回调
      this.callbacks.readNotice.forEach(func => {
        func({ currentUser })
      })
    }
  }
}
const userManager = new UserManager()


class NoticeManager extends ResourceManager {
  baseApi = API_HOST + 'account/notice/'
  pageInfo = {}
  setPageInfo(key, pageSize, total) {
    this.pageInfo[key] = {
      pageSize: pageSize,
      total: total,
    }
  }
  makeListKey(page) {
    // 收集key用于获取列表
    let key = {}
    if (page) { key.page = page }
    return key = JSON.stringify(key)
  }
  cleanCaches = () => {
    this.data = {}
    this.idListMap = {}
    this.listApiPromise = {}
    this.itemApiPromise = {}
    this.pageInfo = {}
  }

  async getListFromApi(key) {
    let url = this.baseApi
    let { page } = JSON.parse(key)
    if (page) {
      url += `?page=${page}`
    }
    let rsp = await fetch(url, { headers: headers, credentials: 'include' })
    if (rsp.status === 404) {
      return []
    } else if (rsp.status === 403) {
      throw new HttpForbidden()
    }
    let rawData = await rsp.json()
    if (rawData.pageInfo) {
      this.setPageInfo(key, rawData.pageInfo.pageSize, rawData.pageInfo.total)
    }
    rawData.data.forEach(item => {
      if (item.comment_id === null) {
        item.id = 'c' + item.id
      }
    })
    return rawData.data
  }
}
const noticeManager = new NoticeManager()
window.n = noticeManager

export {
  articleManager, categoryManager, topicManager,
  linkManager, userManager, noticeManager
}
