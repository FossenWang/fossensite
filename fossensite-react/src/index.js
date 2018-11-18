import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

// import './index.css';
import Topbar from './topbar/topbar'
import simple_white_theme from './theme/simple_white'


var theme = simple_white_theme


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


const body_style = theme => ({
  '@global': {
    html: {
      fontSize: 16,
    },
    body: {
      color: theme.palette.text.primary,
      background: theme.palette.background.default,
      fontFamily: '"Roboto", Helvetica, "Lucida Sans", "Microsoft YaHei", Georgia, Arial, Sans-serif',
    },
    a: {
      color: theme.palette.text.primary,
      textDecoration: 'none',
      '&:hover': {
        color: theme.palette.text.secondary,
        textDecoration: 'none',
      }
    },
    i: { cursor: 'pointer' },
  }
})


Main = withStyles(body_style)(Main)


class Body extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Topbar />
        <Main />
        <Footer />
      </MuiThemeProvider>
    );
  }
}


ReactDOM.render(<Body />, document.getElementById('root'));
