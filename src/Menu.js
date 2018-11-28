import React, { Component } from 'react';
import { Button, Box } from 'grommet';
import { VmMaintenance, Storage, Briefcase, Network, Article } from "grommet-icons"
import './style.scss';
import auth from './auth';

const Tools = (props) => (
<Box
  tag='div'
  gap="medium"
  background='neutral-1'
  pad="medium"
  width="medium"
  className="toolbox"
  {...props}
/>
);

const ToolsMenu = (props) => (
<Box
  tag='div'
  gap="medium"
  background='neutral-1'
  pad="medium"
  width="medium"
  className="toolsmenu"
  {...props}
/>
);

class AppMenu extends Component {

  constructor(props) {
    super(props)
    this.state = { admin: false
                 }
  }

  toProfiles = event => { window.location.replace('/profiles'); }
  toProjects = event => { window.location.replace('/projects'); }
  toNets = event => { window.location.replace('/nets'); }
  toOrders = event => { window.location.replace('/orders'); }
  toStorages = event => { window.location.replace('/storages'); }

  componentDidMount() {
     var jwt = localStorage.getItem('jwt');
      auth.checkAdmin(jwt,(res) => {
        this.setState({admin:res});
      });
  }

 render() {
    return (
        <Tools>
       {this.state.admin && (
       <ToolsMenu>
         <Button className="profilesButton" label="Projects" icon=<Briefcase />  color="brand" onClick={this.toProjects} />
         <Button className="profilesButton" label="Profiles" icon=<Article />  color="neutral-2" onClick={this.toProfiles} />
         <Button className="netsButton" label="Nets" icon=<Network />  color="accent-2" onClick={this.toNets} />
         <Button className="storagesButton" label="Storages" icon=<Storage />  color="accent-2" onClick={this.toStorages} />
         <Button className="ordersButton" label="Orders" icon=<VmMaintenance />  color="accent-3" onClick={this.toOrders} />
       </ToolsMenu>
       )}
       {!this.state.admin && (
       <ToolsMenu>
         <Button className="profilesButton" label="Projects" icon=<Briefcase />  color="brand" onClick={this.toProjects} />
       </ToolsMenu>
       )}

        </Tools>

    );
 }

}

export default AppMenu;
