import React, { Component } from 'react';
import { Select,  Layer, Text, TextInput, DataTable, Button, Box,  Grommet } from 'grommet';
import { Add, Article, Trash } from "grommet-icons"
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
  background='neutral-4'
  pad="medium"
  width="large"
  className="deletedialog"
  {...props}
/>
);


class App extends Component {
  constructor(props) {
    super(props)
    this.state = { profiles: [],
                   newProfile: false,
                   newProfileName: '',
                   deleteProfile: false,
                   deleteProfileName: '',
                   deleteProfileId: '',
                   editProfile: false,
                   editProfileId: '',
                   jwt: '',
                   datacenters: [],
                   datacenter: '',
                   datastores: [],
                   datastore: '',
                   resourcepools: [],
                   resourcepool: '',
                   vms: [],
                   vmsuggestions: [],
                   template: '',
                   storages: [],
                   storagesdict: [],
                   storage: ''
 
                 }
  }

  getVSphere = (type,callback) => {
    api.getVSphere(type,callback);
  }

  renderTrashButton = (data) => {
     return (
      <Button key={data.Name.id} className="trashButton" icon=<Trash /> primary={true} color="light-1" plain={true} value={data.Name.id}
                onClick={(event) => { this.setState({deleteProfile:true,deleteProfileName:data.Name.name,deleteProfileId:data.Name.id}); }} /> );
  }

  renderProfile = (data) => {
     return ( 
      <Button key={"p"+data.Name.id} className="projectButton" icon=<Article /> primary={true} color="light-1" plain={true} label={data.Name.name}
                onClick={(event) => { this.setState({editProfile:true,
                                                        newProfileName:data.Name.name,
                                                        editProfileId:data.Name.id,
                                                        datacenter: data.Name.datacenter,
                                                        storage: data.Name.storage,
                                                        resourcepool: data.Name.resourcepool,
                                                        template: data.Name.template
                                                        }); }} />
     );
  }
  
  getStorages = (jwt) => {
     api.get('storages',jwt,(res) => {
          if (!Array.isArray(res)) res=[res];
          var storages = [];
          var storagesdict = [];
          for(var i = 0; i < res.length; i++) {
             storages.push(res[i].Name);
             storagesdict[res[i].Name] = res[i]._id;
          }
          this.setState({ storages: storages, storagesdict: storagesdict });
     });
  }

  getProfiles = (jwt) => {
    api.get('profiles',jwt,(res) => { 
          if (!Array.isArray(res)) res=[res]; 
          console.log(res);        
          var profiles = []
          for (var i = 0; i < res.length; i++) {
             var _id = res[i].id;
             console.log(_id);
             console.log("TEST");
             var name = res[i].Name;
             var datacenter = res[i].Datacenter;
             var storage = res[i].Storage;
             if ( storage != undefined )
               storage = storage.Name;
             var resourcepool = res[i].ResourcePool;
             var template = res[i].Template;

             res[i].Button = "Del"+name;
             res[i].Object = name;      
             res[i].Name =  {
			     name:name,
			     id:_id,
			     datacenter: datacenter,
			     storage: storage,
			     resourcepool: resourcepool,
			     template: template
                            }
             profiles.push(res[i]);
          }
          this.setState({profiles: profiles});
    });

  }


  deleteProfile = (_id) => {
                     api.delete('profiles',this.state.deleteProfileId,this.state.jwt,(res) => {
                        this.onClose();
                        this.getProfiles(this.state.jwt);
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

    
    this.setState({profiles: [{Name:'Loading...'}]});
    this.setState({jwt:jwt});
    this.getProfiles(jwt);
    this.getStorages(jwt);
    this.getVSphere('Datacenter',(res) => {
       this.setState({ datacenters: res.sort() });
    });
    this.getVSphere('Datastore',(res) => {
       this.setState({ datastores: res.sort() });
    });
    this.getVSphere('ResourcePool',(pools) => {
      this.getVSphere('ClusterComputeResource',(clusters) => {
           var res = []
           for(var i = 0; i < pools.length; i++)
           {
             for(var j = 0; j < clusters.length; j++)
             {
                if(pools[i].includes(clusters[j][1]))
                  res.push(pools[i].replace(clusters[j][1],clusters[j][0]))
             }
           }
            this.setState({ resourcepools: res.sort() });
      });
    });
    this.getVSphere('VirtualMachine',(res) => {
       this.setState({ vms: res });
    });
  }


  logout = () => {
     localStorage.setItem('jwt','');
     window.location.replace(config.default.api+'/connect/ldapauth');
  };

  newProfile = () => { this.setState({newProfile: true });   };
 
  onClose = () => { this.setState({ newProfile: undefined, deleteProfile: undefined, editProfile: undefined });   };

  newProfileCreate = () => {
    if(this.state.newProfile)
    {
    api.create('profiles',{ Name: this.state.newProfileName, 
                            Datacenter: this.state.datacenter,
                            Storage: this.state.storagesdict[this.state.storage],
                            ResourcePool: this.state.resourcepool,
                            Template: this.state.template
                             },this.state.jwt,(res) => { 
        console.log(res);         
        this.getProfiles(this.state.jwt);
        this.onClose();
    });
    } else
    if(this.state.editProfile)
    {
    api.update('profiles',this.state.editProfileId, { Name: this.state.newProfileName, 
                            Datacenter: this.state.datacenter,
                            Storage: this.state.storagesdict[this.state.storage],
                            ResourcePool: this.state.resourcepool,
                            Template: this.state.template
                             },this.state.jwt,(res) => { 
        console.log(res);         
        this.getProfiles(this.state.jwt);
        this.onClose();
    });
    }
  };
  
  newProfileNameChange = event => this.setState({ newProfileName: event.target.value });
  passChange = event => this.setState({ pass: event.target.value });

  templateChange = event => { 
     var vmsug = [];
     for (var i = 0; i < this.state.vms.length; i++)
       if(this.state.vms[i].toUpperCase().includes(event.target.value.toUpperCase()))
          vmsug.push(this.state.vms[i]);

     this.setState({ template: event.target.value, vmsuggestions: vmsug });
  }

  render() {
    var columns = [ 
                     { property:'Object', header: 'Profile', primary:true, render: this.renderProfile }, 
                     { property:'Button', header: '', primary:false, render: this.renderTrashButton }, 
                  ];

    return (
      <Grommet plain>
        <AppBar>
          <Text><a className="headerLabel" href="/" >Neptun</a></Text>
          <Button label="Logout" primary={true} color="neutral-1" onClick={this.logout} />
        </AppBar>
        <Main>
         <Button className="addButton" label="New Profile" icon=<Add />  color="neutral-1" onClick={this.newProfile} />
         <DataTable className="itemsTable" columns={columns} data={this.state.profiles} />
        </Main>
        {(this.state.newProfile || this.state.editProfile) && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <Dialog>
          <TextInput  value={this.state.newProfileName}
                      onChange={this.newProfileNameChange}
                      size="small"
                      placeholder="Profile Name"
                      margin="medium" />
          <Box fill className="selectorWrapper" >
          <Select options={this.state.datacenters}
                  placeholder="Select Datacenter" 
                  value={this.state.datacenter}
                  size="small"
                  onChange={({option}) => this.setState({datacenter: option})} >
          </Select></Box>
          <Box fill className="selectorWrapper" >
          <Select options={this.state.storages}
                  placeholder="Select Storage" 
                  value={this.state.storage}
                  size="small"
                  onChange={({option}) => this.setState({storage: option})} >
          </Select></Box>
          <Box fill className="selectorWrapper" >
          <Select options={this.state.resourcepools}
                  placeholder="Select ResourcePool" 
                  value={this.state.resourcepool}
                  size="small"
                  onChange={({option}) => this.setState({resourcepool: option})} >
          </Select></Box>
          <TextInput suggestions={this.state.vmsuggestions}
                  placeholder="Select Template" 
                  value={this.state.template}
                  onChange={this.templateChange}
                  size="small"
                  onSelect={event => this.setState({ template: event.suggestion })} >
          </TextInput>
          {(this.state.newProfile && (
          <Button className="addButton" label="Create" primary={true} color="neutral-1" onClick={this.newProfileCreate}  />
          ))}
          {(this.state.editProfile && (
          <Button className="addButton" label="Save" primary={true} color="neutral-1" onClick={this.newProfileCreate}  />
          ))}
          </Dialog>
          </Layer>
        )}
        {this.state.deleteProfile && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <DeleteDialog>
          <Text> Delete profile {this.state.deleteProfileName}? </Text>
          <Button className="addButton" label="Delete" primary={true} color="neutral-1" onClick={this.deleteProfile}  />
          </DeleteDialog>
          </Layer>
        )}
        <AppMenu />
      </Grommet>
    );
  }
}

export default App;
