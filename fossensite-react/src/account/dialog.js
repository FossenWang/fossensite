import React, { Component } from 'react'

import withStyles from '@material-ui/core/styles/withStyles'
import Dialog from '@material-ui/core/Dialog/Dialog'
import Grid from '@material-ui/core/Grid/Grid'

import { userManager } from '../resource/manager'
import { parseUrlParams } from '../common/tools'
import { GlobalContext } from '../common/context'


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


class BaseLoginDialog extends Component {
  render() {
    let { classes, open, onClose, login  } = this.props
    return (
      <Dialog open={open} onClose={onClose}>
        <Grid container alignItems={'center'} direction={'column'} className={classes.dialog}>
          <i onClick={login} className="fa fa-github fa-3x" />
          <span onClick={login}>GitHub登录</span>
        </Grid>
      </Dialog>
    )
  }
}
BaseLoginDialog = withStyles(loginStyle)(BaseLoginDialog)


class LoginDialog extends Component {
  constructor(props) {
    super(props)
    this.state = { open: false }
    if (process.env.NODE_ENV === 'development') {
      this.login = this.devLogin
    }
  }
  static contextType = GlobalContext
  componentDidMount() {
    // 注册回调
    userManager.callbacks.login['LoginDialog'] = () => {
      this.context.flashMessage.current.open('已登录', { vertical: 'top', horizontal: 'right' })
    }
    userManager.callbacks.logout['LoginDialog'] = () => {
      this.context.flashMessage.current.open('已注销', { vertical: 'top', horizontal: 'right' })
    }
  }
  componentWillUnmount() {
    delete userManager.callbacks.login['LoginDialog']
    delete userManager.callbacks.logout['LoginDialog']
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
    window.location.href = `/account/oauth/github/?next=${next}&state=${state}`
    this.setState({ open: false })
  }

  render() {
    return (
      <BaseLoginDialog open={this.state.open} onClose={this.closeDialog} login={this.login} />
    )
  }
}


export default LoginDialog
