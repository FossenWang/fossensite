import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { withStyles, Paper, Fade } from '@material-ui/core';

import { formatDate } from '../common/components'


const articleDetailStyle = theme => ({
  paper: {
    padding: '12px 10px',
    marginBottom: 8,
  },
  breadcrumb: {
    padding: '10px 16px',
    borderBottom: '1px solid lightgray',
  },
  article: {
    wordWrap: 'break-word', padding: '10px 15px'
  },
  cover: {
    marginTop: 10,
  },
  title: {
    fontSize: '1.5rem',
    margin: '1.5rem 0',
    fontWeight: '500',
  },
  info: {
    fontSize: '0.875rem',
    color: 'gray',
    marginBottom: '1.25rem',
  },
  content: {
    color: theme.palette.primary.contrastText,
    '& a': {
      color: theme.palette.text.secondary,
    },
    '& a:hover': {
      textDecoration: 'underline',
    },
    '& ul': {
      listStyle: 'disc',
      paddingLeft: '2rem',
      marginBottom: '1rem',
    },
    '& h5': {
      marginTop: '1.5rem',
      marginBottom: '1rem'
    },
    '& code': {
      wordWrap: 'normal',
      backgroundColor: '#f6f8fa',
    },
    '& img': { margin: 5 },
  }
})


class ArticleDetail extends Component {
  render() {
    let { classes } = this.props
    let article = this.getArticle()
    return (
      <Fade in>
        <Paper className={classes.paper}>
          <div className={classes.breadcrumb}>
            <Link to="/">首页</Link> &gt; <Link to="/article/category/2/">{article.cate}</Link>
          </div>
          <article className={classes.article}>
            {article.cover ?
              <div className={classes.cover}>
                <img src={article.cover} alt='' />
              </div> : null}
            <h1 className={classes.title}>{article.title}</h1>
            <div className={classes.info}>
              {formatDate(article.time)}
              &emsp;{article.views} 阅读&emsp;
            分类: {article.cate}&emsp;话题: {article.topic}
            </div>
            <div className={classes.content} dangerouslySetInnerHTML={{ __html: article.content }}></div>
          </article>
        </Paper>
      </Fade>
    )
  }
  getArticle() {
    return {
      id: 0,
      cover: 'https://www.fossen.cn/media/blog/cover/003-00_f5IFLQI.png',
      title: '标题',
      content: '内容\n<hr><h5>1、下载python源码</h5>',
      time: new Date(),
      views: 1,
      cate: '技术',
      topic: 'React',
      url: '/',
    }
  }
}


export default withStyles(articleDetailStyle)(ArticleDetail)
