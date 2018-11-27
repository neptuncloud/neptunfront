import React, { Component } from 'react';
import { Text, Button, Box,  TextInput, Grommet } from 'grommet';
import auth from './auth';
 
const qs = require('query-string');

const AppBar = (props) => (
<Box 
  tag='header'
  direction='row'
  align='center'
  justify='between'
  background='brand'
  pad={{ left: 'medium', right: 'small', vertical: 'small' }}
  elevation='medium'
  style={{ zIndex: '100', fontWeight: 'bold' }}
  {...props}
/>
);

const LoginBox = (props) => (
<Box 
  tag='div'
  align='center'
  alignSelf='center'
  gap="medium"
  background='neutral-1'
  pad="medium"
  width="medium"
  {...props}
/>
);

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = { loggedin: false, 
                   fetching: true,
                   login: '',
                   pass: '',
                   jwt: '',
                   authError: undefined
                  }
    console.log(props);
  }

  login = (credentials) => {
    var params = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
    console.log(params.redirect_uri);
    auth.login(this.state.login, this.state.pass, params.redirect_uri,(jwt) => {
      if(jwt) {    
          localStorage.setItem('jwt',jwt);
          window.location.replace('/'); 
      } else
      this.setState({authError: true});
    });
  }


  loginChange = event => this.setState({ login: event.target.value });
  passChange = event => this.setState({ pass: event.target.value });

  
  render() {
    var params = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
    if(!params.redirect_uri) {
      var jwt = localStorage.getItem('jwt');
      auth.checkLogin(jwt,(res) => {
        console.log('jwt');
        console.log(res);
        if(!res) {
          window.location.replace('http://neptun-api.south.rt.ru/connect/ldapauth');
        } else
        {
          window.location.replace('/'); 
        }
      });
    return (
      <Grommet plain>
        <AppBar>
          Neptun
        </AppBar>
        <div className="App-intro">
        </div>
      </Grommet>
    );
    } else
    {
    return (
      <Grommet plain>
        <AppBar>
          Neptun
        </AppBar>
        <LoginBox>
          {this.state.authError && (
            <Text>Bad Credentials</Text>
          )}
          <TextInput  value={this.state.login} 
                      onChange={this.loginChange}
                      size="small" 
                      placeholder="Login" 
                      margin="medium" />
          <TextInput  value={this.state.pass} 
                      onChange={this.passChange}
                      size="small"
                      type="password" 
                      placeholder="Password" />
          <Button label="Login" primary={true} color="brand" onClick={this.login} />
        </LoginBox>
      </Grommet>
    );
    }
  }
}

export default Login;
