import React, { Component } from 'react';
import { Link } from "react-router-dom";
import moment from 'moment'

import { withStyles, Grid, Paper } from '@material-ui/core';


const frameStyle = theme => ({
  container: {
    '@media (min-width: 960px)': {
      maxWidth: 960,
      margin: '0px auto',
    },
    '@media (min-width: 1280px)': {
      maxWidth: 1140,
      margin: '0px auto',
    },
  },
})


const FrameGrid = withStyles(frameStyle)(Grid)


const paginationStyle = theme => ({
  pagination: {
    margin: '20px 0',
    textAlign: 'center',
    '& a, div': {
      cursor: 'pointer',
      display: 'inline-block',
      margin: '0 3px',
      lineHeight: '38px',
      width: '40px',
      textAlign: 'center',
      border: '1px solid #ccc',
      borderRadius: '4px',
      transition: 'all .2s ease-in-out',
      '&:hover': {
        color: theme.palette.text.primary,
        border: '1px solid ' + theme.palette.text.primary,
      }
    },
    '& span': {
      display: 'inlineBlock',
      fontSize: '1.25rem',
      lineHeight: '2.5rem',
      padding: '0 0.5rem',
    }
  },
  currentPage: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.common.white + ' !important',
      borderColor: theme.palette.text.primary,
    },
  },
})


class Pagination extends Component {
  render() {
    let { classes, url } = this.props
    if (!url) {
      url = '/'
    }
    let pageInfo = {
      page: this.props.page,
      pageSize: this.props.pageSize,
      total: this.props.total,
    }
    pageInfo.lastPage = Math.ceil(pageInfo.total / pageInfo.pageSize)
    pageInfo.prevPage = pageInfo.page > 2 ? (pageInfo.page - 1) : null
    pageInfo.morePrev = pageInfo.page > 3 ? true : false
    pageInfo.nextPage = pageInfo.page < (pageInfo.lastPage - 1) ? (pageInfo.page + 1) : null
    pageInfo.moreNext = pageInfo.page < (pageInfo.lastPage - 2) ? true : false
    return (
      <div className={classes.pagination}>
        {pageInfo.page !== 1 &&
          <Link to={url}>1</Link>}
        {pageInfo.morePrev && <span>···</span>}
        {pageInfo.prevPage !== null &&
          <Link to={`${url}?page=${pageInfo.prevPage}`}>{pageInfo.prevPage}</Link>}
        <div className={classes.currentPage}>{pageInfo.page}</div>
        {pageInfo.nextPage !== null &&
          <Link to={`${url}?page=${pageInfo.nextPage}`}>{pageInfo.nextPage}</Link>}
        {pageInfo.moreNext && <span>···</span>}
        {pageInfo.page !== pageInfo.lastPage &&
          <Link to={`${url}?page=${pageInfo.lastPage}`}>{pageInfo.lastPage}</Link>}
      </div>)
  }
}


Pagination = withStyles(paginationStyle)(Pagination)


class NotFound extends Component {
  static defaultProps = {
    children: (
      <span style={{fontSize: '1.5rem'}}>
        <i className="fa fa-exclamation-circle" aria-hidden="true"></i>&emsp;
        404&emsp;当前页面不存在
      </span>
    )
  }
  render() {
    return (
      <Paper>
        <Grid container justify={'center'}>
          <p style={{ padding: '2rem', margin: 0 }}>{this.props.children}</p>
        </Grid>
      </Paper>
    )
  }
}


class Loading extends Component {
  render() {
    return (
      <NotFound>
        <i className="fa fa-spinner fa-spin fa-3x"></i>
        <br /><br />{'加载中...'}
      </NotFound>
    )
  }
}


function formatDate(date) {
  if (typeof (date) == 'string') {
    date = new Date(date)
  }
  return moment(date).format('YYYY年M月D日 HH:mm')
}


export { Pagination, FrameGrid, NotFound, Loading, formatDate }
