import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import {
  withStyles, Toolbar, InputBase,
  InputAdornment, Grid, Button, Dialog, Badge
} from '@material-ui/core';

import { userManager } from '../resource/manager'
import { ErrorBoundary } from '../common/components'
import Link from 'react-router-dom/Link';


const searchStyle = theme => ({
  root: {
    borderRadius: 16,
    padding: '0 8px',
    marginRight: '8px',
    transition: 'all 0.2s ease-in-out',
    borderStyle: 'solid',
    borderWidth: 1.25,
    borderColor: theme.palette.text.hint,
    maxWidth: '5rem',

    '&:hover': {
      borderColor: theme.palette.text.secondary,
    },
    '& input': {
      fontSize: '0.8rem',
      padding: '6px 0',
      transition: 'all 0.2s ease-in-out',
    }
  },
  inputOnFocus: {
    maxWidth: '12rem',
    borderColor: theme.palette.text.primary,
    '& input': {
      fontSize: '1rem',
      padding: '6px 0',
    }
  }
})


class Search extends Component {
  constructor(props) {
    super(props)
    this.state = { focused: false }
  }
  submit = (e) => {
    e.preventDefault()
    let target = e.target
    let url = `/article/search/?q=${target.elements.q.value}`
    this.props.history.push(url)
  }
  focusInput = () => {
    this.setState({ focused: true })
  }
  blurInput = () => {
    this.setState({ focused: false })
  }
  render() {
    let classNames = this.props.classes.root
    if (this.state.focused) {
      classNames += ' ' + this.props.classes.inputOnFocus
    }
    return (
      <form method='get' action={'/article/search/'} onSubmit={this.submit}>
        <InputBase
          id={'search'} name={'q'} required placeholder={'Search...'}
          disableunderline='true' className={classNames}
          inputProps={{
            maxLength: 88,
            onFocus: this.focusInput,
            onBlur: this.blurInput,
          }}
          startAdornment={(
            <InputAdornment position="start">
              <i className="fa fa-search fa-lg"></i>
            </InputAdornment>
          )}
        />
      </form>
    )
  }
}
Search = withRouter(withStyles(searchStyle)(Search))


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
  }

  openDialog = () => {
    this.setState({ open: true })
  }
  closeDialog = (e) => {
    this.setState({ open: false })
  }
  login = async () => {
    let next = window.location.href
    let data = await userManager.prepareLogin(next)
    // // production
    // if (data.github_oauth_url){
    //   window.location.href = data.github_oauth_url
    // }
    // devlopment
    let rsp = await userManager.devLogin(2, data.github_oauth_url)
    if (rsp.status === 0) {
      this.props.refresh(true)
    }
    this.setState({ open: false })
  }
  clickLogin = () => { this.login() }

  render() {
    return (
      <Fragment>
        <Button onClick={this.openDialog}>登录</Button>
        <Dialog open={this.state.open} onClose={this.closeDialog}>
          <Grid container alignItems={'center'} direction={'column'} className={this.props.classes.dialog}>
            <i onClick={this.clickLogin} className="fa fa-github fa-3x" />
            <span onClick={this.clickLogin}>GitHub登录</span>
          </Grid>
        </Dialog>
      </Fragment>
    )
  }
}
LoginDialog = withStyles(loginStyle)(LoginDialog)


const userBarStyle = theme => ({
  root: {
    '&>i, >a': {
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
      }
    }
    this.setUser()
  }

  setUser = async (refresh = false) => {
    let currentUser = await userManager.getCurrentUser(refresh)
    if (currentUser && currentUser.id !== undefined) {
      this.setState({ user: currentUser })
    }
  }

  async logout() {
    let rsp = await userManager.logout()
    if (rsp.status === 0) {
      this.setUser(true)
    }
  }

  render() {
    let { classes } = this.props
    let parts
    let user = this.state.user
    if (user.id) {
      parts = <Fragment>
        <Button className={classes.button}>
          <Link to={"/account/notice/"}>
            <Badge color="error" invisible={!user.new_notice} badgeContent={''}
              classes={{ badge: classes.badge }}>
              <i className="fa fa-envelope" aria-hidden="true"></i>
            </Badge></Link>
        </Button>
        <Button className={classes.button}
          href={user.github_url ? user.github_url : null}
          target={'_blank'}>{user.username}</Button>
        <Button className={classes.button}
          onClick={() => { this.logout() }}>注销</Button>
      </Fragment>
    } else {
      parts = <LoginDialog refresh={this.setUser} />
    }
    return (
      <div className={classes.root}>
        <i className="fa fa-user fa-lg" aria-hidden="true"></i>
        {parts}
      </div>
    )
  }
}
UserBar = withStyles(userBarStyle)(UserBar)


class TopToolbar extends Component {
  render() {
    return (
      <ErrorBoundary errorPage={''}>
        <Grid container alignItems={'center'} justify={'flex-end'}>
          <Toolbar>
            <Search />
            <UserBar />
          </Toolbar>
        </Grid>
      </ErrorBoundary>
    )
  }
}


export default TopToolbar
