const API_HOST = 'http://127.0.0.1:8000/'
var headers = {
  'Accept': 'application/json',
}


class Exception {
  constructor(msg='Error') {
    this.msg = msg
  }
}


class NotImplementedError extends Exception {
  constructor(msg='Not Implemented') {
    super(msg)
  }
}


class ResourceManager {
  data = {}
  idListMap = {}  //idListMap = {key: [idList]}

  async getItem(id) {
    let item = this.data[id]
    if (item === undefined) {
      item = await this.getItemFromApi(id)
      return item
    } else {
      return item
    }
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
    let list
    if (idList) {
      list = idList.map((id, index) => (
        this.data[id]
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
        this.data[item.id] = item
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

  setPageInfo(pageSize, total) {
    this.pageInfo = {
      pageSize: pageSize,
      total: total,
    }
  }

  async getListFromApi(key) {
    let { page, cate_id, topic_id } = JSON.parse(key)
    try {
      let url = this.baseApi
      if (cate_id) {
        url = `${url}category/${cate_id}/`
      } else if (topic_id) {
        url = `${url}topic/${topic_id}/`
      }
      url += (page ? `?page=${page}` : '')
      let rsp = await fetch(url, { headers: headers })
      if (rsp.status === 404) {
        return null
      }
      let rawData = await rsp.json()
      this.setPageInfo(rawData.pageInfo.pageSize, rawData.pageInfo.total)
      return rawData.data
    } catch (error) {
      console.log(error)
      return null
    }
  }
}

const articleManager = new ArticleManager()


class CategoryManager extends ResourceManager {
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
  baseApi = API_HOST + 'topic/'
}

const topicManager = new TopicManager()


export { articleManager, categoryManager, topicManager }
