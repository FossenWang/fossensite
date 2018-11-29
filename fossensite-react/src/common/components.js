import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { withStyles, Grid, Paper } from '@material-ui/core';

import { Http404 } from './errors';


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


const zoomStyle = theme => ({
  container: {
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: 4,
    // width: '100%',
    // height: '100%',
    '&:hover img': {
      transform: 'scale(1.25)',
    },
  },
  img: {
    transition: 'all .5s ease',
    cursor: 'pointer',
  }
})


class ZoomImg extends Component {
  render() {
    return (
      <div className={this.props.classes.container}>
        <img
          src={this.props.src} alt={this.props.alt}
          className={this.props.classes.img}
        />
      </div>
    )
  }
}
ZoomImg = withStyles(zoomStyle)(ZoomImg)


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
    let { classes, url, page, pageSize, total } = this.props
    if (!total) {
      return ''
    }
    let lastPage = total ? Math.ceil(total / pageSize) : 1
    let prevPage = page > 2 ? (page - 1) : null
    let morePrev = page > 3 ? true : false
    let nextPage = page < (lastPage - 1) ? (page + 1) : null
    let moreNext = page < (lastPage - 2) ? true : false
    return (
      <div className={classes.pagination}>
        {page !== 1 &&
          <Link to={url}>1</Link>}
        {morePrev && <span>···</span>}
        {prevPage !== null &&
          <Link to={this.joinUrl(url, prevPage)}>{prevPage}</Link>}
        <div className={classes.currentPage}>{page}</div>
        {nextPage !== null &&
          <Link to={this.joinUrl(url, nextPage)}>{nextPage}</Link>}
        {moreNext && <span>···</span>}
        {page !== lastPage &&
          <Link to={this.joinUrl(url, lastPage)}>{lastPage}</Link>}
      </div>)
  }
  joinUrl(url, page) {
    let prefix
    if (url.match('\\?')) {
      prefix = '&'
    } else {
      prefix = '?'
    }
    return `${url}${prefix}page=${page}`
  }
}
Pagination = withStyles(paginationStyle)(Pagination)



class InfoPage extends Component {
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


class ErrorPage extends Component {
  render() {
    return (
      <InfoPage>
        <span style={{ fontSize: '1.5rem' }}>
          好像出了点问题...
        </span>
      </InfoPage>
    )
  }
}


class NotFound extends Component {
  render() {
    return (
      <InfoPage>
        <span style={{ fontSize: '1.5rem' }}>
          <i className="fa fa-exclamation-circle" aria-hidden="true"></i>&emsp;
          404&emsp;当前页面不存在
        </span>
      </InfoPage>
    )
  }
}


class Loading extends Component {
  render() {
    return (
      <InfoPage>
        <i className="fa fa-spinner fa-spin fa-3x"></i>
        <br /><br />{'加载中...'}
      </InfoPage>
    )
  }
}


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      console.log(this.state.error)
      if ( this.state.error instanceof Http404) {
        return <NotFound />
      }
      return <ErrorPage />
    }
    return this.props.children; 
  }
}


function withErrorBoundary(WrappedComponent) {
  function NewComponent(props) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props}/>
      </ErrorBoundary>
    )
  }
  return NewComponent
}


export {
  Pagination, FrameGrid, ZoomImg, InfoPage, Loading, 
  NotFound, ErrorPage, ErrorBoundary, withErrorBoundary
}
