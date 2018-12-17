import React, { Component } from 'react';
import { withStyles, SwipeableDrawer, Grid, Paper } from '@material-ui/core';

import { TopicCard, FriendLinkCard, TitleCard } from '../blog/side_bar'
import Search from './search';
import UserBar from './userbar';
import { DrawerContext } from './context'

const drawerStyle = theme => ({
  paper: {
    width: '75%',
    background: theme.palette.background.default,
  },
  grid: {
    padding: 8,
  },
  searchPaper: {
    padding: 10,
    marginBottom: 8,
  },
})
class StyleDrawer extends Component {
  render() {
    let { classes } = this.props
    return (
      <SwipeableDrawer {...this.props} classes={{ paper: classes.paper }}>
        <Paper className={classes.searchPaper}>
          <Grid container justify={'center'}>
            <Search useTextField />
          </Grid>
        </Paper>
        <Grid container classes={{ container: classes.grid }}>
          <TitleCard>
            <UserBar />
          </TitleCard>
          <TopicCard />
          <FriendLinkCard />
        </Grid>
      </SwipeableDrawer>
    )
  }
}
StyleDrawer = withStyles(drawerStyle)(StyleDrawer)


class SideDrawer extends Component {
  state = { open: true, locationKey: '' }
  isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  open = () => {
    this.setState({ open: true })
  }
  close = () => {
    this.setState({ open: false })
  }
  static getDerivedStateFromProps(props, state) {
    let { location } = props
    if (location.key !== state.locationKey) {
      return {open: false, locationKey: location.key}
    }
    return null
  }
  render() {
    return (
      <DrawerContext.Provider value={{ drawer: this }}>
        <StyleDrawer
          disableSwipeToOpen={this.isIOS}
          open={this.state.open}
          onOpen={this.open}
          onClose={this.close}>
        </StyleDrawer>
      </DrawerContext.Provider>
    )
  }
}


export default SideDrawer
