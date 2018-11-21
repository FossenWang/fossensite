import { createMuiTheme } from '@material-ui/core/styles';
import { common } from '@material-ui/core/colors';


var darkBlue = '#17375E'
var lightBlue = '#0070C0'
var lightGrey = '#f4f5f7'
var darkGrey = '#333'


const simple_white_theme = createMuiTheme({
  palette: {
    primary: {
      light: common.white,
      main: common.white,
      contrastText: darkGrey,
    },
    text: {
      primary: darkBlue,
      secondary: lightBlue,
    },
    background: {
      paper: common.white,
      default: lightGrey,
    }
  },
  typography: {
    fontSize: 16,
    pxToRem: (px)=>{
      return (px / 16) + 'rem'
    },
    fontFamily: '"Roboto", Helvetica, "Lucida Sans", "Microsoft YaHei", Georgia, Arial, Sans-serif',
  }
});


export default simple_white_theme
