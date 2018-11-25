// class ResourceManager {
// }


class ArticleManager {
  data = {}
  listDataMap = {}  //listDataMap = {key: {idList:[], pageInfo: any}}
  baseApi = 'http://127.0.0.1:8000/article/'

  async getArticle(id) {
    let article = this.data[id]
    if (article) {
      return article
    } else {
      let article = await fetch()
      return article
    }
  }

  async getListData(key) {
    let listData = this.processListData(key)
    if (!listData) {
      listData = await this.getListFromApi(key)
      this.setlistData(key, listData)
    }
    return listData
  }

  processListData(key) {
    let data = this.listDataMap[key]
    let list
    if (data) {
      list = data.idList.map((id, index) => (
        this.data[id]
      ))
      return { data: list, pageInfo: data.pageInfo }
    } else {
      return data
    }
  }

  setlistData(key, rawData) {
    let idList = rawData.data.map((item, index) => {
      this.data[item.id] = item
      return item.id
    })
    this.listDataMap[key] = {idList: idList, pageInfo: rawData.pageInfo}
  }

  async getListFromApi(key) {
    let url = this.baseApi + (key ? `?page=${key}` : '')
    let rsp = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    })
    let json = await rsp.json()
    console.log('json', json)
    return json
  }
}


let articleManager = new ArticleManager()


export { articleManager }
