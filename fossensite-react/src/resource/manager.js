class ResourceManager {
  data = {}
  idListMap = {}  //idListMap = {key: [idList]}

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
}


class ArticleManager extends ResourceManager {
  baseApi = 'http://127.0.0.1:8000/article/'
  pageInfo = {}

  // async getArticle(id) {
  //   let article = this.data[id]
  //   if (article) {
  //     return article
  //   } else {
  //     let article = await fetch()
  //     return article
  //   }
  // }

  setPageInfo(pageSize, total) {
    this.pageInfo = {
      pageSize: pageSize,
      total: total,
    }
  }

  async getListFromApi(page) {
    try {
      let url = this.baseApi + (page ? `?page=${page}` : '')
      let rsp = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      })
      let rawData = await rsp.json()
      this.setPageInfo(rawData.pageInfo.pageSize, rawData.pageInfo.total)
      return rawData.data
    } catch (error) {
      console.log(error)
      return null
    }
  }
}


let articleManager = new ArticleManager()


export { articleManager }
