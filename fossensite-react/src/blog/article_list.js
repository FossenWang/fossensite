import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import { withStyles, Grid, Paper, Fade } from '@material-ui/core';

import { Pagination, NotFound, formatDate, Loading } from '../common/components'
import { articleManager, categoryManager, topicManager } from '../resource/manager'


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
  info: {
    fontSize: '0.875rem',
    color: 'gray',
    wordBreak: 'keep-all',
    '& a': {
      color: 'gray',
    },
  }
})


class ArticleListItem extends Component {
  render() {
    let { classes, article } = this.props
    let url = '/article/' + article.id + '/'
    return (
      <Grid component={'article'}
        item className={classes.article}>
        <div className={classes.title}>
          <Link to={url}>{article.title}</Link>
        </div>
        <div className={classes.content}>
          {article.content.replace(/<\/?[^>]*>/g, '').substr(0, 150)}&nbsp;...&emsp;
          <Link to={url}>阅读全文 &gt;</Link>
        </div>
        <div className={classes.info}>
          {formatDate(article.pub_date)}&emsp;
          {article.views} 阅读&emsp;
          分类: {this.formatCategory(article.category)}&emsp;
          话题: {this.formatTopics(article.topics)}
        </div>
      </Grid>
    )
  }
  formatCategory(category) {
    return <Link to={`/article/category/${category.id}/`}>{category.name}</Link>
  }
  formatTopics(topics) {
    return topics.map((t) => (
      <Fragment key={t.id}>
        <Link to={`/article/topic/${t.id}/`}>
          {t.name}
        </Link>&nbsp;&nbsp;
      </Fragment>
    ))
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
    let title
    let url = this.props.match.url
    if (url.match('category')) {
      title = (
        <div className={this.props.classes.listTitle}>
          <Link to="/">首页</Link>&nbsp;&nbsp;&gt;&nbsp;&nbsp;
            <span>分类：{this.props.cate.name}</span>
        </div>
      )
    } else if (url.match('topic')) {
      title = (
        <div className={this.props.classes.listTitle}>
          <Link to="/">首页</Link>&nbsp;&nbsp;&gt;&nbsp;&nbsp;
          <span>话题：{this.props.topic.name}</span>
        </div>
      )
    } else {
      title = (
        <div className={this.props.classes.listTitle}>
          {'最新文章'}
        </div>
      )
    }
    return title
  }
}

ArticleListTittle = withStyles(articleListTittleStyle)(ArticleListTittle)


const articleListStyle = theme => ({
  paper: {
    paddingBottom: 8,
    marginBottom: 8,
  },
})


class ArticleList extends Component {
  constructor(props) {
    super(props)
    let { page, cate_id, topic_id } = this.getCurrentParams()
    this.state = {
      articleList: 'loading', pageInfo: { page: page },
      cate_id: cate_id, cate: {},
      topic_id: topic_id, topic: {},
    }
    this.getArticleList(page, cate_id, topic_id)
  }

  getCurrentParams() {
    // 获取当前的url参数，包括页码，分类id，话题id，非数字不匹配，默认为首页
    let r = this.props.location.search.match('page=\\d+')
    let page = (r ? parseInt(r[0].replace('page=', '')) : 1)
    let { cate_id, topic_id } = this.props.match.params
    if (cate_id) { cate_id = parseInt(cate_id) }
    if (topic_id) { topic_id = parseInt(topic_id) }
    return { page: page, cate_id: cate_id, topic_id: topic_id }
  }

  async getArticleList(page, cate_id, topic_id) {
    // 获取文章列表和分页信息，然后更改state
    let key = {}, cate = {}, topic = {}
    // 收集key用于获取文章列表
    page = (page ? page : 1)
    if (page) { key.page = page }
    if (cate_id) {
      key.cate_id = cate_id
      // 异步获取当前分类
      cate = await categoryManager.getItem(cate_id)
    } else if (topic_id) {
      key.topic_id = topic_id
      // 异步获取当前话题
      topic = await topicManager.getItem(topic_id)
    }
    key = JSON.stringify(key)
    // 异步获取文章列表
    let articleList = await articleManager.getList(key)
    let pageInfo = {
      page: page,
      pageSize: articleManager.pageInfo.pageSize,
      total: articleManager.pageInfo.total,
    }
    // 更新组件state
    this.setState({
      articleList: articleList, pageInfo: pageInfo,
      cate_id: cate_id, cate: cate,
      topic_id: topic_id, topic: topic,
    })
    window.state = this.state
  }

  render() {
    let { classes } = this.props
    let { articleList } = this.state
    let pageInfo = this.state.pageInfo
    let { page, cate_id, topic_id } = this.getCurrentParams()
    let loading = false

    // 切换页面时router会重用组件，不会调用construct方法
    // 会调用render方法，故需判断当前页面是否要重新渲染
    if ((page !== pageInfo.page) ||
      (cate_id !== this.state.cate_id) ||
      (topic_id !== this.state.topic_id)
    ) {
      loading = true
      this.getArticleList(page, cate_id, topic_id)
    }

    // 获取数据时显示加载中
    if (articleList === 'loading' || loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return (<Loading />)
    }

    // 获取文章列表出错时返回404
    if (!articleList) {
      return (<NotFound />)
    }

    let items = articleList.map((article, index) => {
      return (
        <ArticleListItem key={article.id} article={article} />
      )
    })

    let url = this.props.location.pathname
    if (!url.match('article')) {
      url += 'article/'
    }

    return (
      <Fade in>
        <Paper className={classes.paper}>
          <ArticleListTittle match={this.props.match}
            cate={this.state.cate} topic={this.state.topic} />
          <Grid container>
            {items}
          </Grid>
          <Pagination
            url={url}
            page={pageInfo.page}
            pageSize={pageInfo.pageSize}
            total={pageInfo.total}
          />
        </Paper>
      </Fade>
    )
  }
}


export default withStyles(articleListStyle)(ArticleList)
