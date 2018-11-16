import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

// import './index.css';
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
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="copy-right">© 2018 Fossen</div>
              <div className="beian"><a href="http://www.miitbeian.gov.cn/">鄂ICP备18003155号-1</a></div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}


let body_style = {
  root: {
    // backgroundColor: 'red',
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  },
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

Body = withStyles(body_style)(Body)

ReactDOM.render(<Body />, document.getElementById('root'));
