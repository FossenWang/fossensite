import React, { Component } from 'react';
import moment from 'moment'

import { withStyles, Grid } from '@material-ui/core';


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
    '& a': {
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
    let { classes } = this.props
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
        {pageInfo.page !== 1 && <a href={'/'}>1</a>}
        {pageInfo.morePrev && <span>···</span>}
        {pageInfo.prevPage !== null && <a href={'/'}>{pageInfo.prevPage}</a>}
        <a href={'/'} className={classes.currentPage}>{pageInfo.page}</a>
        {pageInfo.nextPage !== null && <a href={'/'}>{pageInfo.nextPage}</a>}
        {pageInfo.moreNext && <span>···</span>}
        {pageInfo.page !== pageInfo.lastPage && <a href={'/'}>{pageInfo.lastPage}</a>}
      </div>)
  }
}


Pagination = withStyles(paginationStyle)(Pagination)


function formatDate(date) {
  if (typeof(date) == 'string') {
    date = new Date(date)
  }
  return moment(date).format('YYYY年M月D日 HH:mm')
}


export { Pagination, FrameGrid, formatDate }
