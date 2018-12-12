import React, { Component } from 'react';
// import { Link } from "react-router-dom";
import {
  withStyles, Button, List, ListItem,
  ListItemText,
} from '@material-ui/core';

import { commentManager, userManager } from '../resource/manager';
import { UserAvatar, Loading } from '../common/components'
import { formatDate } from '../common/tools';


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
})
const withFormStyle = withStyles(commentFormStyle)


class CommentForm extends Component {
  submit = (e) => {
    e.preventDefault()
    let { articleId } = this.props
    let content = e.target.elements.content.value
    this.createComment(content, articleId)
  }
  createComment = async (content, articleId) => {
    let newComment = await commentManager.createComment(content, articleId)
    console.log(newComment)
  }
  render() {
    let { classes } = this.props
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
  open = ()=>{
    if (!this.state.open){
      this.setState({open: true})
    }
  }
  close = ()=>{
    if (this.state.open){
      this.setState({open: false})
    }
  }
  render() {
    let { open } = this.state
    if (!open) {
      return null
    }
    let { classes, replyTo } = this.props
    console.log(replyTo)
    let inputId = `cid${replyTo.id}`
    return (
      <form action="/article/comment/reply/create/" method="post">
        <textarea name="content" maxLength="500" required placeholder="写下你的评论..."
          className={classes.textarea +' '+ classes.replyTextarea} />
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
      let reference = {openReplyForm: null}
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
              <span onClick={()=>{reference.openReplyForm()}} className={classes.reply}>
                <i className="fa fa-reply"></i> 回复
              </span>&emsp;
              {currentUser.id === reply.user.id ?
                <span className={classes.delete}>
                  <i className="fa fa-trash"></i> 删除
                </span> : null}
            </div>
            <ReplyForm reference={reference} replyTo={reply} />
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
  delete = async (commentId) => {
    let code = await commentManager.deleteComment(commentId)
    if (code === 204) {
      console.log('delete')
    }
    console.log(code)
  }
  render() {
    let { classes, commentList, pageInfo, currentUser } = this.props
    if (commentList.length === 0) {
      return <div className={classes.empty}>暂时没有评论</div>
    }
    let number = pageInfo.total
    let items = commentList.map(comment => {
      let reference = {openReplyForm: null}
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
              <span onClick={()=>{reference.openReplyForm()}} className={classes.reply}>
                <i className="fa fa-reply"></i> 回复
              </span>&emsp;
              {currentUser.id === comment.user.id ?
                <span className={classes.delete}
                  onClick={() => {this.delete(comment.id)}}>
                  <i className="fa fa-trash"></i> 删除
                </span> : null}
            </div>
            <ReplyForm reference={reference} replyTo={comment} />
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
      articleId: this.props.articleId,
      commentList: [],
      currentUser: {id: null},
      pageInfo: {
        pageSize: 10,
        total: 0,
        totalCommentAndReply: 0
      },
    }
    this.bindScroll()
  }
  bindScroll() {
    let _this = this
    window.onscroll = function (e) {
      let docHeight = document.body.clientHeight
      let scrollBottom = window.scrollY + window.innerHeight
      let { loading } = _this.state
      if ((docHeight - scrollBottom < 100) && !loading) {
        let { page, lastPage } = _this.getCurrentParams()
        _this.setState({ loading: true })
        _this.setComments(page + 1).then(() => {
          let { page, lastPage } = _this.getCurrentParams()
          if (page >= lastPage) {
            // 加载完最后一页即取消监听滚动事件
            window.onscroll = null
          }
        })
        console.log('scroll', page, lastPage, _this.state, _this)
      }
    }
  }
  getCurrentParams() {
    let length = this.state.commentList.length
    let { pageSize, total } = this.state.pageInfo
    let page = Math.ceil(length / pageSize)
    let lastPage = total ? Math.ceil(total / pageSize) : 1
    return { page: page, lastPage: lastPage }
  }
  setComments = async (page) => {
    let { articleId } = this.state
    let key = commentManager.makeListKey(articleId, page)
    let list = await commentManager.getList(key)
    let pageInfo = commentManager.pageInfo[key]
    let currentUser = await userManager.getCurrentUser()

    this.setState(state => {
      state.commentList.push(...list)
      return {
        commentList: state.commentList, pageInfo: pageInfo,
        loading: false, currentUser: currentUser,
      }
    })
    console.log(list, pageInfo, currentUser)
  }
  render() {
    let { classes } = this.props
    let { commentList, pageInfo, loading, currentUser, articleId } = this.state
    return (
      <div className={classes.comment}>
        <div className={classes.title}>{pageInfo.totalCommentAndReply}条评论</div>
        <CommentForm articleId={articleId} />
        <CommentList commentList={commentList}
          pageInfo={pageInfo} currentUser={currentUser} />
        {loading ? <Loading elevation={0} /> : null}
      </div>
    )
  }
}
ArticleComment = withStyles(commentStyle)(ArticleComment)


export { ArticleComment }
