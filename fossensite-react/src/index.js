import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";
import { MuiThemeProvider } from '@material-ui/core';

import simple_white_theme from './theme/simple_white'
import Topbar from './topbar/topbar'
import Main from './main'
import Footer from './footer'
import { ErrorBoundary, FlashMessage } from './common/components';
import { GlobalContext } from './common/context'
import LoginDialog from './account/dialog';


var theme = simple_white_theme


class Blog extends Component {
  render() {
    let loginDialog = React.createRef()
    let flashMessage = React.createRef()
    let context = {
      loginDialog: loginDialog,
      flashMessage: flashMessage,
    }
    return (
      <MuiThemeProvider theme={theme}>
        <Router>
          <ErrorBoundary>
            <GlobalContext.Provider value={context}>
              <Topbar />
              <Main />
              <Footer />
              <LoginDialog ref={loginDialog} />
              <FlashMessage ref={flashMessage} />
            </GlobalContext.Provider>
          </ErrorBoundary>
        </Router>
      </MuiThemeProvider>
    );
  }
}


ReactDOM.render(<Blog />, document.getElementById('root'));
