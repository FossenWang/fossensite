import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Header from './public/header'

// import App from './default/App';
// import * as serviceWorker from './serviceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));

// // If you want your app to work offline and load faster, you can change
// // unregister() to register() below. Note this comes with some pitfalls.
// // Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();

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
      <div>
        <Header />
        <Footer />
      </div>
    );
  }
}

ReactDOM.render(<Body />, document.getElementsByTagName('body')[0]);
