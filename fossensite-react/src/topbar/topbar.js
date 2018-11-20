import React, { Component } from 'react';

import { withStyles, AppBar, Hidden, Grid } from '@material-ui/core';

import { FrameGrid } from '../common/components';
import NavList from './navlist'
import TopToolbar from './toolbar'


const topbar_style = (theme) => ({
  root: {
    display: 'block',
    color: theme.palette.text.primary
  },
})


class Topbar extends Component {
  render() {
    return (
      <AppBar classes={this.props.classes} position={'relative'}>
        <FrameGrid container>
          <Grid container alignItems={'center'} style={{ margin: '0 16px', flexFlow: 'row nowrap' }}>
            <Hidden mdUp implementation={'css'}>
              <i className="fa fa-bars fa-lg" />
            </Hidden>
            <a href={'/'} style={{ margin: 'auto 2rem', fontSize: '1.75rem' }}>
              Fossen
            </a>
            <NavList />
            <TopToolbar />
          </Grid>
        </FrameGrid>
      </AppBar>
    );
  }
}


export default withStyles(topbar_style)(Topbar);
