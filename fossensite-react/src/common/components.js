import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';


class LgUpHidden extends Component {
  default_props = {
    implementation: 'css',
    lgUp: true,
  }

  render() {
    let props = Object.assign(this.default_props, this.props)
    return <Hidden {...props} />
  }
}


const grid_style = {
  container: {
    // 始终上下居中
    // alignItems: 'flex-end',
    // 左右居中
    // justifyContent: 'flex-end',
    '@media (min-width: 1280px)': {
      maxWidth: 1200,
      margin: '0px auto',
    },
  },
}


class CenterGrid extends Component {
  default_props = {
    alignItems: 'center',
  }

  render() {
    let props = Object.assign(this.default_props, this.props)
    console.log(props, this.props)
    return <Grid {...props} />
  }
}


CenterGrid = withStyles(grid_style)(CenterGrid)


export { LgUpHidden, CenterGrid }
