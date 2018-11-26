import React, { Component } from 'react';
import { Button, Grommet } from 'grommet';


class TableButton extends Component {

  toString() {
    return this.name;
  }

  render = () => {
    return ( <Button {...this.props} /> );
  }
}

export default TableButton;
