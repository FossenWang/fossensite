import React, { Component } from 'react';
import { withStyles, Paper, Grid } from '@material-ui/core';

import { FrameGrid } from '../common/components'
import ArticleList from './article_list'


const mainStyle = theme => ({
  root: {
    marginTop: 16,
    marginBottom: 16,
  },
  '@global': {
    html: {
      fontSize: 16,
    },
    body: {
      margin: 0,
      color: theme.palette.text.primary,
      background: theme.palette.background.default,
      fontFamily: '"Roboto", Helvetica, "Lucida Sans", "Microsoft YaHei", Georgia, Arial, Sans-serif',
    },
    a: {
      color: theme.palette.text.primary,
      textDecoration: 'none',
      '&:hover': {
        color: theme.palette.text.secondary,
        textDecoration: 'none',
      }
    },
    i: { cursor: 'pointer' },
  }
})


class Main extends Component {
  render() {
    let { classes } = this.props
    return (
      <FrameGrid container spacing={8} component={'main'} alignItems={'center'} className={classes.root}>
        <Grid item md={8}>
          <ArticleList />
        </Grid>
        <Grid item md={4}>
          <Paper className={classes.paper}>侧边栏</Paper>
        </Grid>
      </FrameGrid>
    );
  }
}


Main = withStyles(mainStyle)(Main)


export default Main
