import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import { withStyles, Paper, Fade } from '@material-ui/core';

import { Loading, withErrorBoundary } from '../common/components'
import { formatDate } from '../common/tools'
import { articleManager } from '../resource/manager'
import { ArticleComment } from '../comment/comment';


const articleInfoStyle = theme => ({
  info: {
    fontSize: '0.875rem',
    color: 'gray',
    wordBreak: 'keep-all',
    '& a': {
      color: 'gray',
    },
  },
})


class ArticleInfo extends Component {
  render() {
    let article = this.props.article
    return (
      <div className={this.props.classes.info}>
        {formatDate(article.pub_date)}&emsp;
        {article.views} 阅读&emsp;
        分类: {this.formatCategory(article.category)}&emsp;
        话题: {this.formatTopics(article.topics)}
      </div>
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

ArticleInfo = withStyles(articleInfoStyle)(ArticleInfo)


const articleDetailStyle = theme => ({
  paper: {
    marginBottom: 8,
  },
  breadcrumb: {
    padding: '16px 24px',
  },
  article: {
    borderTop: '1px solid lightgray',
    wordWrap: 'break-word',
    padding: '10px 15px',
    margin: '0 10px',
  },
  cover: {
    marginTop: 10,
  },
  title: {
    fontSize: '1.5rem',
    margin: '1.5rem 0',
    fontWeight: '500',
  },
  content: {
    marginTop: '1.25rem',
    color: theme.palette.primary.contrastText,
    '& p': {
      marginTop: 0,
      marginBottom: '1rem',
    },
    '& hr': {
      marginTop: '1rem',
      marginBottom: '1rem',
      border: 0,
      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    },
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
    "& pre": {
      marginTop: 0,
      marginBottom: '1rem',
      overflow: 'auto',
    },
    '& code': {
      fontSize: '87.5%',
      color: '#e83e8c',
      backgroundColor: '#f6f8fa',
      wordBreak: 'break-word',
      fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    '& pre code': {
      overflowX: 'auto',
      display: 'block',
      wordWrap: 'normal',
      color: '#4d4d4c',
      padding: '0.5rem',
    },
    '& img': { margin: 5 },
    '& blockquote': {
      borderLeft: '0.4rem solid #ddd',
      padding: '0.5rem 0 0.5rem 0.8rem',
      margin: '1rem 0 1rem 0.8rem',
    },
    '& blockquote>p': { margin: 0 }
  }
})


class ArticleDetail extends Component {
  constructor(props) {
    super(props)
    this.state = { article: {} }
    // this.setArticle()
  }

  async setArticle() {
    let aid = parseInt(this.props.match.params.id)
    let article = await articleManager.getItem(aid)
    this.setState({ article: article })
  }

  componentDidMount() {
    this.loadHighLightJS()
  }

  componentDidUpdate() {
    this.codeHighLight()
  }

  codeHighLight() {
    // 有文章内容且hljs加载完毕时，执行代码高亮
    if (!this.state.article.content || !window.hljs) {
      return null
    }
    let codes = document.querySelectorAll('pre code')
    for (let i = 0; i < codes.length; i++) {
      window.hljs.highlightBlock(codes[i])
    }
  }

  loadHighLightJS() {
    // 加载highlight.js脚本
    let script = document.getElementById('hljs')
    if (script) {
      return null
    }
    let body = document.getElementsByTagName('body')[0]
    let hlcss = document.createElement('link')
    let codeHighLight = this.codeHighLight.bind(this)
    hlcss.rel = 'stylesheet'
    hlcss.href = 'https://cdn.bootcss.com/highlight.js/9.12.0/styles/tomorrow.min.css'
    // <link href="https://cdn.bootcss.com/highlight.js/9.12.0/styles/tomorrow.min.css" rel="stylesheet" />
    hlcss.onload = () => {
      // css加载完后加载js
      script = document.createElement('script')
      script.id = 'hljs'
      script.src = 'https://cdn.bootcss.com/highlight.js/9.12.0/highlight.min.js'
      // <script src="https://cdn.bootcss.com/highlight.js/9.12.0/highlight.min.js"></script>
      script.onload = codeHighLight
      body.appendChild(script)
    }
    body.appendChild(hlcss)
  }

  render() {
    let { classes, match } = this.props
    let { article } = this.state
    if (article.id !== parseInt(match.params.id)) {
      this.setArticle()
      return <Loading />
    }
    return (
      <Fade in>
        <Paper className={classes.paper}>
          <div className={classes.breadcrumb}>
            <Link to="/">首页</Link>&nbsp;&nbsp;&gt;&nbsp;&nbsp;
            <Link to={`/article/category/${article.category.id}/`}>分类：{article.category.name}</Link>
          </div>
          <article className={classes.article}>
            {article.cover ?
              <div className={classes.cover}>
                <img src={article.cover} alt='' />
              </div> : null}
            <h1 className={classes.title}>{article.title}</h1>
            <ArticleInfo article={article} />
            <div className={classes.content} dangerouslySetInnerHTML={{ __html: article.content }}></div>
          </article>
          <ArticleComment articleId={article.id} />
        </Paper>
      </Fade>
    )
  }
}


export default withErrorBoundary(withStyles(articleDetailStyle)(ArticleDetail))
export { ArticleInfo }
