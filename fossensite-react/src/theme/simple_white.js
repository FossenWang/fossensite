import { createMuiTheme } from '@material-ui/core/styles';
import common from '@material-ui/core/colors/common';
// import blue from '@material-ui/core/colors/blue';

var dark_blue = '#17375E'
var light_grey = '#f4f5f7'

const SimpleWhiteTheme = createMuiTheme({
  palette: {
    primary: {
      main: common.white
    },
    text: {
      primary: dark_blue,
      secondary: dark_blue,
    },
    background: {
      paper: common.black,
      default: light_grey,
    }
  },
  typography: {
    htmlFontSize: 16,
    fontSize: 16,
    fontFamily: '"Roboto", Helvetica, "Lucida Sans", "Microsoft YaHei", Georgia, Arial, Sans-serif',
  }
});


export default SimpleWhiteTheme
