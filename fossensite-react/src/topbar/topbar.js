import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'

import withStyles from '@material-ui/core/styles/withStyles'
import Grid from '@material-ui/core/Grid/Grid'
import AppBar from '@material-ui/core/AppBar/AppBar'
import Hidden from '@material-ui/core/Hidden/Hidden'
import Button from '@material-ui/core/Button/Button'

import { FrameGrid, ErrorBoundary } from '../common/components'
import NavList from './navlist'
import Search from './search'
import UserBar from './userbar'
import SideDrawer from './drawer'


class TopToolbar extends Component {
  render() {
    return (
      <ErrorBoundary errorPage={''}>
        <Hidden smDown>
          <Grid container alignItems={'center'} justify={'flex-end'}>
            <Grid item><Search /></Grid>
            <Grid item><UserBar /></Grid>
          </Grid>
        </Hidden>
      </ErrorBoundary>
    )
  }
}


const topbar_style = (theme) => ({
  root: {
    display: 'block',
    color: theme.palette.text.primary
  },
  grid: {
    margin: '0 16px',
    flexFlow: 'row nowrap',
    minHeight: 64,
  },
  link: {
    margin: 'auto 0.75rem',
    fontSize: '1.75rem'
  },
})


class Topbar extends Component {
  render() {
    let { classes, location } = this.props
    let drawer = React.createRef()
    return (
      <AppBar classes={{ root: classes.root }} position={'relative'}>
        <FrameGrid container>
          <Grid container alignItems={'center'} className={classes.grid}>
            <Hidden mdUp>
              <Button onClick={() => { drawer.current.open() }}>
                <i className="fa fa-bars fa-lg" />
              </Button>
              <SideDrawer ref={drawer} location={location} />
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


export default withRouter(withStyles(topbar_style)(Topbar))
