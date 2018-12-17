import React, { Component, Fragment } from 'react';
import {
  withStyles, Button, List, ListItem,
  ListItemText, Grid, Dialog,
} from '@material-ui/core';

import { commentManager, userManager } from '../resource/manager';
import { UserAvatar, Loading } from '../common/components'
import { formatDate } from '../common/tools';
import { GlobalContext } from '../common/context';


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
  form: {
    margin: '6px 16px 0',
    '@media (min-width: 960px)': {
      minWidth: 360,
    }
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


class ReplyForm extends Component {
  static contextType = CommentContext
  submit = (e) => {
    e.preventDefault()
    let content = e.target.elements.content.value
    this.createReply(content, e.target.elements.content)
  }
  createReply = async (content, textarea) => {
    let msgAnchor = { vertical: 'bottom', horizontal: 'center' }
    if (this.submiting) {
      this.context.flashMessage.current.open('正在提交中, 请稍后...', msgAnchor)
      return
    }
    this.submiting = true
    try {
      let newReply = await commentManager.createReply(
        content, this.context.articleId, this.props.replyTo)
      textarea.value = null
      this.context.flashMessage.current.open('回复成功！', msgAnchor)
      this.context.insertReply(newReply)
    } catch {
      this.context.flashMessage.current.open('好像出了点错~', msgAnchor)
    } finally {
      this.submiting = false
      this.context.replyForm.current.close()
    }
  }
  render() {
    let { classes, replyTo } = this.props
    return (
      <form onSubmit={this.submit} className={classes.form}>
        <textarea name="content" maxLength="500" required placeholder="写下你的评论..."
          className={classes.textarea + ' ' + classes.replyTextarea} />
        <div className={classes.submit}>
          <input id='replyForm' type="submit" value="评论" className={classes.hiddenInput} />
          <span><i className="fa fa-reply"></i> 回复 {replyTo.user.username}</span>&emsp;
          <span onClick={() => {
            this.context.replyForm.current.close()
          }} className={classes.cancel}>取消</span>&emsp;
          <label htmlFor='replyForm'>
            <Button component="span" size="small" variant="outlined"
              className={classes.button}>评论</Button>
          </label>
        </div>
      </form>
    )
  }
}
ReplyForm = withFormStyle(ReplyForm)


class ReplyFormDialog extends Component {
  constructor(props) {
    super(props)
    this.state = { open: false, replyTo: {} }
  }
  open = (replyTo) => {
    this.setState({ open: true, replyTo: replyTo })
  }
  close = () => {
    if (this.state.open) {
      this.setState({ open: false })
    }
  }
  render() {
    return (
      <Dialog open={this.state.open} onClose={this.close} >
        <ReplyForm replyTo={this.state.replyTo} />
      </Dialog>
    )
  }
}


class CommentForm extends Component {
  static contextType = CommentContext
  submit = (e) => {
    e.preventDefault()
    let { articleId } = this.props
    let content = e.target.elements.content.value
    this.createComment(content, articleId, e.target.elements.content)
  }
  createComment = async (content, articleId, textarea) => {
    let msgAnchor = { vertical: 'bottom', horizontal: 'center' }
    if (this.submiting) {
      this.context.flashMessage.current.open('正在提交中, 请稍后...', msgAnchor)
      return
    }
    this.submiting = true
    try {
      let newComment = await commentManager.createComment(content, articleId)
      textarea.value = null
      this.context.resetComment(newComment)
      this.context.flashMessage.current.open('评论成功！', msgAnchor)
    } finally {
      this.submiting = false
    }
  }
  render() {
    let { classes, login } = this.props
    if (!login) {
      return (
        <Grid container className={classes.loginToComment}>
          <GlobalContext.Consumer>
            {global => (
              <Button onClick={() => { global.loginDialog.current.openDialog() }}>
                登录
              </Button>
            )}
          </GlobalContext.Consumer>
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
  info: {
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
  static contextType = CommentContext
  deleteReply = async (commentId, replyId) => {
    let msgAnchor = { vertical: 'bottom', horizontal: 'center' }
    if (this.submiting) {
      this.context.flashMessage.current.open('删除中, 请稍后...', msgAnchor)
      return
    }
    this.submiting = true
    try {
      let code = await commentManager.deleteReply(replyId, this.context.articleId)
      if (code === 204) {
        this.context.deleteReply(commentId, replyId)
        this.context.flashMessage.current.open('删除评论成功！', msgAnchor)
      }
    } finally {
      this.submiting = false
    }
  }
  render() {
    let { classes, replyList, currentUser } = this.props
    if (replyList.length === 0) {
      return null
    }
    let items = replyList.map((reply) => {
      return (
        <ListItem disableGutters key={reply.id} className={classes.item}>
          <UserAvatar src={reply.user.avatar} />
          <ListItemText classes={{ primary: classes.text }}>
            <div>
              <a href={reply.user.github_url} target={"_blank"} >
                {reply.user.username}
              </a>
              {reply.reply_id ?
                <Fragment>
                  <span className={classes.info}> 回复 </span>
                  <a href={reply.reply_user.github_url} target={"_blank"} >
                    {reply.reply_user.username}
                  </a>
                </Fragment> : null}
            </div>
            <div className={classes.content}>
              {reply.content}
            </div>
            <div className={classes.info}>
              <span>{formatDate(reply.time)}</span>&emsp;
              {currentUser.id ?
                <span onClick={() => {
                  this.context.replyForm.current.open(reply)
                }} className={classes.reply}>
                  <i className="fa fa-reply"></i> 回复
                </span> : null}&emsp;
              {currentUser.id === reply.user.id ?
                <span
                  onClick={() => { this.deleteReply(reply.comment_id, reply.id) }}
                  className={classes.delete}>
                  <i className="fa fa-trash"></i> 删除
                </span> : null}
            </div>
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
    let msgAnchor = { vertical: 'bottom', horizontal: 'center' }
    if (this.submiting) {
      this.context.flashMessage.current.open('删除中, 请稍后...', msgAnchor)
      return
    }
    this.submiting = true
    try {
      let code = await commentManager.deleteComment(commentId, this.context.articleId)
      if (code === 204) {
        this.context.resetComment()
        this.context.flashMessage.current.open('删除评论成功！', msgAnchor)
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
            <div className={classes.info}>
              <span>{formatDate(comment.time)}</span>&emsp;
              {currentUser.id ?
                <span onClick={() => {
                  this.context.replyForm.current.open(comment)
                }} className={classes.reply}>
                  <i className="fa fa-reply"></i> 回复
                </span> : null}&emsp;
              {currentUser.id === comment.user.id ?
                <span className={classes.delete}
                  onClick={() => { this.deleteComment(comment.id) }}>
                  <i className="fa fa-trash"></i> 删除
                </span> : null}
            </div>
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
  componentDidMount() {
    userManager.callbacks.login['ArticleComment'] = this.resetCurrentUser
    userManager.callbacks.logout['ArticleComment'] = this.resetCurrentUser
  }
  componentWillUnmount() {
    delete userManager.callbacks.login['ArticleComment']
    delete userManager.callbacks.logout['ArticleComment']
  }
  setCurrentUser = async () => {
    let currentUser = await userManager.getCurrentUser()
    this.setState({ currentUser: currentUser })
  }
  resetCurrentUser = (user) => {
    this.setState({ currentUser: user })
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
  insertReply = (newReply) => {
    let { commentList } = this.state
    for (let i in commentList) {
      if (newReply.comment_id === commentList[i].id) {
        commentList[i].reply_list.push(newReply)
        this.setState({ commentList: commentList })
        break
      }
    }
  }
  deleteReply = (commentId, replyId) => {
    let { commentList } = this.state
    for (let i in commentList) {
      if (commentId === commentList[i].id) {
        let replyList = commentList[i].reply_list
        let deleteIds = { [replyId]: true }
        for (let j in replyList) {
          // 如果评论j的回复对象的id在删除名单里，则把j的id也添加进删除名单
          if (deleteIds[replyList[j].reply_id]) {
            deleteIds[replyList[j].id] = true
          }
        }
        for (let j = replyList.length - 1; j >= 0; j--) {
          if (deleteIds[replyList[j].id]) {
            replyList.splice(j, 1)
          }
        }
        this.setState({ commentList: commentList })
        break
      }
    }
  }
  static contextType = GlobalContext
  render() {
    let { classes, articleId } = this.props
    let { commentList, pageInfo, loading, currentUser } = this.state
    let replyForm = React.createRef()
    let context = {
      resetComment: this.resetComment,
      insertReply: this.insertReply,
      deleteReply: this.deleteReply,
      flashMessage: this.context.flashMessage,
      replyForm: replyForm,
      articleId: articleId,
    }
    return (
      <CommentContext.Provider value={context}>
        <div className={classes.comment}>
          <div className={classes.title}>{pageInfo.totalCommentAndReply}条评论</div>
          <CommentForm articleId={articleId} login={currentUser.id} />
          <CommentList commentList={commentList}
            pageInfo={pageInfo} currentUser={currentUser} />
          {loading ? <Loading elevation={0} /> : null}
          {currentUser.id ? <ReplyFormDialog ref={replyForm} /> : null}
        </div>
      </CommentContext.Provider>
    )
  }
}
ArticleComment = withStyles(commentStyle)(ArticleComment)


export { ArticleComment }
