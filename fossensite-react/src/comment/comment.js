import React, { Component } from 'react';
// import { Link } from "react-router-dom";
import {
  withStyles, Button, List, ListItem,
  ListItemText, Snackbar,
  Grid,
} from '@material-ui/core';

import { commentManager, userManager } from '../resource/manager';
import { UserAvatar, Loading } from '../common/components'
import { formatDate } from '../common/tools';


const CommentContext = React.createContext();


const commentFormStyle = theme => ({
  hiddenInput: {
    display: 'none',
  },
  submit: {
    textAlign: 'right',
    marginBottom: 16,
    '&>span': {
      fontSize: '0.875rem',
      color: 'gray',
    }
  },
  button: {
    borderColor: theme.palette.text.secondary,
    color: theme.palette.text.secondary,
    minWidth: 48,
    lineHeight: 1,
  },
  textarea: {
    boxSizing: 'border-box',
    overflow: 'auto',
    resize: 'vertical',
    marginBottom: 10,
    padding: 10,
    width: '100%',
    height: '8rem',
    borderRadius: 4,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
  },
  replyTextarea: {
    height: '5rem',
    marginTop: 10,
  },
  cancel: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.text.primary,
    },
  },
  loginToComment: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    height: '8rem',
    border: '1px solid lightgray',
    borderRadius: 4,
  },
})
const withFormStyle = withStyles(commentFormStyle)


class CommentForm extends Component {
  static contextType = CommentContext
  submit = (e) => {
    e.preventDefault()
    let { articleId } = this.props
    let content = e.target.elements.content.value
    this.createComment(content, articleId, e.target.elements.content)
  }
  createComment = async (content, articleId, textarea) => {
    if (this.submiting) {
      this.context.snackbar.current.openSnackbar('正在提交中, 请稍后...')
      return
    }
    this.submiting = true
    try {
      let newComment = await commentManager.createComment(content, articleId)
      textarea.value = null
      this.context.resetComment(newComment)
      this.context.snackbar.current.openSnackbar('评论成功！')
    } finally {
      this.submiting = false
    }
  }
  render() {
    let { classes, login } = this.props
    if (!login) {
      return (
        <Grid container className={classes.loginToComment}>
          <Button onClick={() => { userManager.openLoginDialog() }}>登录</Button>
        </Grid>
      )
    }
    return (
      <form id="comment_form" onSubmit={this.submit}>
        <textarea name="content" maxLength="500" required
          id="id_content" placeholder="写下你的评论..."
          className={classes.textarea} />
        <div className={classes.submit}>
          <input id='comment_submit' type="submit" className={classes.hiddenInput} />
          <label htmlFor="comment_submit">
            <Button component="span" size="small" variant="outlined"
              className={classes.button}>评论</Button>
          </label>
        </div>
      </form>
    )
  }
}
CommentForm = withFormStyle(CommentForm)


class ReplyForm extends Component {
  constructor(props) {
    super(props)
    this.state = { open: false }
    if (this.props.reference) {
      this.props.reference.openReplyForm = this.open
    }
  }
  open = () => {
    if (!this.state.open) {
      this.setState({ open: true })
    }
  }
  close = () => {
    if (this.state.open) {
      this.setState({ open: false })
    }
  }
  render() {
    let { open } = this.state
    if (!open) {
      return null
    }
    let { classes, replyTo } = this.props
    let inputId = `cid${replyTo.id}`
    return (
      <form action="/article/comment/reply/create/" method="post">
        <textarea name="content" maxLength="500" required placeholder="写下你的评论..."
          className={classes.textarea + ' ' + classes.replyTextarea} />
        <div className={classes.submit}>
          <input id={inputId} type="submit" value="评论" className={classes.hiddenInput} />
          <span><i className="fa fa-reply"></i> 回复 {replyTo.user.username}</span>&emsp;
          <span onClick={this.close} className={classes.cancel}>取消</span>&emsp;
          <label htmlFor={inputId}>
            <Button component="span" size="small" variant="outlined"
              className={classes.button}>评论</Button>
          </label>
        </div>
      </form>
    )
  }
}
ReplyForm = withFormStyle(ReplyForm)


const commentListStyle = theme => ({
  item: {
    paddingTop: 16,
    paddingBottom: 16,
    borderTop: '1px solid lightgray',
    alignItems: 'flex-start',
  },
  text: {
    color: theme.palette.primary.contrastText,
    fontSize: '1rem',
    lineHeight: 'auto',
  },
  content: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    paddingTop: 8,
  },
  number: {
    fontSize: '0.875rem',
    color: 'gray',
    float: 'right',
  },
  time: {
    fontSize: '0.875rem',
    color: 'gray',
  },
  empty: {
    padding: '16px 0',
  },
  reply: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.text.primary,
    },
  },
  delete: {
    cursor: 'pointer',
    opacity: 0,
    '&:hover': {
      opacity: 1,
      color: theme.palette.text.primary,
    }
  }
})


class ReplyList extends Component {
  render() {
    let { classes, replyList, currentUser } = this.props
    if (replyList.length === 0) {
      return null
    }
    let items = replyList.map((reply) => {
      let reference = { openReplyForm: null }
      return (
        <ListItem disableGutters key={reply.id} className={classes.item}>
          <UserAvatar src={reply.user.avatar} />
          <ListItemText classes={{ primary: classes.text }}>
            <div>
              <a href={reply.user.github_url} target={"_blank"} >
                {reply.user.username}
              </a>
            </div>
            <div className={classes.content}>
              {reply.content}
            </div>
            <div className={classes.time}>
              <span>{formatDate(reply.time)}</span>&emsp;
              {currentUser.id ? <span onClick={() => { reference.openReplyForm() }} className={classes.reply}>
                <i className="fa fa-reply"></i> 回复
              </span> : null}&emsp;
              {currentUser.id === reply.user.id ?
                <span className={classes.delete}>
                  <i className="fa fa-trash"></i> 删除
                </span> : null}
            </div>
            {currentUser.id ? <ReplyForm reference={reference} replyTo={reply} /> : null}
          </ListItemText>
        </ListItem>
      )
    })
    return (
      <List>
        {items}
      </List>
    )
  }
}


class CommentList extends Component {
  static contextType = CommentContext

  deleteComment = async (commentId) => {
    if (this.submiting) {
      this.context.snackbar.current.openSnackbar('删除中, 请稍后...')
      return
    }
    this.submiting = true
    try {
      let code = await commentManager.deleteComment(commentId, this.context.articleId)
      if (code === 204) {
        this.context.resetComment()
        this.context.snackbar.current.openSnackbar('删除评论成功！')
      }
    } finally {
      this.submiting = false
    }
  }
  render() {
    let { classes, commentList, pageInfo, currentUser } = this.props
    if (commentList.length === 0) {
      return <div className={classes.empty}>暂时没有评论</div>
    }
    let number = pageInfo.total
    let items = commentList.map(comment => {
      let reference = { openReplyForm: null }
      return (
        <ListItem disableGutters key={comment.id} className={classes.item}>
          <UserAvatar src={comment.user.avatar} />
          <ListItemText classes={{ primary: classes.text }}>
            <div>
              <a href={comment.user.github_url} target={"_blank"} >
                {comment.user.username}
              </a>
              <span className={classes.number}>#{number--}</span>
            </div>
            <div className={classes.content}>
              {comment.content}
            </div>
            <div className={classes.time}>
              <span>{formatDate(comment.time)}</span>&emsp;
              {currentUser.id ? <span onClick={() => { reference.openReplyForm() }} className={classes.reply}>
                <i className="fa fa-reply"></i> 回复
              </span> : null}&emsp;
              {currentUser.id === comment.user.id ?
                <span className={classes.delete}
                  onClick={() => { this.deleteComment(comment.id) }}>
                  <i className="fa fa-trash"></i> 删除
                </span> : null}
            </div>
            {currentUser.id ? <ReplyForm reference={reference} replyTo={comment} /> : null}
            <ReplyList replyList={comment.reply_list} currentUser={currentUser} classes={classes}></ReplyList>
          </ListItemText>
        </ListItem>
      )
    })
    return (
      <List>
        {items}
      </List>
    )
  }
}
CommentList = withStyles(commentListStyle)(CommentList)


const commentStyle = theme => ({
  comment: {
    padding: '8px 24px',
  },
  title: {
    padding: '16px 0',
    fontSize: '1.2rem',
    borderTop: '1px solid lightgray',
  },
})


class CommentMsg extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnackbar: false,
      snackbarMsg: '',
    }
  }
  closeSnackbar = () => {
    this.setState({ openSnackbar: false })
  }
  openSnackbar = (msg) => {
    this.setState({ openSnackbar: true, snackbarMsg: msg })
  }
  render() {
    return (
      <Snackbar
        open={this.state.openSnackbar}
        onClose={this.closeSnackbar}
        autoHideDuration={2000}
        message={this.state.snackbarMsg} />
    )
  }
}


class ArticleComment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      commentList: [],
      currentUser: { id: null },
      pageInfo: {
        pageSize: 10,
        total: 0,
        page: 0,
        totalCommentAndReply: 0,
      },
      loaded: false,
    }
    this.setCurrentUser()
    this.bindScroll()
  }
  static contextType = CommentContext
  resetComment = () => {
    window.onscroll = null
    this.bindScroll()
    this.setState({
      commentList: [],
      pageInfo: {
        pageSize: 10,
        total: 0,
        page: 0,
        totalCommentAndReply: 0,
      },
      loading: true,
      loaded: false,
    })
    this.setComments(1).then(() => {
      let { page, lastPage } = this.getCurrentParams()
      if (page >= lastPage) {
        // 加载完最后一页即取消监听滚动事件
        window.onscroll = null
      }
    })
  }
  componentDidMount() {
    userManager.callbacks.login['ArticleComment'] = this.setCurrentUser
    userManager.callbacks.logout['ArticleComment'] = this.setCurrentUser
  }
  componentWillUnmount() {
    delete userManager.callbacks.login['ArticleComment']
    delete userManager.callbacks.logout['ArticleComment']
  }
  setCurrentUser = async () => {
    let currentUser = await userManager.getCurrentUser(true)
    this.setState({ currentUser: currentUser })
  }
  bindScroll() {
    let _this = this
    window.onscroll = function (e) {
      let docHeight = document.body.clientHeight
      let scrollBottom = window.scrollY + window.innerHeight
      let { loading } = _this.state
      if ((docHeight - scrollBottom < 100) && !loading) {
        let { page } = _this.getCurrentParams()
        if (_this.state.loaded) { page++ }
        _this.setState({ loading: true })
        _this.setComments(page).then(() => {
          let { page, lastPage } = _this.getCurrentParams()
          if (page >= lastPage) {
            // 加载完最后一页即取消监听滚动事件
            window.onscroll = null
          }
        })
      }
    }
  }
  getCurrentParams() {
    let { pageSize, total, page } = this.state.pageInfo
    page = page ? page : 1
    let lastPage = total ? Math.ceil(total / pageSize) : 1
    return { page: page, lastPage: lastPage }
  }
  setComments = async (page) => {
    let { articleId } = this.props
    let key = commentManager.makeListKey(articleId, page)
    let list = await commentManager.getList(key)
    let pageInfo = commentManager.pageInfo[key]

    this.setState(state => {
      state.commentList.push(...list)
      return {
        commentList: state.commentList, pageInfo: pageInfo,
        loading: false, loaded: true,
      }
    })
  }
  render() {
    let { classes, articleId } = this.props
    let { commentList, pageInfo, loading, currentUser } = this.state
    let snackbar = React.createRef()
    return (
      <CommentContext.Provider value={{
        resetComment: this.resetComment,
        snackbar: snackbar,
        articleId: articleId,
      }}>
        <div className={classes.comment}>
          <div className={classes.title}>{pageInfo.totalCommentAndReply}条评论</div>
          <CommentForm articleId={articleId} login={currentUser.id} />
          <CommentList commentList={commentList}
            pageInfo={pageInfo} currentUser={currentUser} />
          {loading ? <Loading elevation={0} /> : null}
          <CommentMsg ref={snackbar} />
        </div>
      </CommentContext.Provider>
    )
  }
}
ArticleComment = withStyles(commentStyle)(ArticleComment)


export { ArticleComment }
