import React, { Component, Fragment } from 'react';
import {
  withStyles, Grid, Button, Badge
} from '@material-ui/core';

import { userManager } from '../resource/manager'
import Link from 'react-router-dom/Link';
import { UserAvatar } from '../common/components';
import { GlobalContext } from '../common/context'


const userBarStyle = theme => ({
  root: {
    '&>div': {
      margin: '0 8px',
    },
  },
  button: {
    padding: '8px 8px',
    textTransform: 'none',
    minWidth: 'auto',
  },
  badge: {
    width: 8,
    height: 8,
    top: -5,
    right: -5,
  }
})


class UserBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {
        id: null, username: "", avatar: null,
        github_url: null, new_notice: false
      },
    }
    this.setUser()
  }
  componentDidMount() {
    // 注册回调
    userManager.callbacks.login['UserBar'] = this.loginCallback
    userManager.callbacks.readNotice['UserBar'] = (currentUser) => {
      this.setState({ user: currentUser })
    }
  }
  componentWillUnmount() {
    delete userManager.callbacks.login['UserBar']
    delete userManager.callbacks.readNotice['UserBar']
  }

  setUser = async (refresh = false) => {
    let currentUser = await userManager.getCurrentUser(refresh)
    if (currentUser && currentUser.id !== undefined) {
      this.setState({ user: currentUser })
    }
  }
  loginCallback = (user) => {
    this.setState({ user: user })
  }
  async logout() {
    let user = await userManager.logout()
    this.setState({ user: user })
  }

  static contextType = GlobalContext
  render() {
    let { classes } = this.props
    let parts
    let user = this.state.user
    if (user.id) {
      parts = <Fragment>
        <Link to={"/account/notice/"} title={'通知'}>
          <Button className={classes.button}>
            <Badge color="error" invisible={!user.new_notice} badgeContent={''}
              classes={{ badge: classes.badge }}>
              <i className="fa fa-envelope" aria-hidden="true"></i>
            </Badge>
          </Button>
        </Link>
        <Button className={classes.button}
          href={user.github_url ? user.github_url : null}
          target={'_blank'}>{user.username}</Button>
        <Button className={classes.button}
          onClick={() => { this.logout() }}>注销</Button>
      </Fragment>
    } else {
      parts = <Button onClick={() => { this.context.loginDialog.current.openDialog() }}>登录</Button>
    }
    return (
      <Grid container justify={'center'} className={classes.root}>
        <UserAvatar src={user.avatar} />
        {parts}
      </Grid>
    )
  }
}
UserBar = withStyles(userBarStyle)(UserBar)


export default UserBar
