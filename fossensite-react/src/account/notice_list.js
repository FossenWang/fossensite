import React, { Component } from 'react';
import { withStyles, Grid, Paper, Fade } from '@material-ui/core';

import { Pagination, Loading, withErrorBoundary } from '../common/components'
import { parseUrlParams } from '../common/tools'
import { Http404 } from '../common/errors'
import { noticeManager } from '../resource/manager'


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
  },
})


class NoticeList extends Component {
  constructor(props) {
    super(props)
    let { page } = this.getCurrentParams()
    this.state = {
      loading: false, noticeList: [], pageInfo: { page: page }, key: '',
    }
    this.setNoticeList(page)
  }
  getCurrentParams() {
    // 获取当前的url参数
    let params = parseUrlParams(this.props.location.search)
    let { page } = params
    page = parseInt(page)
    page = (page ? page : 1)
    return { page: page }
  }
  async setNoticeList(page) {
    // 收集key用于获取文章列表
    page = (page ? page : 1)
    let key = noticeManager.makeListKey(page)
    // 异步获取文章列表
    let noticeList = await noticeManager.getList(key)
    let pageInfo = { page: page }
    if (noticeManager.pageInfo[key]) {
      pageInfo.pageSize = noticeManager.pageInfo[key].pageSize
      pageInfo.total = noticeManager.pageInfo[key].total
    }
    // 更新组件state
    this.setState({
      loading: false, noticeList: noticeList, pageInfo: pageInfo, key: key
    })
  }

  render() {
    let { page } = this.getCurrentParams()
    let key = noticeManager.makeListKey(page)
    let loading = this.state.loading
    // let pageInfo = { url: '/', page: 0, pageSize: 10, total: 0 }

    if (key !== this.state.key) {
      loading = true
      this.setNoticeList(page)
    }

    // 获取数据时显示加载中
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return (<Loading />)
    }

    let { noticeList, pageInfo } = this.state
    let { classes } = this.props
    let items
    if (noticeList.length) {
      items = noticeList.map((notice) => {
        return (
          <div key={notice.id} notice={notice}>{notice.content}</div>
        )
      })
    } else if (pageInfo.page !== 1) {
      throw new Http404()
    } else {
      items = (<div className={classes.empty}>暂时没有通知</div>)
    }

    return (
      <Fade in>
        <Paper className={classes.paper}>
          <div className={classes.listTitle}>
            通知
          </div>
          <Grid container justify={'center'}>
            {items}
          </Grid>
          <Pagination url={pageInfo.url} page={pageInfo.page}
            pageSize={pageInfo.pageSize} total={pageInfo.total} />
        </Paper>
      </Fade>
    )
  }
}
NoticeList = withErrorBoundary(withStyles(noticeListStyle)(NoticeList))


export { NoticeList }
