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
  },
  global: {
    html: {
      fontSize: 16,
    },
    body: {
      margin: 0,
      color: darkBlue,
      background: lightGrey,
      fontFamily: '"Roboto", Helvetica, "Lucida Sans", "Microsoft YaHei", Georgia, Arial, Sans-serif',
    },
    a: {
      color: darkBlue,
      textDecoration: 'none',
      '&:hover': {
        color: lightBlue,
        textDecoration: 'none',
      }
    },
    i: { cursor: 'pointer' },
    img: { maxWidth: '100%', height: 'auto', borderRadius: 4 },
    ul: { listStyle: 'none', margin: 0, padding: 0 },
  }
});


export default simple_white_theme
