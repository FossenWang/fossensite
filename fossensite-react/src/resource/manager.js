import { NotImplementedError, Http404 } from '../common/errors'


const API_HOST = 'http://127.0.0.1:8000/'
var headers = {
  'Accept': 'application/json',
}


class ResourceManager {
  data = {}
  idListMap = {}  //idListMap = {key: [idList]}

  async getItem(id) {
    let item = this.data[id]
    if (item === undefined) {
      item = await this.getItemFromApi(id)
      if (item) { this.data[item.id] = item }
      else { return item}
    }
    return Object.assign({}, item)
  }

  async getList(key) {
    let list = this.processListData(key)
    if (list === undefined) {
      list = await this.getListFromApi(key)
      this.setlistData(key, list)
    }
    return list
  }

  processListData(key) {
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
        return null
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
      return null
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
      if(rawData.pageInfo) {
      this.setPageInfo(key, rawData.pageInfo.pageSize, rawData.pageInfo.total)
      }
      return rawData.data
    } catch (error) {
      console.log(error)
      return null
    }
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


export { articleManager, categoryManager, topicManager, linkManager, Http404 }
