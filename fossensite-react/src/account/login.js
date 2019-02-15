import React, { Component } from 'react'

import { InfoPage, withErrorBoundary } from '../common/components'
import { parseUrlParams } from '../common/tools'
import { userManager } from '../resource/manager'
import { GlobalContext } from '../common/context'


class LoginPage extends Component {
  constructor(props) {
    super(props)
    if (process.env.NODE_ENV === 'development') {
      this.login = this.devLogin
    }
  }
  static contextType = GlobalContext
  login = async () => {
    let { code } = parseUrlParams(this.props.location.search)
    let data = {}
    let next = '/'
    try {
      data = await userManager.login(code)
      next = data.next
    } catch (error) {
      this.context.flashMessage.current.open(
        this.getErrorMsg(error), { vertical: 'top', horizontal: 'right' })
      if (error.msg && error.msg.next) {
        next = error.msg.next
      }
    }
    if (next.match('/account/oauth/github/')) {
      next = '/'
    }
    this.props.history.push(next)
  }
  devLogin = async () => {
    let data = {}
    let next = '/'
    try {
      data = await userManager.login(2)
      next = data.next
    } catch (error) {
      this.context.flashMessage.current.open(
        this.getErrorMsg(error), { vertical: 'top', horizontal: 'right' })
      if (error.msg && error.msg.next) {
        next = error.msg.next
      }
    }
    if (next.match('/account/oauth/github/')) {
      next = '/'
    }
    this.props.history.push(next)
  }
  getErrorMsg = (error) => {
    let msg
    if (error.msg) {
      if (error.msg.msg === 'timeout') {
        msg = '登录超时，请重试！'
      } else {
        msg = error.msg.msg
      }
    } else {
      msg = JSON.stringify(error)
    }
    return msg ? msg: 'Error!'
  }
  componentDidMount() {
    this.login()
  }
  render() {
    return (
      <InfoPage>
        <i className="fa fa-spinner fa-spin fa-3x"></i>
        <br /><br />{'登录中...'}
      </InfoPage>
    )
  }
}


export default withErrorBoundary(LoginPage)
