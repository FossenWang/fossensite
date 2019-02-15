import React, { Component, Fragment } from 'react'
import { Link } from "react-router-dom"

import withStyles from '@material-ui/core/styles/withStyles'
import Fade from '@material-ui/core/Fade/Fade'
import Grid from '@material-ui/core/Grid/Grid'
import Paper from '@material-ui/core/Paper/Paper'

import { Pagination, Loading, ZoomImg, withErrorBoundary } from '../common/components'
import { parseUrlParams, windowScrollTo } from '../common/tools'
import { Http404 } from '../common/errors'
import { articleManager, categoryManager, topicManager } from '../resource/manager'
import { ArticleInfo } from './article_detail'


const articleListItemStyle = theme => ({
  article: {
    width: '100%',
    margin: '0 10px 8px',
    padding: '8px 10px 0',
    borderTop: '1px solid lightgray',
  },
  title: {
    fontSize: '1.25rem'
  },
  content: {
    color: theme.palette.primary.contrastText,
    padding: '8px 0',
  },
  cover: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    padding: '4px 16px 4px 0',
  }
})


class ArticleListItem extends Component {
  render() {
    let { classes, article } = this.props
    let url = '/article/' + article.id + '/'
    let hasCover = Boolean(article.cover)
    return (
      <article className={classes.article}>
        <Grid container>
          {hasCover ? <Grid item md={4} className={classes.cover}>
            <ZoomImg src={'https://www.fossen.cn' + article.cover} alt='' /></Grid> : null}
          <Grid md={hasCover ? 8 : 12} item>
            <div className={classes.title}>
              <Link to={url}>{article.title}</Link>
            </div>
            <div className={classes.content}>
              {article.content.replace(/<\/?[^>]*>/g, '').substr(0, 150)}&nbsp;...&emsp;
          <Link to={url}>阅读全文 &gt;</Link>
            </div>
            <ArticleInfo article={article} />
          </Grid>
        </Grid>
      </article>
    )
  }
}
ArticleListItem = withStyles(articleListItemStyle)(ArticleListItem)


const articleListTittleStyle = theme => ({
  listTitle: {
    padding: '16px 24px',
  },
})


class ArticleListTittle extends Component {
  render() {
    return (
      <div className={this.props.classes.listTitle}>
        {this.props.children}
      </div>
    )
  }
}
ArticleListTittle = withStyles(articleListTittleStyle)(ArticleListTittle)


const baseArticleListStyle = theme => ({
  paper: {
    paddingBottom: 8,
    marginBottom: 8,
  },
  empty: {
    margin: '3rem 0',
    fontSize: '1.25rem',
  }
})


class BaseArticleList extends Component {
  render() {
    let { classes, articleList, pageInfo, loading } = this.props

    // 获取数据时显示加载中
    if (loading) {
      windowScrollTo()
      return (<Loading className={classes.paper} />)
    }

    let items
    if (articleList.length) {
      items = articleList.map((article) => {
        return (
          <ArticleListItem key={article.id} article={article} />
        )
      })
    } else if (pageInfo.page !== 1) {
      throw new Http404()
    } else {
      items = (<div className={classes.empty}>没有相关的文章</div>)
    }
    return (
      <Fade in>
        <Paper className={classes.paper}>
          <ArticleListTittle>{this.props.title}</ArticleListTittle>
          <Grid container justify={'center'}>
            {items}
          </Grid>
          <Pagination url={pageInfo.url} page={pageInfo.page}
            pageSize={pageInfo.pageSize} total={pageInfo.total} />
        </Paper>
      </Fade>
    )
  }
}
BaseArticleList = withStyles(baseArticleListStyle)(BaseArticleList)


class NewArticleList extends Component {
  constructor(props) {
    super(props)
    let params = this.getCurrentParams()
    let { page } = params
    this.state = {
      articleList: [], key: '',
      pageInfo: { page: page, total: 0, pageSize: 0 },
    }
  }

  getCurrentParams() {
    // 获取当前的url参数
    let params = parseUrlParams(this.props.location.search)
    let page = articleManager.parsePage(params)
    return { page: page }
  }

  async setArticleList(params) {
    // 收集key用于获取文章列表
    let { page } = params
    page = (page ? page : 1)
    let key = articleManager.makeListKey(params)
    // 异步获取文章列表
    let articleList = await articleManager.getList(key)
    let pageInfo = Object.assign({ page: page }, articleManager.pageInfo[key])
    // 更新组件state
    this.setState({
      articleList: articleList, pageInfo: pageInfo, key: key
    })
  }

  render() {
    let params = this.getCurrentParams()
    let key = articleManager.makeListKey(params)
    let loading = false

    // 切换页面时router会重用组件，不会调用construct方法
    // 会调用render方法，故需判断当前页面是否要重新渲染
    if (key !== this.state.key) {
      loading = true
      this.setArticleList(params)
    }

    let { articleList, pageInfo } = this.state
    let url = this.props.location.pathname
    if (!url.match('article')) {
      url += 'article/'
    }
    pageInfo.url = url
    return (
      <BaseArticleList articleList={articleList} pageInfo={pageInfo}
        loading={loading} title={'最新文章'} />
    )
  }
}
NewArticleList = withErrorBoundary(NewArticleList)


class CateArticleList extends Component {
  constructor(props) {
    super(props)
    let params = this.getCurrentParams()
    let { page } = params
    this.state = {
      articleList: [], key: '', cate: {},
      pageInfo: { page: page, total: 0, pageSize: 0 },
    }
  }

  getCurrentParams() {
    // 获取当前的url参数，包括页码，分类id
    let params = parseUrlParams(this.props.location.search)
    let page = articleManager.parsePage(params)
    let cate_id = articleManager.parseCateId(this.props.match.params)
    return { page: page, cate_id: cate_id }
  }

  async setArticleList(params) {
    // 获取文章列表和分页信息，然后更改state
    let { page, cate_id } = params
    let cate = {}
    if (cate_id) {
      // 异步获取当前分类
      cate = await categoryManager.getItem(cate_id)
    }

    // 收集key用于获取文章列表
    page = (page ? page : 1)
    let key = articleManager.makeListKey(params)
    // 异步获取文章列表
    let articleList = await articleManager.getList(key)
    let pageInfo = Object.assign({ page: page }, articleManager.pageInfo[key])

    // 更新组件state
    this.setState({
      articleList: articleList, pageInfo: pageInfo, key: key, cate: cate
    })
  }

  render() {
    let params = this.getCurrentParams()
    let key = articleManager.makeListKey(params)
    let loading = false

    // 切换页面时router会重用组件，不会调用construct方法
    // 会调用render方法，故需判断当前页面是否要重新渲染
    if (key !== this.state.key) {
      loading = true
      this.setArticleList(params)
    }

    let { articleList, pageInfo, cate } = this.state
    pageInfo.url = this.props.location.pathname
    return (
      <BaseArticleList articleList={articleList} pageInfo={pageInfo}
        loading={loading} title={<Fragment>
          <Link to="/">首页</Link>&nbsp;&nbsp;&gt;&nbsp;&nbsp;
          <span>分类：{cate.name}</span>
        </Fragment>} />
    )
  }
}
CateArticleList = withErrorBoundary(CateArticleList)


class TopicArticleList extends Component {
  constructor(props) {
    super(props)
    let params = this.getCurrentParams()
    let { page } = params
    this.state = {
      articleList: [], key: '', topic: {},
      pageInfo: { page: page, total: 0, pageSize: 0 },
    }
  }

  getCurrentParams() {
    // 获取当前的url参数，包括页码，分类id
    let params = parseUrlParams(this.props.location.search)
    let page = articleManager.parsePage(params)
    let topic_id = articleManager.parseTopicId(this.props.match.params)
    return { page: page, topic_id: topic_id }
  }

  async setArticleList(params) {
    // 获取文章列表和分页信息，然后更改state
    let { page, topic_id } = params
    let topic = {}
    if (topic_id) {
      // 异步获取当前分类
      topic = await topicManager.getItem(topic_id)
    }

    // 收集key用于获取文章列表
    page = (page ? page : 1)
    let key = articleManager.makeListKey(params)
    // 异步获取文章列表
    let articleList = await articleManager.getList(key)
    let pageInfo = Object.assign({ page: page }, articleManager.pageInfo[key])
    // 更新组件state
    this.setState({
      articleList: articleList, pageInfo: pageInfo, key: key, topic: topic
    })
  }

  render() {
    let params = this.getCurrentParams()
    let key = articleManager.makeListKey(params)
    let loading = false

    // 切换页面时router会重用组件，不会调用construct方法
    // 会调用render方法，故需判断当前页面是否要重新渲染
    if (key !== this.state.key) {
      loading = true
      this.setArticleList(params)
    }

    let { articleList, pageInfo, topic } = this.state
    pageInfo.url = this.props.location.pathname
    return (
      <BaseArticleList articleList={articleList} pageInfo={pageInfo}
        loading={loading} title={<Fragment>
          <Link to="/">首页</Link>&nbsp;&nbsp;&gt;&nbsp;&nbsp;
            <span>话题：{topic.name}</span>
        </Fragment>} />
    )
  }
}
TopicArticleList = withErrorBoundary(TopicArticleList)


const searchListStyle = theme => ({
  q: { color: theme.palette.text.secondary }
})


class SearchArticleList extends Component {
  constructor(props) {
    super(props)
    let params = this.getCurrentParams()
    let { page, q } = params
    this.state = {
      articleList: [], key: null, q: q,
      pageInfo: { page: page, total: 0, pageSize: 0 },
    }
  }

  getCurrentParams() {
    // 获取当前的url参数
    let params = parseUrlParams(this.props.location.search)
    let page = articleManager.parsePage(params)
    let q = articleManager.parseQ(params)
    if (!q) { throw new Http404() }
    return { page: page, q: q }
  }

  async setArticleList(params) {
    // 异步获取文章列表
    let { page, q } = params
    let key = articleManager.makeListKey(params)
    let articleList = await articleManager.getList(key)
    let pageInfo = Object.assign({ page: page }, articleManager.pageInfo[key])
    // 更新组件state
    this.setState({
      articleList: articleList, pageInfo: pageInfo, key: key, q: q
    })
  }

  render() {
    let params = this.getCurrentParams()
    let key = articleManager.makeListKey(params)
    let loading = false

    // 切换页面时router会重用组件，不会调用construct方法
    // 会调用render方法，故需判断当前页面是否要重新渲染
    if (key !== this.state.key) {
      loading = true
      this.setArticleList(params)
    }

    let { q } = params
    let { classes } = this.props
    let { articleList, pageInfo } = this.state
    pageInfo.url = this.props.location.pathname + (q ? `?q=${q}` : '')
    return (
      <BaseArticleList articleList={articleList} pageInfo={pageInfo}
        loading={loading} title={<Fragment>
          关键词：<span className={classes.q}>{q}</span>&emsp;搜索结果 共{pageInfo.total}条
      </Fragment>} />
    )
  }
}
SearchArticleList = withErrorBoundary(withStyles(searchListStyle)(SearchArticleList))


export { NewArticleList, CateArticleList, TopicArticleList, SearchArticleList }
