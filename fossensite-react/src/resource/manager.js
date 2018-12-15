import { NotImplementedError, HttpForbidden, Exception, HttpError } from '../common/errors'
import { parseUrlParams, fetchPost, fetchDelete } from '../common/tools'


const API_HOST = 'http://127.0.0.1:8000/api/'
var headers = {
  'Accept': 'application/json',
}


class ResourceManager {
  constructor() {
    this.data = {}
    this.idListMap = {}  //idListMap = {key: [idList]}
    this.listApiPromise = {}
    this.itemApiPromise = {}
    this.callbacks = {}
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
        delete this.listApiPromise[key]
        throw error
      }
      this.setlistData(key, list)
      delete this.listApiPromise[key]
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

  runCallbacks(callbacks, ...kwargs) {
    for (let key in callbacks) {
      try {
        callbacks[key](...kwargs)
      } catch (error) {
        delete callbacks[key]
      }
    }
  }
}


class ArticleManager extends ResourceManager {
  constructor() {
    super()
    this.pageInfo = {}
  }
  baseApi = API_HOST + 'article/'
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
    this.csrftoken = null
    this.callbacks = {
      readNotice: {},
      login: {},
      logout: {},
    }
  }
  baseApi = API_HOST + 'account/'
  profileUrl = API_HOST + 'account/profile/'
  preLoginUrl = API_HOST + 'account/login/prepare/'
  loginUrl = API_HOST + 'account/oauth/github/'
  logoutUrl = API_HOST + 'account/logout/'

  async getCurrentUser(refresh = false) {
    let currentUser = this.getItemSync(this.currentUserId)
    if (!currentUser || refresh) {
      if (!this.currentUserApiPromise) {
        this.currentUserApiPromise = this.getCurrentUserFromApi()
      }
      try {
        currentUser = await this.currentUserApiPromise
      } catch (error) {
        this.currentUserApiPromise = null
        throw error
      }
      this.setCurrentUser(currentUser)
      this.currentUserApiPromise = null
    }
    return currentUser
  }

  async getCurrentUserFromApi() {
    let rsp = await fetch(this.profileUrl, { headers: headers, credentials: 'include' })
    let rawData = await rsp.json()
    return rawData
  }
  setCurrentUser(user) {
    this.currentUserId = user.id
    this.setItem(user)
  }
  async prepareLogin(next) {
    let url = this.preLoginUrl + (next ? '?next=' + next : '')
    let rsp = await fetch(url, { headers: headers, credentials: 'include' })
    let rawData = await rsp.json()
    let { state } = parseUrlParams(rawData.github_oauth_url)
    this.csrftoken = state
    return rawData
  }

  async baseLogin(url) {
    let rsp = await fetch(url, { headers: headers, credentials: 'include' })
    if (rsp.status !== 200) {
      throw HttpError({rsp: rsp})
    }
    let rawData = await rsp.json()
    this.setCurrentUser(rawData.user)
    // 调用回调
    this.runCallbacks(this.callbacks.login, rawData.user)
    return rawData
  }
  async login(code) {
    let url = `${this.loginUrl}?code=${code}&state=${this.csrftoken}`
    return await this.baseLogin(url)
  }
  async devLogin(id) {
    let url = `${this.loginUrl}?id=${id}&state=${this.csrftoken}`
    return await this.baseLogin(url)
  }

  async logout() {
    let rsp = await fetch(this.logoutUrl, { headers: headers, credentials: 'include', redirect: 'manual' })
    if (rsp.status !== 200) {
      throw HttpError({rsp: rsp})
    }
    let user = await rsp.json()
    this.setCurrentUser(user)
    this.runCallbacks(this.callbacks.logout, user)
    return user
  }

  async readNotice() {
    let currentUser = await this.getCurrentUser()
    if (currentUser.new_notice) {
      currentUser.new_notice = false
      this.setItem(currentUser)
      // 调用回调
      this.runCallbacks(this.callbacks.readNotice, currentUser)
    }
  }
}
const userManager = new UserManager()


class NoticeManager extends ResourceManager {
  constructor() {
    super()
    this.pageInfo = {}
  }
  baseApi = API_HOST + 'account/notice/'
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


async function getCSRFToken() {
  let url = API_HOST + 'csrf/'
  let rsp = await fetch(url, { credentials: 'include' })
  let data = await rsp.json()
  return data.csrftoken
}


class CommentManager extends ResourceManager {
  constructor() {
    super()
    this.pageInfo = {}
  }
  setPageInfo(key, pageInfo, totalCommentAndReply) {
    let { pageSize, total, page } = pageInfo
    this.pageInfo[key] = {
      pageSize: pageSize,
      total: total,
      page: page,
      totalCommentAndReply: totalCommentAndReply
    }
  }
  baseApi = API_HOST + 'article/'

  makeListKey(articleId, page) {
    // 收集key用于获取列表
    let key = {}
    if (page) { key.page = page }
    key.articleId = articleId
    return key = JSON.stringify(key)
  }
  async getListFromApi(key) {
    let { page, articleId } = JSON.parse(key)
    let url = `${this.baseApi}${articleId}/comment/`
    if (page) {
      url += `?page=${page}`
    }
    let rsp = await fetch(url, { headers: headers })
    if (rsp.status === 404) {
      return []
    } else if (rsp.status === 403) {
      throw new HttpForbidden()
    }
    let rawData = await rsp.json()
    let { data, pageInfo, totalCommentAndReply } = rawData
    if (pageInfo) {
      this.setPageInfo(key, pageInfo, totalCommentAndReply)
    }
    return data
  }
  async createComment(content, articleId) {
    if (!content || !articleId) {
      throw new Exception('wrong args')
    }
    let csrftoken = await getCSRFToken()
    let url = `${this.baseApi}${articleId}/comment/`
    let rsp = await fetchPost(url, { content: content }, csrftoken)
    let newComment = await rsp.json()
    if (rsp.status === 403) {
      throw new HttpForbidden(newComment)
    }
    this.cleanIdList(articleId)
    return newComment
  }
  async deleteComment(commentId, articleId) {
    if (!commentId) {
      throw new Exception('wrong args')
    }
    let csrftoken = await getCSRFToken()
    let url = `${this.baseApi}comment/${commentId}/`
    let rsp = await fetchDelete(url, csrftoken)
    this.cleanIdList(articleId)
    return rsp.status
  }
  async createReply(content, articleId, replyTo) {
    if (!content || !articleId || !replyTo) {
      throw new Exception('wrong args')
    }
    let csrftoken = await getCSRFToken()
    let url = `${this.baseApi}${articleId}/comment/reply/`
    let postData = { content: content }
    if (replyTo.comment_id) {
      postData.comment_id = replyTo.comment_id
      postData.reply_id = replyTo.id
    } else {
      postData.comment_id = replyTo.id
    }
    let rsp = await fetchPost(url, postData, csrftoken)
    let newComment = await rsp.json()
    if (rsp.status === 403) {
      throw new HttpForbidden(newComment)
    }
    this.cleanIdList(articleId)
    return newComment
  }
  async deleteReply(replyId, articleId) {
    if (!replyId) {
      throw new Exception('wrong args')
    }
    let csrftoken = await getCSRFToken()
    let url = `${this.baseApi}reply/${replyId}/`
    let rsp = await fetchDelete(url, csrftoken)
    this.cleanIdList(articleId)
    return rsp.status
  }
  cleanIdList(articleId) {
    for (let key in this.idListMap) {
      if (key.match(`"articleId":${articleId}`)) {
        delete this.idListMap[key]
      }
    }
  }
}
const commentManager = new CommentManager()


export {
  articleManager, categoryManager, topicManager,
  linkManager, userManager, noticeManager, commentManager
}
