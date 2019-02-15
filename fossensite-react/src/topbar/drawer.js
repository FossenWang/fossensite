import React, { Component } from 'react'

import withStyles from '@material-ui/core/styles/withStyles'
import Grid from '@material-ui/core/Grid/Grid'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer/SwipeableDrawer'
import Paper from '@material-ui/core/Paper/Paper'

import { TopicCard, FriendLinkCard, TitleCard } from '../blog/side_bar'
import Search from './search'
import UserBar from './userbar'


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
      return { open: false, locationKey: location.key }
    }
    return null
  }
  render() {
    return (
      <StyleDrawer
        disableSwipeToOpen={this.isIOS}
        open={this.state.open}
        onOpen={this.open}
        onClose={this.close}>
      </StyleDrawer>
    )
  }
}


export default SideDrawer
