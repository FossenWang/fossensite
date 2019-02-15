import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import withStyles from '@material-ui/core/styles/withStyles'
import Fade from '@material-ui/core/Fade/Fade'
import List from '@material-ui/core/List/List'
import ListItem from '@material-ui/core/ListItem/ListItem'
import ListItemText from '@material-ui/core/ListItemText/ListItemText'
import Paper from '@material-ui/core/Paper/Paper'


import { Pagination, Loading, withErrorBoundary, LoginNote, UserAvatar } from '../common/components'
import { parseUrlParams, formatDate, windowScrollTo } from '../common/tools'
import { Http404, HttpForbidden } from '../common/errors'
import { noticeManager, userManager } from '../resource/manager'


const noticeItemStyle = theme => ({
  itemText: {
    fontSize: '1rem',
    color: theme.palette.primary.contrastText,
  },
  time: {
    fontSize: '0.875rem',
    color: 'gray',
  },
})


class NoticeListItem extends Component {
  render() {
    let { notice, classes } = this.props
    let title
    if (notice.comment_id === null) {
      title = (
        <div>
          <a href={notice.user.github_url} target={"_blank"}>
            {notice.user.username}
          </a>&nbsp;评论了文章
          <Link to={`/article/${notice.article_id}/`}>
            《{notice.article__title}》
          </Link>
        </div>
      )
    } else {
      title = (
        <div>
          <a href={notice.user.github_url} target={"_blank"}>
            {notice.user.username}
          </a>&nbsp;在文章
          <Link to={`/article/${notice.article_id}/`}>
            《{notice.article__title}》
          </Link>中回复了你
        </div>
      )
    }
    return (
      <ListItem>
        <UserAvatar src={notice.user.avatar} />
        <ListItemText classes={{ primary: classes.itemText }}>
          {title}
          <div className={classes.time}>{formatDate(notice.time)}</div>
          <div>{notice.content}</div>
        </ListItemText>
      </ListItem>
    )
  }
}
NoticeListItem = withStyles(noticeItemStyle)(NoticeListItem)


const noticeListStyle = theme => ({
  listTitle: {
    padding: '16px 24px',
  },
  paper: {
    paddingBottom: 8,
    marginBottom: 8,
  },
  empty: {
    margin: '3rem 0',
    fontSize: '1.25rem',
    textAlign: 'center',
    justifyContent: 'center',
  },
})


class NoticeList extends Component {
  constructor(props) {
    super(props)
    let { page } = this.getCurrentParams()
    this.state = {
      login: true, noticeList: [], key: null,
      pageInfo: { page: page, total: 0, pageSize: 0 },
    }
  }
  componentDidMount() {
    // 注册登录和注销的回调
    userManager.callbacks.login['NoticeList'] = () => {
      this.setState({ login: true, key: null })
    }
    userManager.callbacks.logout['NoticeList'] = () => {
      this.setState({ login: false, key: null })
      noticeManager.cleanCaches()
    }
  }
  componentWillUnmount() {
    delete userManager.callbacks.login['NoticeList']
    delete userManager.callbacks.logout['NoticeList']
  }
  getCurrentParams() {
    // 获取当前的url参数
    let params = parseUrlParams(this.props.location.search)
    let { page } = params
    page = parseInt(page)
    page = (page ? page : 1)
    return { page: page }
  }
  async setNoticeList(page, key) {
    try {
      let noticeList = await noticeManager.getList(key)
      let pageInfo = Object.assign({ page: page }, noticeManager.pageInfo[key])
      // 更新组件state
      this.setState({
        noticeList: noticeList, pageInfo: pageInfo, key: key
      })
      userManager.readNotice()
    } catch (error) {
      if (error instanceof HttpForbidden) {
        this.setState({ login: false, key: null })
      } else {
        throw error
      }
    }
  }

  render() {
    let { classes } = this.props
    let { page } = this.getCurrentParams()
    let key = noticeManager.makeListKey(page)
    let { login } = this.state

    if (!login) {
      return (<LoginNote className={classes.paper} />)
    }

    if (key !== this.state.key) {
      this.setNoticeList(page, key)
      // 获取数据时显示加载中
      windowScrollTo()
      return (<Loading className={classes.paper} />)
    }

    let { noticeList, pageInfo } = this.state
    let items
    if (noticeList.length) {
      items = noticeList.map((notice) => {
        return (<NoticeListItem key={notice.id} notice={notice} />
        )
      })
    } else if (pageInfo.page !== 1) {
      throw new Http404()
    } else {
      items = (<ListItem className={classes.empty}>暂时没有通知</ListItem>)
    }
    return (
      <Fade in>
        <Paper className={classes.paper}>
          <div className={classes.listTitle}>通知</div>
          <List>{items}</List>
          <Pagination url={this.props.location.pathname} page={pageInfo.page}
            pageSize={pageInfo.pageSize} total={pageInfo.total} />
        </Paper>
      </Fade>
    )
  }
}
NoticeList = withErrorBoundary(withStyles(noticeListStyle)(NoticeList))


export { NoticeList }
