import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import './index.css';
import Header from './public/header'
import SimpleWhiteTheme from './theme/simple_white'


class Main extends Component {
  render() {
    return (
      <main>网页的主体</main>
    );
  }
}


class Footer extends Component {
  render() {
    return (
      <footer>
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <div class="copy-right">© 2018 Fossen</div>
              <div class="beian"><a href="http://www.miitbeian.gov.cn/">鄂ICP备18003155号-1</a></div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}


class Body extends Component {
  render() {
    return (
      <MuiThemeProvider theme={SimpleWhiteTheme}>
        <Header />
        <Main />
        <Footer />
      </MuiThemeProvider>
    );
  }
}


ReactDOM.render(<Body />, document.getElementsByTagName('body')[0]);
