import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import { AppBar, Hidden } from '@material-ui/core';
// import Typography from '@material-ui/core/Typography';


import { CenterGrid, FrameGrid } from '../common/components';
import NavList from './navlist'
import TopToolbar from './toolbar'


const topbar_style = {
  root: {
    display: 'block',
  },
}


class Topbar extends Component {
  render() {
    return (
      <AppBar classes={this.props.classes}>
        <FrameGrid container>
          <CenterGrid container style={{ margin: '0 16px', flexFlow: 'row nowrap' }}>
            <Hidden mdUp implementation={'css'}>
              <i className="fa fa-bars fa-lg" />
            </Hidden>
            <a href={'/'} style={{ margin: 'auto 2rem', fontSize: '1.75rem' }}>
              Fossen
            </a>
            <NavList />
            <TopToolbar />
          </CenterGrid>
        </FrameGrid>
      </AppBar>
    );
  }
}


export default withStyles(topbar_style)(Topbar);
