import { NotImplementedError } from '../common/errors'
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
  }

  async getItem(id) {
    let item = this.data[id]
    if (item === undefined) {
      item = await this.getItemFromApi(id)
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
      list = await this.listApiPromise[key]
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

  async getItemFromApi(id) {
    try {
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
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getListFromApi(key) {
    try {
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
    } catch (error) {
      console.log(error)
      return undefined
    }
  }
}
const articleManager = new ArticleManager()


class CategoryManager extends ResourceManager {
  // 文章分类
  baseApi = API_HOST + 'category/'

  async getListFromApi(key) {
    try {
      let url = this.baseApi
      let rsp = await fetch(url, { headers: headers })
      let rawData = await rsp.json()
      return rawData.data
    } catch (error) {
      console.log(error)
      return undefined
    }
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
  baseApi = API_HOST + 'account/'
  profileUrl = API_HOST + 'account/profile/'
  preLoginUrl = API_HOST + 'account/login/prepare/'
  devLoginUrl = API_HOST + 'account/oauth/github/'
  logoutUrl = API_HOST + 'account/logout/'
  currentUserId = null

  async getCurrentUser(refresh = false) {
    let currentUser = this.getItemSync(this.currentUserId)
    if (!currentUser || refresh) {
      currentUser = await this.getCurrentUserFromApi()
      if (currentUser) {
        this.currentUserId = currentUser.id
        this.setItem(currentUser)
      }
    }
    return currentUser
  }

  async getCurrentUserFromApi() {
    try {
      let rsp = await fetch(this.profileUrl, { headers: headers, credentials: 'include' })
      let rawData = await rsp.json()
      return rawData
    } catch (error) {
      console.log(error)
      return undefined
    }
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
    return rsp
  }

  async logout() {
    let rsp = await fetch(this.logoutUrl, { headers: headers, credentials: 'include', redirect: 'manual' })
    return rsp
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

  async getListFromApi(key) {
    let url = this.baseApi
    let { page } = JSON.parse(key)
    if (page) {
      url += `?page=${page}`
    }
    let rsp = await fetch(url, { headers: headers, credentials: 'include' })
    if (rsp.status === 404) {
      return []
    }
    let rawData = await rsp.json()
    if (rawData.pageInfo) {
      this.setPageInfo(key, rawData.pageInfo.pageSize, rawData.pageInfo.total)
    }
    console.log(rawData)
    return rawData.data
  }
}
const noticeManager = new NoticeManager()


export {
  articleManager, categoryManager, topicManager,
  linkManager, userManager, noticeManager
}
