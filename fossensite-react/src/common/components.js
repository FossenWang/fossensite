import React, { Component } from 'react';

import { withStyles, Grid, Hidden } from '@material-ui/core';


class CssHidden extends Component {
  static defaultProps = {
    implementation: 'css',
    lgUp: true,
  }

  render() {
    return <Hidden {...this.props} />
  }
}


const frame_style = {
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
}


const FrameGrid = withStyles(frame_style)(Grid)


export { CssHidden, FrameGrid }
