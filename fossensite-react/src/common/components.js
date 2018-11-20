import React, { Component } from 'react';

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
  },
  page: {
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
  currenPage: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.common.white,
      borderColor: theme.palette.text.primary,
    },
  },
})


class Pagination extends Component {
  render() {
    let { classes } = this.props
    return (
      <div className={classes.pagination}>
        <a href={'/'} className={classes.page + ' ' + classes.currenPage}>1</a>
        <a href={'/'} className={classes.page}>2</a>
      </div>)
  }
}


Pagination = withStyles(paginationStyle)(Pagination)


export { Pagination, FrameGrid }
