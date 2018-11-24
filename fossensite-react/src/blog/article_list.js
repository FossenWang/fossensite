import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { withStyles, Grid, Paper, Fade } from '@material-ui/core';

import { Pagination, dateFormator } from '../common/components'


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
  }
})


class ArticleListItem extends Component {
  render() {
    let { classes, article } = this.props
    return (
      <Grid component={'article'}
        item className={classes.article}>
        <div className={classes.title}>
          {/* <a href={article.url}>{article.title}</a> */}
          <Link to={article.url}>{article.title}</Link>
        </div>
        <div className={classes.content}>
          {article.content}
          {/* <a href={article.url}>&emsp;阅读全文 &gt;</a> */}
          <Link to={article.url}>&emsp;阅读全文 &gt;</Link>
        </div>
        <div className={classes.info}>
          {dateFormator(article.time)}
          &emsp;{article.views} 阅读&emsp;
        分类: {article.cate}&emsp;话题: {article.topic}
        </div>
      </Grid>
    )
  }
}

ArticleListItem = withStyles(articleListItemStyle)(ArticleListItem)


class ArticleList extends Component {
  render() {
    let { classes } = this.props
    let articleList = this.getArticleList()
    let items = articleList.map((article, index) => {
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
          <Pagination page={1} pageSize={10} total={99} />
        </Paper>
      </Fade>
    )
  }
  getArticleList() {
    let articleList = [
      {
        id: 0,
        cover: 'https://www.fossen.cn/media/blog/cover/003-00_f5IFLQI.png',
        title: '标题',
        content: '内容',
        time: new Date(),
        views: 1,
        cate: '技术',
        topic: 'React',
        url: '/article/0/',
      },
    ]
    for (let i = 1; i < 5; i++) {
      let copy = Object.assign({}, articleList[0])
      articleList.push(copy)
      articleList[i].id = i
    }
    return articleList
  }
}


export default withStyles(articleListStyle)(ArticleList)
