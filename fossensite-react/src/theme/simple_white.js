import { createMuiTheme } from '@material-ui/core/styles';
import common from '@material-ui/core/colors/common';


var dark_blue = '#17375E'
var light_blue = '#0070C0'
var light_grey = '#f4f5f7'


const simple_white_theme = createMuiTheme({
  palette: {
    primary: {
      main: common.white
    },
    text: {
      primary: dark_blue,
      secondary: light_blue,
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


export default simple_white_theme
