import React, { Component } from 'react';
import { withStyles, Grid, Paper } from '@material-ui/core';

import { Pagination } from '../common/components'


const articleListStyle = theme => ({
  listTitle: {
    padding: '16px 24px',
  },
  paper: {
    width: '100%',
    paddingBottom: '8px',
  },
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


class ArticleList extends Component {
  render() {
    let { classes } = this.props
    let articleList = this.getArticleList()
    for (let i = 1; i < 5; i++) {
      articleList.push(articleList[0])
    }
    let items = articleList.map((article) => {
      return (
        <Grid key={article.id} component={'article'}
          item className={classes.article}>
          <div className={classes.title}>
            <a href={article.url}>{article.title}</a>
          </div>
          <div className={classes.content}>
            {article.content}
            <a href={article.url}>&emsp;阅读全文 &gt;</a>
          </div>
          <div className={classes.info}>
            {article.time.toString()}&emsp;{article.views} 阅读&emsp;
            分类: {article.cate}&emsp;话题: {article.topic}
          </div>
        </Grid>
      )
    })
    return (
      <Paper className={classes.paper}>
        <div className={classes.listTitle}>
          最新文章
        </div>
        <Grid container>
          {items}
        </Grid>
        <Pagination />
      </Paper>
    )
  }
  getArticleList() {
    return [
      {
        id: 1,
        title: '标题',
        content: '内容',
        time: Date.now(),
        views: 1,
        cate: '技术',
        topic: 'React',
        url: '/',
      },
    ]
  }
}


export default withStyles(articleListStyle)(ArticleList)
