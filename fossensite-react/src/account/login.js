import React, { Component } from 'react';

import { InfoPage, withErrorBoundary } from '../common/components';
import { parseUrlParams } from '../common/tools';
import { userManager } from '../resource/manager'


class LoginPage extends Component {
  constructor(props) {
    super(props)
    if (process.env.NODE_ENV === 'development') {
      this.login = this.devLogin
    }
  }
  login = async () => {
    let { code } = parseUrlParams(this.props.location.search)
    let data = await userManager.login(code)
    let next = data.next
    if (next.match('/account/oauth/github/')){
      next = '/'
    }
    this.props.history.push(next)
  }
  devLogin = async () => {
    let data = await userManager.login(2)
    let next = data.next
    if (next.match('/account/oauth/github/')){
      next = '/'
    }
    this.props.history.push(next)
  }
  render() {
    this.login()
    return (
      <InfoPage>
        <i className="fa fa-spinner fa-spin fa-3x"></i>
        <br /><br />{'登录中...'}
      </InfoPage>
    )
  }
}


export default withErrorBoundary(LoginPage)
