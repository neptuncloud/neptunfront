import React, { Component } from 'react';
import { Layer, Text, TextInput, DataTable, Button, Box,  Grommet } from 'grommet';
import { Add, Edit, Trash, FormLock } from "grommet-icons"
import auth from './auth';
import api from './api';
import './style.scss';
import AppMenu from './Menu';
import jwt_decode from 'jwt-decode';

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
    this.state = { projects: [],
                   newProject: false,
                   newProjectName: '',
                   deleteProject: false,
                   deleteProjectName: '',
                   deleteProjectId: '',
                   grantProject: false,
                   grantProjectName: '',
                   grantProjectId: '',
                   newGrant: '',
                   users: [],
                   usersdict: [],
                   grantSuggestions: [],
                   jwt: ''
                 }
  }

  renderTrashButton = (data) => {
     return ( <Button key={"del"+data.Name.id} className="trashButton" icon=<Trash /> primary={true} color="light-1" plain={true} value={data.Name.id}
                onClick={(event) => { this.setState({deleteProject:true,deleteProjectName:data.Name.name,deleteProjectId:data.Name.id}); }} />
            );
  }

  renderEditButton = (data) => {
     return ( <Button key={"ed"+data.Name.id} className="trashButton" icon=<Edit /> primary={true} color="light-1" plain={true} value={data.Name.id}
                onClick={(event) => { this.setState({editProject:true,newProjectName:data.Name.name,editProjectId:data.Name.id}); }} />
            );
  }

  renderGrantTrashButton = (data) => {
     return ( <Button key={"del"+data.DelButton} className="trashButton" icon=<Trash /> primary={true} color="light-1" plain={true} value={data.DelButton}
                onClick={(event) => {
                      var grants = this.state.grants;
                      var index = -1;
                      for(var i = 0; i < grants.length; i++)
                        if(grants[i].Username === data.DelButton) index = i;
                      console.log(index);
                      if(index > -1)
                        grants.splice(index,1);
                      this.setState({ grants: grants, newGrant: '' });
                   }} />
            );
  }

  renderGrantButton = (data) => {
     return ( <Button key={"del"+data.Name.id} className="trashButton" icon=<FormLock /> primary={true} color="light-1" plain={true} value={data.Name.id}
                onClick={(event) => { this.setState({grantProject:true,grantProjectName:data.Name.name,grantProjectId:data.Name.id, 
                                                       grants: data.Grant.admins }); }} />
            );
  }

  renderProject = (data) => {
     return (  <Text className="itemLink" key={"proj"+data.Name.id} size="large"><a href={"/project/"+data.Name.id} >{data.Name.name}</a></Text> );
  }
  
  getUsers = (jwt) => {
    api.get('users',jwt,(res) => { 
          if (!Array.isArray(res)) res=[res]; 
          var users = [];
          var usersdict = [];
          for(var i = 0; i < res.length; i++) {
             users.push(res[i].username);
             usersdict[res[i].username] = res[i]._id;
          }
          this.setState({users: users, usersdict: usersdict});
    });
  }

  getProjects = (jwt) => {
    api.get('projectsAdmin',jwt,(res) => { 
          if (!Array.isArray(res)) res=[res]; 
          console.log(res);        
          var projects = []
          for (var i = 0; i < res.length; i++) {
             var _id = res[i]._id;
             var name = res[i].Name;
             var grants = [];
             for (var j = 0; j < res[i].admins.length; j++) {
                grants.push({ Username: res[i].admins[j].username, DelButton: res[i].admins[j].username })
             }   
             res[i].key = _id;
             res[i].Button = { name:name, id:_id };
             res[i].Name = { name:name, id:_id };
             res[i].Grant = { name:name, id:_id, admins: grants };
             res[i].Edit = { name:name, id:_id  };
             res[i].owner = res[i].owner.username;
             projects.push(res[i]);
          }
          api.get('projectsOwner',jwt,(res) => {
            if (!Array.isArray(res)) res=[res];
            console.log(res);
            for (var i = 0; i < res.length; i++) {
               var _id = res[i]._id;
               var name = res[i].Name;
               var grants = [];
               for (var j = 0; j < res[i].admins.length; j++) {
                  grants.push({ Username: res[i].admins[j].username, DelButton: res[i].admins[j].username })
               }
               res[i].key = _id;
               res[i].Button = { name:name, id:_id };
               res[i].Name = { name:name, id:_id };
               res[i].Grant = { name:name, id:_id, admins: grants };
               res[i].Edit = { name:name, id:_id  };
               res[i].owner = res[i].owner.username;
               projects.push(res[i]);
            }

            this.setState({projects: projects});
         });
    });

  }

  deleteProject = (_id) => {
                     api.delete('projects',this.state.deleteProjectId,this.state.jwt,(res) => {
                        this.onClose();
                        this.getProjects(this.state.jwt);
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

    

    this.setState({jwt:jwt});
    this.getProjects(jwt);
    this.getUsers(jwt);
  }


  logout = () => {
     localStorage.setItem('jwt','');
     window.location.replace(config.default.api+'/connect/ldapauth');
  };

  newProject = () => { this.setState({newProject: true });   };
 
  onClose = () => { this.setState({ newProject: undefined, deleteProject: undefined, grantProject: undefined, editProject: undefined });   };

  newProjectCreate = () => {
    var user_id = jwt_decode(this.state.jwt)._id;
    api.create('projects',{ Name: this.state.newProjectName, owner:user_id },this.state.jwt,(res) => { 
        console.log(res);         
        this.getProjects(this.state.jwt);
        this.onClose();
    });

  };

  projectUpdate = () => {
    api.update('projects',this.state.editProjectId,{ Name: this.state.newProjectName },this.state.jwt,(res) => { 
        console.log(res);         
        this.getProjects(this.state.jwt);
        this.onClose();
    });

  };

  grantProject = () => {
    var admins = [];
    for(var i = 0; i < this.state.grants.length; i++) {
      admins.push(this.state.usersdict[this.state.grants[i].Username]); 
    }
    api.update('projects',this.state.grantProjectId,{ admins: admins },this.state.jwt,(res) => { 
        console.log(res);         
        this.getProjects(this.state.jwt);
        this.onClose();
    });

  };

  addGrant = () => {
    var grants = this.state.grants;
    var exists = false;
    for (var i = 0; i < grants.length; i++)
      if(grants[i].Username === this.state.newGrant)
      {
         exists = true;
         break;
      }
    if(!exists && this.state.newGrant !== '')
      grants.push({ Username: this.state.newGrant, DelButton: this.state.newGrant });
    console.log(this.state.newGrant);
    this.setState({ grants: grants, newGrant: '' });
  } 

  newProjectNameChange = event => this.setState({ newProjectName: event.target.value });
  passChange = event => this.setState({ pass: event.target.value });
  newGrantChange = event => { 
     var usersug = [];
     for (var i = 0; i < this.state.users.length; i++)
       if(this.state.users[i].toUpperCase().includes(event.target.value.toUpperCase()))
          usersug.push(this.state.users[i]);


       this.setState({ newGrant: event.target.value, grantSuggestions: usersug });
  }

  render() {
    var columns = [ 
                     { property:'Name', header: 'Project', primary:true, render: this.renderProject }, 
                     { property:'owner', header: 'Owner', primary:false }, 
                     { property:'Button', header: '', primary:false, render: this.renderTrashButton }, 
                     { property:'Grant', header: '', primary:false, render: this.renderGrantButton },
                     { property:'Edit', header: '', primary:false, render: this.renderEditButton } 
                  ];

    var grantColumns = [ 
                     { property:'Username', header: 'User', primary:true },
                     { property:'DelButton', header: '', primary:false, render: this.renderGrantTrashButton },

                  ];

    return (
      <Grommet plain>
        <AppBar>
          <Text><a className="headerLabel" href="/" >Neptun</a></Text>
          <Button label="Logout" primary={true} color="neutral-1" onClick={this.logout} />
        </AppBar>
        <Main>
         <Button className="addButton" label="New Project" icon=<Add />  color="neutral-1" onClick={this.newProject} />
         <DataTable className="itemsTable" columns={columns} data={this.state.projects} />
        </Main>
        {(this.state.newProject || this.state.editProject) && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <Dialog>
          <TextInput  value={this.state.newProjectName}
                      onChange={this.newProjectNameChange}
                      size="small"
                      placeholder="Project Name"
                      margin="medium" />
          {this.state.newProject && (
          <Button className="addButton" label="Create"  primary={true} color="neutral-1" onClick={this.newProjectCreate}  />
          )}
          {this.state.editProject && (
          <Button className="addButton" label="Save"  primary={true} color="neutral-1" onClick={this.projectUpdate}  />
          )}

          </Dialog>
          </Layer>
        )}
        {this.state.deleteProject && (
          <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <DeleteDialog>
          <Text> Delete project {this.state.deleteProjectName}? </Text>
          <Button className="delButton" label="Delete" primary={true} color="accent-4" onClick={this.deleteProject}  />
          </DeleteDialog>
          </Layer>

        )}
        {this.state.grantProject && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <Dialog>
             <Text> <strong>GRANTS</strong> for {this.state.grantProjectName} </Text>
             <TextInput  value={this.state.newGrant}
                      onChange={this.newGrantChange}
                      size="small"
                      placeholder="Username" 
                      margin="medium" 
                      suggestions={this.state.grantSuggestions} 
                      onSelect={event => this.setState({ newGrant: event.suggestion })} />

             <Button className="addButton" label="Add User" primary={true} color="accent-4" onClick={this.addGrant}  />
             <DialogTable>
             <DataTable className="grantsTable" columns={grantColumns} data={this.state.grants} />
             </DialogTable>

             <Button className="saveButton" label="Save" primary={true} color="brand" onClick={this.grantProject}  />
          </Dialog>
          </Layer>
        )}
        <AppMenu />
      </Grommet>
    );
  }
}

export default App;
