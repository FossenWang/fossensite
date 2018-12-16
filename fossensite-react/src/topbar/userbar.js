import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import {
  withStyles, Snackbar, Grid, Button, Dialog, Badge
} from '@material-ui/core';

import { userManager } from '../resource/manager'
import Link from 'react-router-dom/Link';
import { parseUrlParams } from '../common/tools';


const loginStyle = theme => ({
  dialog: {
    padding: 48,
    '& span': {
      cursor: 'pointer',
    },
    '& i:hover, span:hover': {
      color: theme.palette.text.secondary,
    },
  },
})


class LoginDialog extends Component {
  constructor(props) {
    super(props)
    this.state = { open: false }
    if (process.env.NODE_ENV === 'development') {
      this.login = this.devLogin
    }
    userManager.openLoginDialog = this.openDialog
  }

  openDialog = () => {
    this.setState({ open: true })
  }
  closeDialog = (e) => {
    this.setState({ open: false })
  }
  login = async () => {
    let next = window.location.pathname
    let data = await userManager.prepareLogin(next)
    window.location.href = data.github_oauth_url
    this.setState({ open: false })
  }
  devLogin = async () => {
    let next = window.location.pathname
    let data = await userManager.prepareLogin(next)
    let { state } = parseUrlParams(data.github_oauth_url)
    this.props.history.push(`/account/oauth/github/?next=${next}&state=${state}`)
    this.setState({ open: false })
  }

  render() {
    return (
      <Fragment>
        <Button onClick={this.openDialog}>登录</Button>
        <Dialog open={this.state.open} onClose={this.closeDialog}>
          <Grid container alignItems={'center'} direction={'column'} className={this.props.classes.dialog}>
            <i onClick={this.login} className="fa fa-github fa-3x" />
            <span onClick={this.login}>GitHub登录</span>
          </Grid>
        </Dialog>
      </Fragment>
    )
  }
}
LoginDialog = withRouter(withStyles(loginStyle)(LoginDialog))


const userBarStyle = theme => ({
  root: {
    '&>i': {
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
      openMsg: false,
      message: '',
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
    this.setState({ user: user, openMsg: true, message: '已登录' })
  }
  async logout() {
    let user = await userManager.logout()
    this.setState({ user: user, openMsg: true, message: '已注销'})
  }
  closeLogoutMsg = () => {
    this.setState({openMsg: false})
  }

  render() {
    let { classes } = this.props
    let parts
    let user = this.state.user
    if (user.id) {
      parts = <Fragment>
        <Link to={"/account/notice/"}>
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
      parts = <LoginDialog />
    }
    return (
      <div className={classes.root}>
        <i className="fa fa-user fa-lg" aria-hidden="true"></i>
        {parts}
        <Snackbar
          anchorOrigin={{vertical: 'top', horizontal: 'right'}}
          open={this.state.openMsg}
          onClose={this.closeLogoutMsg}
          autoHideDuration={2000}
          message={this.state.message} />
      </div>
    )
  }
}
UserBar = withStyles(userBarStyle)(UserBar)


export default UserBar
