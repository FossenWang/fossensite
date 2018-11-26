import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import { withStyles, Grid, Paper, Fade } from '@material-ui/core';

import { Pagination, NotFound, formatDate, Loading } from '../common/components'
import { articleManager } from '../resource/manager'


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
    let pathname = this.props.location.pathname
    if (pathname.match('category')) {
      title = (
        <div className={this.props.classes.listTitle}>
          <Link to="/">首页</Link> &gt; <Link to="/article/category/2/">{'分类'}</Link>
        </div>
      )
    } else if (pathname.match('topic')) {
      title = (
        <div className={this.props.classes.listTitle}>
          <Link to="/">首页</Link> &gt; <Link to="/article/topic/2/">{'话题'}</Link>
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
    let page = this.getCurrentPage()
    this.state = { articleList: 'loading', pageInfo: { page: page }}
    this.getArticleList(page)
  }

  getCurrentPage() {
    // 获取当前页码，非数字不匹配，默认为首页
    let r = this.props.location.search.match('page=\\d+')
    let page = (r ? parseInt(r[0].replace('page=', '')) : 1)
    return page
  }

  async getArticleList(page) {
    // 获取文章列表和分页信息，然后更改state
    page = (page ? page : 1)
    let articleList = await articleManager.getList(page)
    let pageInfo = {
      page: page,
      pageSize: articleManager.pageInfo.pageSize,
      total: articleManager.pageInfo.total,
    }
    this.setState({ articleList: articleList, pageInfo: pageInfo })
  }

  render() {
    let { classes } = this.props
    let { articleList } = this.state
    let pageInfo = this.state.pageInfo
    let page = this.getCurrentPage()
    let loading = false

    // 重新渲染时需判断当前页面是否要更新
    if (page !== pageInfo.page) {
      loading = true
      this.getArticleList(page)
    }

    // 获取文章列表出错时返回404
    if (!articleList) {
      return (<NotFound />)
    }

    // 获取数据时显示加载中
    if (articleList === 'loading' || loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return (
        <Loading />
      )
    }

    let items = articleList.map((article, index) => {
      return (
        <ArticleListItem key={article.id} article={article} />
      )
    })

    return (
      <Fade in>
        <Paper className={classes.paper}>
          <ArticleListTittle location={this.props.location} />
          <Grid container>
            {items}
          </Grid>
          <Pagination
            url={this.props.location.pathname}
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
