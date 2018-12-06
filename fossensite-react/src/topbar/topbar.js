import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, AppBar, Hidden, Grid } from '@material-ui/core';

import { FrameGrid } from '../common/components';
import NavList from './navlist'
import TopToolbar from './toolbar'


const topbar_style = (theme) => ({
  root: {
    display: 'block',
    color: theme.palette.text.primary
  },
  grid: {
    margin: '0 16px',
    flexFlow: 'row nowrap'
  },
  link: {
    margin: 'auto 2rem',
    fontSize: '1.75rem'
  },
})


class Topbar extends Component {
  render() {
    let { classes } = this.props
    return (
      <AppBar classes={{ root: classes.root }} position={'relative'}>
        <FrameGrid container>
          <Grid container alignItems={'center'} className={classes.grid}>
            <Hidden mdUp implementation={'css'}>
              <i className="fa fa-bars fa-lg" />
            </Hidden>
            <Link to={'/'} className={classes.link}>
              Fossen
            </Link>
            <NavList />
            <TopToolbar />
          </Grid>
        </FrameGrid>
      </AppBar>
    );
  }
}


export default withStyles(topbar_style)(Topbar);
