import React, { Component } from 'react';
import { Select,  Layer, Text, TextInput, DataTable, Button, Box,  Grommet } from 'grommet';
import { Add, Network, Trash } from "grommet-icons"
import auth from './auth';
import api from './api';
import AppMenu from './Menu';
import './style.scss';

var config = require('./appconfig');

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

const Main = (props) => (
<Box 
  tag='div'
  gap="medium"
  background='neutral-4'
  pad="medium"
  width="large"
  className="mainbox"
  {...props}
/>
);

const Dialog = (props) => (
<Box 
  tag='div'
  gap="medium"
  background='neutral-4'
  pad="medium"
  width="large"
  className="dialog"
  {...props}
/>
);

const DeleteDialog = (props) => (
<Box 
  tag='div'
  gap="medium"
  background='neutral-5'
  pad="medium"
  width="large"
  className="deletedialog"
  {...props}
/>
);


class App extends Component {
  constructor(props) {
    super(props)
    this.state = { nets: [],
                   newNet: false,                  
                   newNetName: '',
                   editNet: false,
                   editNetId: '',
                   deleteNet: false,
                   deleteNetName: '',
                   deleteNetId: '',
                   jwt: '',
                   networks: [],
                   network: '',
                   ip: '',
                   gateway: '',
                   vms: [],
                   vmsuggestions: [],
                   template: '',

                 }
  }

  getVSphere = (type,callback) => {
    api.getVSphere(type,callback);
  }
  
  renderNet = (data) => {
      return (  <Button key={"p"+data.Name.id} className="projectButton" icon=<Network /> primary={true} color="light-1" plain={true} label={data.Name.name}
                onClick={(event) => { this.setState({editNet:true,
                                                        newNetName:data.Name.name,
                                                        editNetId:data.Name.id,
                                                        network: data.Name.network,
                                                        ip: data.Name.ip,
                                                        gateway: data.Name.gateway
                                                        }); }} />
             );
  }

  renderTrashButton = (data) => {
     return ( <Button key={"del"+data.Name.id} className="trashButton" icon=<Trash /> primary={true} color="light-1" plain={true} value={data.Name.id}
                onClick={(event) => { this.setState({deleteNet:true,deleteNetName:data.Name.name,deleteNetId:data.Name.id}); }} /> 
            );
  }

  getNets = (jwt) => {
    api.get('nets',jwt,(res) => { 
          if (!Array.isArray(res)) res=[res]; 
          console.log(res);        
          var nets = []
          for (var i = 0; i < res.length; i++) {
             var _id = res[i].id;
             console.log(_id);
             var name = res[i].Name;
             var ip = res[i].ip;
             var gateway = res[i].gateway;
             var vlan = res[i].vlan;
             res[i].Button = { name: name, id:_id };

            res[i].Name = {
                              name:name,
                              id:_id,
                              network: vlan,
                              ip: ip,
                              gateway: gateway
                          };

             nets.push(res[i]);
          }
          this.setState({nets: nets});
    });

  }

  deleteNet = (_id) => {
                     api.delete('nets',this.state.deleteNetId,this.state.jwt,(res) => {
                        this.onClose();
                        this.getNets(this.state.jwt);
                     });
                }


  componentDidMount() {
     console.log("Mount");
     var jwt = localStorage.getItem('jwt');
      auth.checkLogin(jwt,(res) => {
        console.log('GET jwt:'+res);
        if(!res) {
          window.location.replace(config.default.api+'/connect/ldapauth');
        } 
        
      });

    this.setState({nets: [{Name:'Loading...'}]});    

    this.setState({jwt:jwt});
    this.getNets(jwt);
    this.getVSphere('Network',(res) => {
       this.setState({ networks: res.sort() });
    });
  }


  logout = () => {
     localStorage.setItem('jwt','');
     window.location.replace(config.default.api+'/connect/ldapauth');
  };

  newNet = () => { this.setState({newNet: true });   };
 
  onClose = () => { this.setState({ newNet: undefined, deleteNet: undefined, editNet: undefined });   };

  newNetCreate = () => {
    if(this.state.newNet)
    {
    api.create('nets',{ Name: this.state.newNetName, 
                            vlan: this.state.network, 
                            ip: this.state.ip,
                            gateway: this.state.gateway
                             },this.state.jwt,(res) => { 
        console.log(res);         
        this.getNets(this.state.jwt);
        this.onClose();
    });
    } else
    if(this.state.editNet) 
    {
    api.update('nets',this.state.editNetId, { Name: this.state.newNetName, 
                            vlan: this.state.network, 
                            ip: this.state.ip,
                            gateway: this.state.gateway
                             },this.state.jwt,(res) => { 
        console.log(res);         
        this.getNets(this.state.jwt);
        this.onClose();
    });
    }
  };
  
  newNetNameChange = event => this.setState({ newNetName: event.target.value });
  passChange = event => this.setState({ pass: event.target.value });
  ipChange = event => this.setState({ ip: event.target.value });
  gatewayChange = event => this.setState({ gateway: event.target.value });

  templateChange = event => { 
     var vmsug = [];
     for (var i = 0; i < this.state.vms.length; i++)
       if(this.state.vms[i].toUpperCase().includes(event.target.value.toUpperCase()))
          vmsug.push(this.state.vms[i]);

     this.setState({ template: event.target.value, vmsuggestions: vmsug });
  }

  render() {
    var columns = [ 
                     { property:'Name', header: 'Net', primary:true, render:this.renderNet }, 
                     { property:'vlan', header: 'VLAN', primary:true }, 
                     { property:'ip', header: 'IP', primary:true }, 
                     { property:'Button', header: '', primary:false, render:this.renderTrashButton }, 
                  ];

    return (
      <Grommet plain>
        <AppBar>
          <Text><a className="headerLabel" href="/" >Neptun</a></Text>
          <Button label="Logout" primary={true} color="neutral-1" onClick={this.logout} />
        </AppBar>
        <Main>
         <Button className="addButton" label="New Net" icon=<Add />  color="neutral-1" onClick={this.newNet} />
         <DataTable className="netsTable" columns={columns} data={this.state.nets} />
        </Main>
        {(this.state.newNet || this.state.editNet) && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <Dialog>
          <TextInput  value={this.state.newNetName}
                      onChange={this.newNetNameChange}
                      size="small"
                      placeholder="Net Name"
                      margin="medium" />
          <Box fill className="selectorWrapper" >
          <Select options={this.state.networks}
                  placeholder="Select Network" 
                  value={this.state.network}
                  size="small"
                  onChange={({option}) => this.setState({network: option})} >
          </Select></Box>
          <TextInput  value={this.state.ip}
                      onChange={this.ipChange}
                      size="small"
                      placeholder="IP/MASK"
                      margin="medium" />
          <TextInput  value={this.state.gateway}
                      onChange={this.gatewayChange}
                      size="small"
                      placeholder="Gateway"
                      margin="medium" />
          {(this.state.newNet && (
          <Button className="addButton" label="Create" primary={true} color="neutral-1" onClick={this.newNetCreate}  />
          ))}
          {(this.state.editNet && (
          <Button className="addButton" label="Save" primary={true} color="neutral-1" onClick={this.newNetCreate}  />
          ))}

          </Dialog>
          </Layer>
        )}
        {this.state.deleteNet && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <DeleteDialog>
          <Text size="large" > Delete net {this.state.deleteNetName}? </Text>
          <Button className="delButton" label="Delete" primary={true} color="accent-4" onClick={this.deleteNet}  />
          </DeleteDialog>
          </Layer>
        )}
        <AppMenu />
      </Grommet>
    );
  }
}

export default App;
