import React, { Component } from 'react';
import { InfiniteScroll, CheckBox, Select,  Layer, Text, TextInput, DataTable, Button, Box,  Grommet } from 'grommet';
import { VirtualMachine, Trash } from "grommet-icons"
import auth from './auth';
import api from './api';
import './style.scss';
import AppMenu from './Menu';

var Convert = require('ansi-to-html');
var convert = new Convert({newline:true});

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

const PlanDialog = (props) => (
<Box 
  tag='div'
  gap="medium"
  background='neutral-4'
  pad="medium"
  width="large"
  className="plandialog"
  {...props}
/>
);


class Orders extends Component {
  constructor(props) {
    super(props)
    this.state = { vms: [],
                   deletevms: [],
                   newVM: false,
                   newVMName: '',
                   deleteVM: false,
                   deleteVMName: '',
                   deleteVMId: '',
                   editVM: false,
                   editVMId: '',
                   jwt: '',
                   netsdict: [],
                   nets: [],
                   network: '',
                   datacenter: '',
                   resourcepool: '',
                   profilesdict: [],
                   profiles: [],
                   profile: '',
                   vmsuggestions: [],
                   template: '',
                   manualip: false,
                   plan: '',
                   showPlan: false,
                   showApply: false,
                   prepareDisabled: false
                 }
  }

  getVSphere = (type,callback) => {
    api.getVSphere(type,callback);
  }
  
  deleteVMDialog = (event) => {
    console.log('vmid:'+event.target.value);
    console.log('name:'+event.target.name);
    this.setState({deleteVM:true,deleteVMName:event.target.name,deleteVMId:event.target.value});
  }



  changeProfile = (option) => {
    console.log(this.state.profilesdict);
    console.log(option);   
    var profileData = this.state.profilesdict[option.value];
    console.log(profileData);
    this.setState({profile: option.value,
                   datacenter: profileData.Datacenter,
                   datastore: profileData.Datastore,
                   resourcepool: profileData.ResourcePool,
                   template: profileData.Template
                   });
  }

  changeNet = (option) => {
    var netData = this.state.netsdict[option.value];
        
    api.getFreeIPs(netData.ip,(res) => {
        this.setState({freeips:res, ip:res[0]});
    });

    var mask = 0;
    var pmask = netData.ip.split('/');
    if(pmask.length > 0) mask = pmask[1];

    this.setState({network: option.value,
                   vlan: netData.vlan,
                   gateway: netData.gateway,
                   mask: mask,
                   ip: 'Checking...'
                   });
  }

  renderVM = (data) => {
     return ( <Button key={"vm"+data._id} className="projectButton" icon=<VirtualMachine /> primary={true} color="light-1" plain={true} label={data.Name.name}
                onClick={(event) => { 
                                              api.getFreeIPs(data.Name.netip,(res) => { 
                                                   if(!this.state.ip)                                                    
                                                     this.setState({freeips:res, ip:res[0], prepareDisabled: false}); else
                                                     this.setState({freeips:res, prepareDisabled: false});
                                              });
                                              this.setState({editVM:true,
                                                        newVMName:data.Name.name,
                                                        editVMId:data.Name.id,
                                                        profile: data.Name.profile,
                                                        network: data.Name.network,
                                                        cpu: data.Name.cpu.toString(),
                                                        ram: data.Name.ram.toString(),
                                                        datacenter: data.Name.datacenter,
                                                        datastore: data.Name.datastore,
                                                        resourcepool: data.Name.resourcepool,
                                                        template: data.Name.template,
							vlan: data.Name.vlan,
                                                        ip: data.Name.ip,
                                                        gateway: data.Name.gateway,
                                                        mask: data.Name.mask,
                                                        prepareDisabled: true
                                                        }); }} /> );

  }

  renderTrashButton = (data) => {
     return ( <Button key={"del"+data.Name.id} name={data.Name.name} className="trashButton" icon=<Trash /> primary={true} color="light-1" plain={true} value={data.Name.id} onClick={this.deleteVMDialog} /> );
  }

  getVMsByState = (jwt,state) => {

    api.getFilter('vms',jwt,'State='+state,(res) => { 
          if (!Array.isArray(res)) res=[res]; 
          console.log(res);        
          var vms = []
          for (var i = 0; i < res.length; i++) {
             var _id = res[i].id;
             console.log(_id);
             var name = res[i].Name;            
             var profile = res[i].Profile;
             var profileName = '';
             var datacenter = '';
             var datastore = '';
             var resourcepool = '';
             var template = '';   
             if ( profile !== undefined ) 
             { 
		profileName = profile.Name
                datacenter = profile.Datacenter;
                datastore = profile.Datastore;
                resourcepool = profile.ResourcePool;
                template = profile.Template;
             }
           
             var cpu = res[i].CPU;
             var ram = res[i].RAM;
             var network = res[i].Net;
             var vlan = '';
             var gateway = '192.168.0.1';
             var mask = 0;
             var netip = '192.168.0.1/32';           
             var ip = res[i].ip;
             if ( network !== undefined ) { 
               vlan = network.vlan;
               netip = network.ip;
               gateway = network.gateway;
               var pmask = network.ip.split('/');
               if(pmask.length > 0) mask = pmask[1];
               network = network.Name
             }
             var project = res[i].Project;
             if ( project !== undefined ) project = project.Name

             res[i].Button = { id: _id, name: name };
             res[i].Name = { id: _id, name: name, 
				profile: profileName,
				cpu: cpu, 
				ram: ram, 
				network: network,
				datacenter: datacenter,
                                resourcepool: resourcepool,
                                datastore: datastore,
                                template: template,
                                vlan: vlan,
                                ip: ip,
                                netip: netip,
                                gateway: gateway,
                                mask: mask
                         };
             res[i].Profile = profileName;
             res[i].Net = network;
             res[i].Project = project;

             vms.push(res[i]);
          }
          if(state === 'Order')
            this.setState({vms: vms});
          if(state === 'Removed')
            this.setState({deletevms: vms});
    });

  }

  getVMs = (jwt) => {
     this.getVMsByState(jwt,'Order');
     this.getVMsByState(jwt,'Removed');
  }

  getNets = (jwt) => {
    api.get('nets',jwt,(res) => {
          if (!Array.isArray(res)) res=[res];
          var nets = [];
          var netsdict = [];
          for (var i = 0; i < res.length; i++)
          {
            nets.push(res[i].Name) 
            netsdict[res[i].Name] = res[i];
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
            profilesdict[res[i].Name] = res[i];
          }
          this.setState({profiles: profiles, profilesdict: profilesdict });
    });

  }

  deleteVM = (_id) => {

                     api.delete('vms',this.state.deleteVMId,this.state.jwt,(res) => {
                        this.onClose();
                        this.getVMs(this.state.jwt);
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
    this.getVMs(jwt);
    this.getNets(jwt);
    this.getProfiles(jwt);
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
    this.getVSphere('Network',(res) => {
       this.setState({ vlans: res.sort() });
    });
    this.getVSphere('VirtualMachine',(res) => {
       this.setState({ templates: res });
    });
  }


  logout = () => {
     localStorage.setItem('jwt','');
     window.location.replace(config.default.api+'/connect/ldapauth');
  };

  newVM = () => { this.setState({newVM: true });   };
 
  onClose = () => { this.setState({ newVM: undefined, deleteVM: undefined, editVM: undefined  });   };

  onClosePlan = () => { this.setState({ showPlan: undefined, showApply: false  });   };

  newVMPrepare = () => {
    if(this.state.editVM)
    {
      api.update('vms',this.state.editVMId, { Name: this.state.newVMName,
                            Net: this.state.netsdict[this.state.network],
                            Profile: this.state.profilesdict[this.state.profile],
                            CPU: this.state.cpu,
                            RAM: this.state.ram,
                            ip: this.state.ip
                             },this.state.jwt,(res) => {
             this.onClose();
             var timerId = setInterval(() => {
               api.showLog({ vmname: this.state.newVMName },this.state.jwt,(res) => {
               this.setState({ plan: convert.toHtml(res), showPlan: true});
             });
             }, 500);
             api.prepareVM({ vmname: this.state.newVMName,
                            vlan: this.state.vlan,
                            datacenter: this.state.datacenter,
                            datastore: this.state.datastore,
                            resourcepool: this.state.resourcepool,
                            template: this.state.template,
                            ip: this.state.ip,
                            cpu: this.state.cpu,
                            ram: this.state.ram*1024,
                            gateway: this.state.gateway,
                            mask: this.state.mask
                             },this.state.jwt,(res) => {
              api.showLog({ vmname: this.state.newVMName },this.state.jwt,(res) => {
                this.setState({ plan: convert.toHtml(res), showPlan: true});
                clearInterval(timerId);
              });

             this.getVMs(this.state.jwt);
          });
      });
 
    }
  };

  newVMProvide = () => {
    if(this.state.showPlan)
    {
      var timerId = setInterval(() => {
               api.showLog({ vmname: this.state.newVMName },this.state.jwt,(res) => {
               this.setState({ plan: convert.toHtml(res), showPlan: false, showApply: true});
             });
      }, 500);

      api.provideVM({ vmname: this.state.newVMName },this.state.jwt,(res) => {
            api.showLog({ vmname: this.state.newVMName },this.state.jwt,(res) => {
               this.setState({ plan: convert.toHtml(res), showApply: true});
               clearInterval(timerId); 
             });
           if(res == 0) 
             api.update('vms',this.state.editVMId, { State: 'VM' },this.state.jwt,(res) => {
                             this.getVMs(this.state.jwt);
                           });
      });
    }
  };
  
  newVMNameChange = event => this.setState({ newVMName: event.target.value });
  passChange = event => this.setState({ pass: event.target.value });
  cpuChange = event => this.setState({ cpu: event.target.value });
  ramChange = event => this.setState({ ram: event.target.value });
  ipChange = event => this.setState({ ip: event.target.value });
  manualipChange = event => this.setState({ manualip: event.target.checked });
  
  templateChange = event => { 
     var vmsug = [];
     for (var i = 0; i < this.state.templates.length; i++)
       if(this.state.templates[i].toUpperCase().includes(event.target.value.toUpperCase()))
          vmsug.push(this.state.templates[i]);

     this.setState({ template: event.target.value, vmsuggestions: vmsug });
  }

  scrollToBottom = () => {
     console.log("SCROLL");
     this.messageList.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }
  componentDidUpdate = () => {
    if (this.messageList)
      this.scrollToBottom();
  } 

  render() {
    var columns = [ 
                     { property:'Name', header: 'VM', primary:true, render: this.renderVM  }, 
                     { property:'Project', header: 'Project', primary:true  }, 
                     { property:'Profile', header: 'Profile', primary:false }, 
                     { property:'Net', header: 'Net', primary:false }, 
                     { property:'State', header: 'State', primary:false }, 
                     { property:'Button', header: '', primary:false, render: this.renderTrashButton }, 
                  ];

    return (
      <Grommet plain>
        <AppBar>
          <Text><a className="headerLabel" href="/" >Neptun</a></Text>
          <Button label="Logout" primary={true} color="neutral-1" onClick={this.logout} />
        </AppBar>
        <Main>
         <Text><strong>New Orders</strong></Text>
         <DataTable primaryPropery="property" name="ordersTable" className="ordersTable" columns={columns} data={this.state.vms} />
         <Text><strong>Delete Orders</strong></Text>
         <DataTable primaryPropery="property" name="ordersTable" className="ordersTable" columns={columns} data={this.state.deletevms} />
        
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
          Profile
          <Box fill className="selectorGroupWrapper" >
          <Select options={this.state.profiles}
                  placeholder="Select Profile" 
                  value={this.state.profile}
                  size="small"
                  onChange={this.changeProfile} >
          </Select></Box>
          <Box fill className="selectorWrapper" >
          <Select options={this.state.datacenters}
                  placeholder="Select Datacenter"
                  value={this.state.datacenter}
                  size="small"
                  onChange={({option}) => this.setState({datacenter: option})} >
          </Select></Box>
          <Box fill className="selectorWrapper" >
          <Select options={this.state.datastores}
                  placeholder="Select Datastore"
                  value={this.state.datastore}
                  size="small"
                  onChange={({option}) => this.setState({datastore: option})} >
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
          Network
          <Box fill className="selectorGroupWrapper" >
          <Select options={this.state.nets}
                  placeholder="Select Network" 
                  value={this.state.network}
                  size="small"
                  onChange={this.changeNet} >
          </Select></Box>
          <Box fill className="selectorWrapper" >
          <Select options={this.state.vlans}
                  placeholder="Select Network"
                  value={this.state.vlan}
                  size="small"
                  onChange={({option}) => this.setState({vlan: option})} >
          </Select></Box>
          {!this.state.manualip && (
          <Box fill className="selectorWrapper" >
          <Select options={this.state.freeips}
                  placeholder="Select IP"
                  value={this.state.ip}
                  size="small"
                  onChange={({option}) => this.setState({ip: option})} >
          </Select></Box>
          )}
          {this.state.manualip && (
          <TextInput
                  suggestions={["IP"]}
                  placeholder="IP"
                  value={this.state.ip}
                  onChange={this.ipChange}
                  size="xsmall" >
          </TextInput>
          )}
          <CheckBox
            label="Manual"
            checked={this.state.manualip}
            onChange={this.manualipChange}
          />
          Resources
          <TextInput 
                  suggestions={["CPU"]}
                  placeholder="CPU" 
                  value={this.state.cpu}
                  onChange={this.cpuChange}
                  size="xsmall" >
          </TextInput>
          <TextInput 
                  suggestions={["RAM (GB)"]}
                  placeholder="RAM (GB)" 
                  value={this.state.ram}
                  onChange={this.ramChange}
                  size="xsmall" >

          </TextInput>
          {(this.state.editVM && (
          <Button className="addButton" label="Prepare" primary={true} color="neutral-1" onClick={this.newVMPrepare} disabled={this.state.prepareDisabled} />
          ))}
          </Dialog>
          </Layer>
        )}
        {(this.state.showPlan || this.state.showApply) && (
         <Layer
            position="center"
            modal
            onEsc={this.onClosePlan}
          >
          <PlanDialog>
          <div ref={(div) => { this.messageList = div; }} dangerouslySetInnerHTML={{ __html: this.state.plan}} />
          <Button className="addButton" label="Provide" primary={true} color="neutral-1" onClick={this.newVMProvide} disabled={this.state.showApply} />
          <Button className="addButton" label="Close" primary={true} color="neutral-4" onClick={this.onClosePlan} />
          </PlanDialog>
          </Layer>
        )}
        {this.state.deleteVM && (
         <Layer
            position="center"
            modal
            onClickOutside={this.onClose}
            onEsc={this.onClose}
          >
          <Main>
          <Text> Delete vm {this.state.deleteVMName}? </Text>
          <Button className="addButton" label="Delete" primary={true} color="neutral-1" onClick={this.deleteVM}  />
          </Main>
          </Layer>
        )}

        <AppMenu />
      </Grommet>
    );
  }
}

export default Orders;
