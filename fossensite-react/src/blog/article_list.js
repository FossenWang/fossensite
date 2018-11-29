import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import { withStyles, Grid, Paper, Fade } from '@material-ui/core';

import { Pagination, Loading, ErrorPage, ZoomImg } from '../common/components'
import { parseUrlParams } from '../common/tools'
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
  empty: {
    margin: '3rem 0',
    fontSize: '1.25rem',
  }
})


class BaseArticleList extends Component {
  render() {
    let { classes, articleList, pageInfo } = this.props

    let items
    if (articleList.length) {
      items = articleList.map((article) => {
        return (
          <ArticleListItem key={article.id} article={article} />
        )
      })
    } else {
      items = (<div className={classes.empty}>没有相关的文章</div>)
    }

    return (
      <Fragment>
        <Grid container justify={'center'}>
          {items}
        </Grid>
        <Pagination
          url={pageInfo.url}
          page={pageInfo.page}
          pageSize={pageInfo.pageSize}
          total={pageInfo.total} />
      </Fragment>
    )
  }
}

BaseArticleList = withStyles(baseArticleListStyle)(BaseArticleList)


const listStyle = theme => ({
  paper: {
    paddingBottom: 8,
    marginBottom: 8,
  },
  q: {color: theme.palette.text.secondary}
})


class NewArticleList extends Component {
  constructor(props) {
    super(props)
    let { page } = this.getCurrentParams()
    this.state = {
      loading: true, articleList: [], pageInfo: { page: page }, key: '',
    }
    this.setArticleList(page)
  }

  getCurrentParams() {
    // 获取当前的url参数
    let params = parseUrlParams(this.props.location.search)
    let { page } = params
    page = parseInt(page)
    page = (page ? page : 1)
    return { page: page }
  }

  makeListKey(page) {
    // 收集key用于获取文章列表
    let key = {}
    if (page) { key.page = page }
    return key = JSON.stringify(key)
  }

  async setArticleList(page) {
    // 收集key用于获取文章列表
    page = (page ? page : 1)
    let key = this.makeListKey(page)
    // 异步获取文章列表
    let articleList = await articleManager.getList(key)
    let pageInfo = {
      page: page,
      pageSize: articleManager.pageInfo[key].pageSize,
      total: articleManager.pageInfo[key].total,
    }
    // 更新组件state
    this.setState({
      loading: false, articleList: articleList, pageInfo: pageInfo, key: key
    })
  }

  render() {
    let { classes } = this.props
    let { articleList, pageInfo } = this.state
    let { page } = this.getCurrentParams()
    let key = this.makeListKey(page)
    let loading = this.state.loading

    // 切换页面时router会重用组件，不会调用construct方法
    // 会调用render方法，故需判断当前页面是否要重新渲染
    if (key !== this.state.key) {
      loading = true
      this.setArticleList(page)
    }

    // 获取数据时显示加载中
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return (<Loading />)
    }

    // 获取文章列表出错时显示错误页面
    if (!articleList) {
      return (<ErrorPage />)
    }

    let url = this.props.location.pathname
    if (!url.match('article')) {
      url += 'article/'
    }
    pageInfo.url = url
    return (
      <Fade in>
        <Paper className={classes.paper}>
          <ArticleListTittle>最新文章</ArticleListTittle>
          <BaseArticleList articleList={articleList} pageInfo={pageInfo} />
        </Paper>
      </Fade>
    )
  }
}
NewArticleList = withStyles(listStyle)(NewArticleList)


class CateArticleList extends Component {
  constructor(props) {
    super(props)
    let { page, cate_id } = this.getCurrentParams()
    this.state = {
      loading: true, articleList: [],
      pageInfo: { page: page }, key: '', cate: {}
    }
    this.setArticleList(page, cate_id)
  }

  getCurrentParams() {
    // 获取当前的url参数，包括页码，分类id
    let params = parseUrlParams(this.props.location.search)
    let { page } = params
    page = parseInt(page)
    page = (page ? page : 1)

    let { cate_id } = this.props.match.params
    if (cate_id) { cate_id = parseInt(cate_id) }
    return { page: page, cate_id: cate_id }
  }

  makeListKey(page, cate_id) {
    // 收集key用于获取文章列表
    let key = {}
    if (page) { key.page = page }
    if (cate_id) { key.cate_id = cate_id }
    return key = JSON.stringify(key)
  }

  async setArticleList(page, cate_id) {
    // 获取文章列表和分页信息，然后更改state
    let cate = {}
    if (cate_id) {
      // 异步获取当前分类
      cate = await categoryManager.getItem(cate_id)
    }

    // 收集key用于获取文章列表
    page = (page ? page : 1)
    let key = this.makeListKey(page, cate_id)
    // 异步获取文章列表
    let articleList = await articleManager.getList(key)
    let pageInfo = {
      page: page,
      pageSize: articleManager.pageInfo[key].pageSize,
      total: articleManager.pageInfo[key].total,
    }

    // 更新组件state
    this.setState({
      loading: false, articleList: articleList,
      pageInfo: pageInfo, key: key, cate: cate
    })
  }

  render() {
    let { classes } = this.props
    let { articleList, pageInfo, cate } = this.state
    let { page, cate_id } = this.getCurrentParams()
    let key = this.makeListKey(page, cate_id)
    let loading = this.state.loading

    // 切换页面时router会重用组件，不会调用construct方法
    // 会调用render方法，故需判断当前页面是否要重新渲染
    if (key !== this.state.key) {
      loading = true
      this.setArticleList(page, cate_id)
    }

    // 获取数据时显示加载中
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return (<Loading />)
    }

    // 获取文章列表出错时显示错误页面
    if (!articleList) {
      return (<ErrorPage />)
    }

    pageInfo.url = this.props.location.pathname
    return (
      <Fade in>
        <Paper className={classes.paper}>
          <ArticleListTittle>
            <Link to="/">首页</Link>&nbsp;&nbsp;&gt;&nbsp;&nbsp;
            <span>分类：{cate.name}</span>
          </ArticleListTittle>
          <BaseArticleList articleList={articleList} pageInfo={pageInfo} />
        </Paper>
      </Fade>
    )
  }
}
CateArticleList = withStyles(listStyle)(CateArticleList)


class TopicArticleList extends Component {
  constructor(props) {
    super(props)
    let { page, topic_id } = this.getCurrentParams()
    this.state = {
      loading: true, articleList: [],
      pageInfo: { page: page }, key: '', topic: {}
    }
    this.setArticleList(page, topic_id)
  }

  getCurrentParams() {
    // 获取当前的url参数，包括页码，分类id
    let params = parseUrlParams(this.props.location.search)
    let { page } = params
    page = parseInt(page)
    page = (page ? page : 1)

    let { topic_id } = this.props.match.params
    if (topic_id) { topic_id = parseInt(topic_id) }
    return { page: page, topic_id: topic_id }
  }

  makeListKey(page, topic_id) {
    // 收集key用于获取文章列表
    let key = {}
    if (page) { key.page = page }
    if (topic_id) { key.topic_id = topic_id }
    return key = JSON.stringify(key)
  }

  async setArticleList(page, topic_id) {
    // 获取文章列表和分页信息，然后更改state
    let topic = {}
    if (topic_id) {
      // 异步获取当前分类
      topic = await topicManager.getItem(topic_id)
    }

    // 收集key用于获取文章列表
    page = (page ? page : 1)
    let key = this.makeListKey(page, topic_id)
    // 异步获取文章列表
    let articleList = await articleManager.getList(key)
    let pageInfo = {
      page: page,
      pageSize: articleManager.pageInfo[key].pageSize,
      total: articleManager.pageInfo[key].total,
    }

    // 更新组件state
    this.setState({
      loading: false, articleList: articleList,
      pageInfo: pageInfo, key: key, topic: topic
    })
  }

  render() {
    let { classes } = this.props
    let { articleList, pageInfo, topic } = this.state
    let { page, topic_id } = this.getCurrentParams()
    let key = this.makeListKey(page, topic_id)
    let loading = this.state.loading

    // 切换页面时router会重用组件，不会调用construct方法
    // 会调用render方法，故需判断当前页面是否要重新渲染
    if (key !== this.state.key) {
      loading = true
      this.setArticleList(page, topic_id)
    }

    // 获取数据时显示加载中
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return (<Loading />)
    }

    // 获取文章列表出错时显示错误页面
    if (!articleList) {
      return (<ErrorPage />)
    }

    pageInfo.url = this.props.location.pathname
    return (
      <Fade in>
        <Paper className={classes.paper}>
          <ArticleListTittle>
            <Link to="/">首页</Link>&nbsp;&nbsp;&gt;&nbsp;&nbsp;
            <span>话题：{topic.name}</span>
          </ArticleListTittle>
          <BaseArticleList articleList={articleList} pageInfo={pageInfo} />
        </Paper>
      </Fade>
    )
  }
}
TopicArticleList = withStyles(listStyle)(TopicArticleList)


class SearchArticleList extends Component {
  constructor(props) {
    super(props)
    let { page, q } = this.getCurrentParams()
    this.state = {
      loading: true, articleList: [],
      pageInfo: { page: page }, key: '', q: q
    }
    this.setArticleList(page, q)
  }

  getCurrentParams() {
    // 获取当前的url参数
    let params = parseUrlParams(this.props.location.search)
    let { page, q } = params
    page = parseInt(page)
    page = (page ? page : 1)
    q = decodeURI(q)
    return { page: page, q: q }
  }

  makeListKey(page, q) {
    // 收集key用于获取文章列表
    let key = {}
    if (page) { key.page = page }
    if (q) { key.q = q }
    return key = JSON.stringify(key)
  }

  async setArticleList(page, q) {
    // 异步获取文章列表
    let key = this.makeListKey(page, q)
    let articleList = await articleManager.getList(key)
    let pageInfo = {
      page: page,
      pageSize: articleManager.pageInfo[key].pageSize,
      total: articleManager.pageInfo[key].total,
    }
    // 更新组件state
    this.setState({
      loading: false, articleList: articleList,
      pageInfo: pageInfo, key: key, q: q
    })
  }

  render() {
    let { classes } = this.props
    let { articleList, pageInfo } = this.state
    let { page, q } = this.getCurrentParams()
    let key = this.makeListKey(page, q)
    let loading = this.state.loading

    // 切换页面时router会重用组件，不会调用construct方法
    // 会调用render方法，故需判断当前页面是否要重新渲染
    if (key !== this.state.key) {
      loading = true
      this.setArticleList(page, q)
    }

    // 获取数据时显示加载中
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return (<Loading />)
    }

    // 获取文章列表出错时显示错误页面
    if (!articleList) {
      return (<ErrorPage />)
    }

    pageInfo.url = this.props.location.pathname + (q ? `?q=${q}` : '')
    return (
      <Fade in>
        <Paper className={classes.paper}>
          <ArticleListTittle>
            关键词：<span className={classes.q}>{q}</span>&emsp;搜索结果 共{pageInfo.total}条
          </ArticleListTittle>
          <BaseArticleList articleList={articleList} pageInfo={pageInfo} />
        </Paper>
      </Fade>
    )
  }
}
SearchArticleList = withStyles(listStyle)(SearchArticleList)


export { NewArticleList, CateArticleList, TopicArticleList, SearchArticleList }
