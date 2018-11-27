import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";
import { withStyles, Grid } from '@material-ui/core';


import { FrameGrid, NotFound } from './common/components'
import ArticleList from './blog/article_list'
import SideBar from './blog/side_bar'
import ArticleDetail from './blog/article_detail'


const mainStyle = theme => ({
  root: {
    marginTop: 16,
    marginBottom: 16,
    '&>div': {
      // margin: '0 8px',
      padding: '0 8px',
    }
  },
  '@global': theme.global,
})


class Main extends Component {
  render() {
    let { classes } = this.props
    return (
      <FrameGrid container component={'main'} className={classes.root}>
        <Grid item md={8}>
          <Switch>
            <Route exact path="/" component={ArticleList} />
            <Route exact path="/article/" component={ArticleList} />
            <Route exact path="/article/category/:cate_id(\d+)/" component={ArticleList} />
            <Route exact path="/article/topic/:topic_id(\d+)/" component={ArticleList} />
            <Route path="/article/:id(\d+)/" component={ArticleDetail} />
            <NotFound />
          </Switch>
        </Grid>
        <Grid item md={4}>
          <SideBar />
        </Grid>
      </FrameGrid>
    );
  }
}


Main = withStyles(mainStyle)(Main)


export default Main
