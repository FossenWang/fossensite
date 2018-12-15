import React, { Component } from 'react';

import { InfoPage, withErrorBoundary } from '../common/components';
import { parseUrlParams } from '../common/tools';
import { userManager } from '../resource/manager'


class LoginPage extends Component {
  login = async () => {
    let data
    if (process.env.NODE_ENV === 'development') {
      data = await userManager.devLogin(2)
    } else {
      let { code } = parseUrlParams(this.props.location.search)
      data = await userManager.login(code)
    }
    let next = data.next
    if (next.match('/account/login/')){
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
