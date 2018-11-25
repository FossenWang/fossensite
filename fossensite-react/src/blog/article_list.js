import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import { withStyles, Grid, Paper, Fade } from '@material-ui/core';

import { Pagination, formatDate } from '../common/components'
import { articleManager } from '../resource/manager'


const articleListStyle = theme => ({
  listTitle: {
    padding: '16px 24px',
  },
  paper: {
    paddingBottom: 8,
    marginBottom: 8,
  },
})


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


class ArticleList extends Component {
  constructor(props) {
    super(props)
    this.state = { articleList: {} }
    this.getArticleList()
  }
  render() {
    let { classes } = this.props
    let { articleList } = this.state
    if (articleList.data === undefined) {
      return (
        <Fade in>
          <Paper className={classes.paper}>
            <Grid container justify={'center'}>
              {'加载中...'}
            </Grid>
          </Paper>
        </Fade>
      )
    }
    let pageInfo = articleList.pageInfo
    window.a = articleList
    let items = articleList.data.map((article, index) => {
      return (
        <ArticleListItem key={article.id} article={article} />
      )
    })
    return (
      <Fade in>
        <Paper className={classes.paper}>
          <div className={classes.listTitle}>
            最新文章
        </div>
          <Grid container>
            {items}
          </Grid>
          <Pagination page={pageInfo.page} pageSize={pageInfo.pageSize} total={pageInfo.total} />
        </Paper>
      </Fade>
    )
  }
  getArticleList = async (page) => {
    let articleList = await articleManager.getListData(page)
    console.log('articleList', articleList)
    this.setState({ articleList: articleList })
    return articleList
  }
}


export default withStyles(articleListStyle)(ArticleList)
