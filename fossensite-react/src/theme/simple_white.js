import { createMuiTheme } from '@material-ui/core/styles';
import common from '@material-ui/core/colors/common';

var dark_blue = '#17375E'

const SimpleWhiteTheme = createMuiTheme({
  palette: {
    primary: {
      main: common.white
    },
    text: {
      primary: dark_blue,
      secondary: dark_blue,
    }
  }
});


export default SimpleWhiteTheme
