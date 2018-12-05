import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";
import { withStyles, Grid } from '@material-ui/core';


import { FrameGrid, NotFound } from './common/components'
import {
  NewArticleList, CateArticleList,
  TopicArticleList, SearchArticleList
} from './blog/article_list'
import SideBar from './blog/side_bar'
import ArticleDetail from './blog/article_detail'
import { NoticeList } from './account/notice_list';


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
            <Route exact path="/" component={NewArticleList} />
            <Route exact path="/article/:id(\d+)/" component={ArticleDetail} />
            <Route exact path="/article/" component={NewArticleList} />
            <Route exact path="/article/category/:cate_id(\d+)/" component={CateArticleList} />
            <Route exact path="/article/topic/:topic_id(\d+)/" component={TopicArticleList} />
            <Route exact path="/article/search/" component={SearchArticleList} />
            <Route exact path="/account/notice/" component={NoticeList} />
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
