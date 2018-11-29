import React, { Component } from 'react';
import { Select,  Layer, Text, TextInput, DataTable, Button, Box,  Grommet } from 'grommet';
import { Add, Cycle, VirtualMachine, Trash } from "grommet-icons"
import auth from './auth';
import api from './api';
import './style.scss';
import jwt_decode from 'jwt-decode';
import AppMenu from './Menu';

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
    this.state = { vms: [],
                   newVM: false,
                   newVMName: '',
                   deleteVM: false,
                   deleteVMName: '',
                   deleteVMId: '',
                   reorderVM: false,
                   reorderVMName: '',
                   reorderVMId: '',
                   editVM: false,
                   editVMId: '',
                   jwt: '',
                   netsdict: [],
                   nets: [],
                   network: '',
                   profilesdict: [],
                   profiles: [],
                   profile: '',
                   vmsuggestions: [],
                   template: '',

                 }
  }

  getVSphere = (type,callback) => {
    api.getVSphere(type,callback);
  }
  
  deleteVMDialog = (id,name) => {
    console.log('vmid:'+id);
    console.log('name:'+name);
    this.setState({deleteVM:true,deleteVMName:name,deleteVMId:id});
  }

  reorderVMDialog = (id,name) => {
    this.setState({reorderVM:true,reorderVMName:name,reorderVMId:id});
  }


  renderVM = (data) => {
     return ( <Button key={"vm"+data._id} className="projectButton" icon=<VirtualMachine /> primary={true} color="light-1" plain={true} label={data.Name.name}
                onClick={(event) => { this.setState({editVM:true,
                                                        newVMName:data.Name.name,
                                                        editVMId:data.Name.id,
                                                        profile: data.Name.profile,
                                                        network: data.Name.network,
                                                        cpu: data.Name.cpu.toString(),
                                                        ram: data.Name.ram.toString()
                                                        }); }} /> );

  }

  renderTrashButton = (data) => {
     console.log(data);
     return ( <Button key={"trash"+data.Name.id} name={data.Button.name} className="trashButton" icon=<Trash /> primary={true} color="light-1" plain={true} value={data.Name.id} onClick={() => {this.deleteVMDialog(data.Name.id,data.Name.name);}} /> );
  }

  renderReorderButton = (data) => {
     return ( <Button key={"reorded"+data.Name.id} name={data.Button.name} className="trashButton" icon=<Cycle /> primary={true} color="light-1" plain={true} value={data.Name.id} onClick={() => {this.reorderVMDialog(data.Name.id,data.Name.name);}} /> );
  }


  getVMs = (jwt,project) => {
    api.getFilter('vms',jwt,'Project='+project,(res) => { 
          if (!Array.isArray(res)) res=[res]; 
          console.log(res);        
          var vms = []
          for (var i = 0; i < res.length; i++) {
             var _id = res[i].id;
             console.log(_id);
             var name = res[i].Name;            
             var profile = res[i].Profile;
             if ( profile !== undefined ) profile = profile.Name
             var cpu = res[i].CPU;
             var ram = res[i].RAM;
             var network = res[i].Net;
             if ( network !== undefined ) network = network.Name

             res[i].Button = "Button";
             res[i].Reorder = "Reorder";
             res[i].Object = name;
             res[i].Name = { id: _id, name: name, profile: profile, cpu: cpu, ram: ram, network: network };
             res[i].Profile = profile;
             res[i].Net = network;

             vms.push(res[i]);
          }
          this.setState({vms: vms});
    });

  }

  getNets = (jwt) => {
    api.get('nets',jwt,(res) => {
          if (!Array.isArray(res)) res=[res];
          var nets = [];
          var netsdict = [];
          for (var i = 0; i < res.length; i++)
          {
            nets.push(res[i].Name) 
            netsdict[res[i].Name] = res[i]._id;
          }
          console.log(netsdict);
          this.setState({nets: nets, netsdict: netsdict});
    });

  }

  getProfiles = (jwt) => {
    api.get('profiles',jwt,(res) => {
          if (!Array.isArray(res)) res=[res];
          var profiles = [];
          var profilesdict = [];
          for (var i = 0; i < res.length; i++)
          {
            profiles.push(res[i].Name) 
            profilesdict[res[i].Name] = res[i]._id;
          }
          this.setState({profiles: profiles, profilesdict: profilesdict });
    });

  }

  deleteVM = (_id) => {
                        api.update('vms',this.state.deleteVMId, { State: 'Removed'
                             },this.state.jwt,(res) => {
                           this.getVMs(this.state.jwt,this.state.project);
                           this.onClose();
                         });
                }

  reorderVM = (_id) => {
                        api.update('vms',this.state.reorderVMId, { State: 'Order'
                             },this.state.jwt,(res) => {
                           this.getVMs(this.state.jwt,this.state.project);
                           this.onClose();
                         });
                }


  componentDidMount() {
     console.log("Mount");
     var project = this.props.location.pathname.split('/')[2]

     var jwt = localStorage.getItem('jwt');
      auth.checkLogin(jwt,(res) => {
        console.log('GET jwt:'+res);
        if(!res) {
          window.location.replace(config.default.api+'/connect/ldapauth');
        } 
        
      });

    

    this.setState({jwt:jwt, project:project});
    this.getVMs(jwt,project);
    this.getNets(jwt);
    this.getProfiles(jwt);

  }


  logout = () => {
     localStorage.setItem('jwt','');
     window.location.replace(config.default.api+'/connect/ldapauth');
  };

  newVM = () => { this.setState({newVM: true });   };
 
  onClose = () => { this.setState({ newVM: undefined, deleteVM: undefined, editVM: undefined, reorderVM: undefined });   };

  newVMCreate = () => {
    if(this.state.newVM)
    {
    var user_id = jwt_decode(this.state.jwt)._id;
    api.create('vms',{ Name: this.state.newVMName, 
                            Net: this.state.netsdict[this.state.network], 
                            Profile: this.state.profilesdict[this.state.profile],
                            CPU: this.state.cpu,
                            RAM: this.state.ram,
                            Project: this.state.project,                                                        
			    State: 'Order'
                             },this.state.jwt,(res) => { 
        console.log(res);         
        this.getVMs(this.state.jwt,this.state.project);
        this.onClose();
    });
    } else
    if(this.state.editVM)
    {
    api.update('vms',this.state.editVMId, { Name: this.state.newVMName,
                            Net: this.state.netsdict[this.state.network],
                            Profile: this.state.profilesdict[this.state.profile],
                            CPU: this.state.cpu,
                            RAM: this.state.ram,
                            Project: this.state.project
                             },this.state.jwt,(res) => { 
        console.log(res);         
        this.getVMs(this.state.jwt,this.state.project);
        this.onClose();
    });
    }
  };
  
  newVMNameChange = event => this.setState({ newVMName: event.target.value });
  passChange = event => this.setState({ pass: event.target.value });
  cpuChange = event => this.setState({ cpu: event.target.value });
  ramChange = event => this.setState({ ram: event.target.value });

  templateChange = event => { 
     var vmsug = [];
     for (var i = 0; i < this.state.vms.length; i++)
       if(this.state.vms[i].toUpperCase().includes(event.target.value.toUpperCase()))
          vmsug.push(this.state.vms[i]);

     this.setState({ template: event.target.value, vmsuggestions: vmsug });
  }

  render() {
    var columns = [ 
                     { property:'Object', header: 'VM', primary:true, render: this.renderVM  }, 
                     { property:'Profile', header: 'Profile', primary:false }, 
                     { property:'Net', header: 'Net', primary:false }, 
                     { property:'ip', header: 'IP', primary:false }, 
                     { property:'datastore', header: 'Datastore', primary:false }, 
                     { property:'State', header: 'State', primary:false }, 
                     { property:'Button', header: '', primary:false, render: this.renderTrashButton }, 
                     { property:'Reorder', header: '', primary:false, render: this.renderReorderButton }, 
                  ];

    return (
      <Grommet plain>
        <AppBar>
          <Text><a className="headerLabel" href="/" >Neptun</a></Text>
          <Button label="Logout" primary={true} color="neutral-1" onClick={this.logout} />
        </AppBar>
        <Main>
         <Button className="addButton" label="New VM" icon=<Add />  color="neutral-1" onClick={this.newVM} />
         <DataTable primaryPropery="property" name="vmsTable" className="vmsTable" columns={columns} data={this.state.vms} />
        
        </Main>
        {(this.state.newVM || this.state.editVM) && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <Dialog>
          <TextInput  value={this.state.newVMName}
                      onChange={this.newVMNameChange}
                      size="small"
                      placeholder="VM Name"
                      margin="medium" />
          <Box fill className="selectorWrapper" >
          <Select options={this.state.profiles}
                  placeholder="Select Profile" 
                  value={this.state.profile}
                  size="small"
                  onChange={({option}) => this.setState({profile: option})} >
          </Select></Box>
          <TextInput 
                  placeholder="CPU" 
                  value={this.state.cpu}
                  onChange={this.cpuChange}
                  size="xsmall" >
          </TextInput>
          <TextInput 
                  placeholder="RAM (GB)" 
                  value={this.state.ram}
                  onChange={this.ramChange}
                  size="xsmall" >

          </TextInput>
          <Box fill className="selectorWrapper" >
          <Select options={this.state.nets}
                  placeholder="Select Network" 
                  value={this.state.network}
                  size="small"
                  onChange={({option}) => this.setState({network: option})} >
          </Select></Box>
          {(this.state.newVM && (
          <Button className="addButton" label="Create" primary={true} color="neutral-1" onClick={this.newVMCreate}  />
          ))}
          {(this.state.editVM && (
          <Button className="addButton" label="Save" primary={true} color="neutral-1" onClick={this.newVMCreate}  />
          ))}
          </Dialog>
          </Layer>
        )}
        {this.state.deleteVM && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <DeleteDialog>
          <Text> Delete VM {this.state.deleteVMName}? </Text>
          <Button className="addButton" label="Delete" primary={true} color="neutral-1" onClick={this.deleteVM}  />
          </DeleteDialog>
          </Layer>
        )}
        {this.state.reorderVM && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <DeleteDialog>
          <Text> Reorder VM {this.state.deleteVMName}? </Text>
          <Button className="addButton" label="Reorder" primary={true} color="neutral-1" onClick={this.reorderVM}  />
          </DeleteDialog>
          </Layer>
        )}
        <AppMenu />
      </Grommet>
    );
  }
}

export default App;
