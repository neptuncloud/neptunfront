import React, { Component } from 'react';
import { Select,  Layer, Text, TextInput, DataTable, Button, Box,  Grommet } from 'grommet';
import { Add, Storage, Trash } from "grommet-icons"
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

const DialogTable = (props) => (
<Box
  tag='div'
  gap="medium"
  background='neutral-4'
  pad="medium"
  width="large"
  className="dialogtable"
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
    this.state = { storages: [],
                   newStorage: false,
                   newStorageName: '',
                   deleteStorage: false,
                   deleteStorageName: '',
                   deleteStorageId: '',
                   editStorage: false,
                   editStorageId: '',
                   jwt: '',
                   alldatastores: [],
                   datastores: []

                 }
  }

  getVSphere = (type,callback) => {
    api.getVSphere(type,callback);
  }

  renderTrashButton = (data) => {
     return (
      <Button key={data.Name.id} className="trashButton" icon=<Trash /> primary={true} color="light-1" plain={true} value={data.Name.id}
                onClick={(event) => { this.setState({deleteStorage:true,deleteStorageName:data.Name.name,deleteStorageId:data.Name.id}); }} /> );
  }

  renderDatastoreTrashButton = (data) => {
     return ( <Button key={"del"+data.DelButton} className="trashButton" icon=<Trash /> primary={true} color="light-1" plain={true} value={data.DelButton}
                onClick={(event) => {
                      var datastores = this.state.datastores;
                      var index = -1;
                      for(var i = 0; i < datastores.length; i++)
                        if(datastores[i].Name === data.DelButton) index = i;
                      console.log(index);
                      if(index > -1)
                        datastores.splice(index,1);
                      this.setState({ datastores: datastores });
                   }} />
            );
  }

  renderStorage = (data) => {
     return ( 
      <Button key={"p"+data.Name.id} className="projectButton" icon=<Storage /> primary={true} color="light-1" plain={true} label={data.Name.name}
                onClick={(event) => { this.setState({editStorage:true,
                                                        newStorageName:data.Name.name,
                                                        editStorageId:data.Name.id,
                                                        datastores: data.Name.datastores
                                                        }); }} />
     );
  }
  
  getStorages = (jwt) => {
    api.get('storages',jwt,(res) => { 
          if (!Array.isArray(res)) res=[res]; 
          console.log(res);        
          var storages = []
          for (var i = 0; i < res.length; i++) {
             var _id = res[i].id;
             console.log(_id);
             console.log("TEST");
             var name = res[i].Name;
             var datastores = res[i].datastores;

             res[i].Button = "Del"+name;
             res[i].Object = name;      
             res[i].Name =  {
			     name:name,
			     id:_id,
			     datastores: datastores
                            }
             storages.push(res[i]);
          }
          this.setState({storages: storages});
    });

  }


  deleteStorage = (_id) => {
                     api.delete('storages',this.state.deleteStorageId,this.state.jwt,(res) => {
                        this.onClose();
                        this.getStorages(this.state.jwt);
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

    
    this.setState({storages: [{Name:'Loading...'}]});
    this.setState({jwt:jwt});
    this.getStorages(jwt);
    this.getVSphere('Datastore',(res) => {
       this.setState({ alldatastores: res.sort() });
    });
  }


  logout = () => {
     localStorage.setItem('jwt','');
     window.location.replace(config.default.api+'/connect/ldapauth');
  };

  newStorage = () => { this.setState({newStorage: true });   };
 
  onClose = () => { this.setState({ newStorage: undefined, deleteStorage: undefined, editStorage: undefined });   };

  newStorageCreate = () => {
    if(this.state.newStorage)
    {
    api.create('storages',{ Name: this.state.newStorageName, 
                            datastores: this.state.datastores
                             },this.state.jwt,(res) => { 
        console.log(res);         
        this.getStorages(this.state.jwt);
        this.onClose();
    });
    } else
    if(this.state.editStorage)
    {
    api.update('storages',this.state.editStorageId, { Name: this.state.newStorageName, 
                            datastores: this.state.datastores
                             },this.state.jwt,(res) => { 
        console.log(res);         
        this.getStorages(this.state.jwt);
        this.onClose();
    });
    }
  };
  
  newStorageNameChange = event => this.setState({ newStorageName: event.target.value });
  passChange = event => this.setState({ pass: event.target.value });


  addDatastore = () => {
    var datastores = this.state.datastores;
    var exists = false;
    for (var i = 0; i < datastores.length; i++)
      if(datastores[i].Name === this.state.datastore)
      {
         exists = true;
         break;
      }
    if(!exists && this.state.datastore !== '')
      datastores.push({ Name: this.state.datastore, DelButton: this.state.datastore });
    console.log(this.state.datastore);
    this.setState({ datastores: datastores });
  }


  render() {
    var columns = [ 
                     { property:'Object', header: 'Storage', primary:true, render: this.renderStorage }, 
                     { property:'Button', header: '', primary:false, render: this.renderTrashButton }, 
                  ];
    var datastoresColumns = [
                     { property:'Name', header: 'Datastore', primary:true },
                     { property:'DelButton', header: '', primary:false, render: this.renderDatastoreTrashButton },

                  ];




    return (
      <Grommet plain>
        <AppBar>
          <Text><a className="headerLabel" href="/" >Neptun</a></Text>
          <Button label="Logout" primary={true} color="neutral-1" onClick={this.logout} />
        </AppBar>
        <Main>
         <Button className="addButton" label="New Storage" icon=<Add />  color="neutral-1" onClick={this.newStorage} />
         <DataTable className="itemsTable" columns={columns} data={this.state.storages} />
        </Main>
        {(this.state.newStorage || this.state.editStorage) && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <Dialog>
          <TextInput  value={this.state.newStorageName}
                      onChange={this.newStorageNameChange}
                      size="small"
                      placeholder="Storage Name"
                      margin="medium" />
          <Box fill className="selectorWrapper" >
          <Select options={this.state.alldatastores}
                  placeholder="Select Datastore" 
                  value={this.state.datastore}
                  size="small"
                  onChange={({option}) => this.setState({datastore: option})} >
          </Select></Box>
          <Button className="adddsButton" label="Add Datastore" primary={true} color="accent-4" onClick={this.addDatastore}  />
          <DialogTable>
             <DataTable className="datastoresTable" columns={datastoresColumns} data={this.state.datastores} />
          </DialogTable>

          {(this.state.newStorage && (
          <Button className="addButton" label="Create" primary={true} color="neutral-1" onClick={this.newStorageCreate}  />
          ))}
          {(this.state.editStorage && (
          <Button className="addButton" label="Save" primary={true} color="neutral-1" onClick={this.newStorageCreate}  />
          ))}
          </Dialog>
          </Layer>
        )}
        {this.state.deleteStorage && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <DeleteDialog>
          <Text> Delete storage {this.state.deleteStorageName}? </Text>
          <Button className="addButton" label="Delete" primary={true} color="neutral-1" onClick={this.deleteStorage}  />
          </DeleteDialog>
          </Layer>
        )}
        <AppMenu />
      </Grommet>
    );
  }
}

export default App;
