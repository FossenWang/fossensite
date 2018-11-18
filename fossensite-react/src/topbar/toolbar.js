import React, { Component } from 'react';

import { Toolbar} from '@material-ui/core';
import { CenterGrid } from '../common/components';


class TopToolbar extends Component {
  render() {
    return (
      <CenterGrid container justify={'flex-end'}>
        <Toolbar>
          <i className="fa fa-search fa-lg"></i>
          <i className="fa fa-user fa-lg"></i>
        </Toolbar>
      </CenterGrid>
    )
  }
}


export default TopToolbar
