import React, { Component } from 'react';
import { Box, Grommet } from 'grommet';

const AppBar = (props) => (
<Box 
  tag='header'
  direction='row'
  align='center'
  justify='between'
  background='brand'
  pad={{ left: 'medium', right: 'small', vertical: 'small' }}
  elevation='medium'
  style={{ zIndex: '100' }}
  {...props}
/>
);

class Home extends Component {
  render() {
    return (
      <Grommet plain>
        <AppBar>
          Content
        </AppBar>
      </Grommet>
    );
  }
}

export default Home;
