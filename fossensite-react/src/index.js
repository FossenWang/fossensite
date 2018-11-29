import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";
import { MuiThemeProvider } from '@material-ui/core';

import simple_white_theme from './theme/simple_white'
import Topbar from './topbar/topbar'
import Main from './main'
import Footer from './footer'
import { ErrorBoundary } from './common/components';


var theme = simple_white_theme


class Blog extends Component {
  render() {
    return (
      <ErrorBoundary>
        <Router>
          <MuiThemeProvider theme={theme}>
            <Topbar />
            <Main />
            <Footer />
          </MuiThemeProvider>
        </Router>
      </ErrorBoundary>
    );
  }
}


ReactDOM.render(<Blog />, document.getElementById('root'));
