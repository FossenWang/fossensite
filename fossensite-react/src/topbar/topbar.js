import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import { AppBar } from '@material-ui/core';
// import Typography from '@material-ui/core/Typography';


import { LgUpHidden, CenterGrid } from '../common/components';
import NavList from './navlist'


const topbar_style = {
  root: {
    display: 'block',
  },
}


class Topbar extends Component {
  render() {
    return (
      <AppBar classes={this.props.classes}>
        <CenterGrid container>
          <div style={{ margin: '8px 16px' }}>
            <LgUpHidden>
              <i className="fa fa-bars fa-lg" />
            </LgUpHidden>
            <a href={'/'} style={{ margin: 'auto 2rem', fontSize: '1.75rem' }}>
              Fossen
            </a>
            <NavList />
          </div>
        </CenterGrid>
      </AppBar>
    );
  }
}


export default withStyles(topbar_style)(Topbar);
