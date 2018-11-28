import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Project from './Project';
import Login from './Login';
import Profile from './Profile';
import Net from './Net';
import Storage from './Storage';
import Orders from './Orders';

import {
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';

document.title = "Neptun";
ReactDOM.render(
<BrowserRouter>
          <Switch>
            <Route exact path="/login"  component={Login} />
            <Route path="/project"  component={Project} />
            <Route path="/profiles"  component={Profile} />
            <Route path="/nets"  component={Net} />
            <Route path="/storages"  component={Storage} />
            <Route path="/orders"  component={Orders} />
            <Route exact path="/"  component={App} />
            <Redirect to="/" />
          </Switch>
</BrowserRouter>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
