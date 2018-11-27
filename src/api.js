var axios = require('axios');
var config = require('./appconfig');

var api = {

  getFreeIPs: async (ip,callback) => {
    axios.get(config.default.api+'/freeip/'+ip).then((res) => {
        callback(res.data);
    });
    
  },
  getVSphere: async (type,callback) => {
    axios.get(config.default.api+'/vsphere/'+type).then((res) => {
        callback(res.data);
    });
    
  },
  prepareVM: async (data,jwt,callback) => {
        if(!jwt) {
          callback(false);
        } else
        {
               console.log("API PREPARE");
               axios.post(config.default.api+'/terraform/prepare', data,
                  {
                           headers: {
                               Authorization: "Bearer "+jwt
                           },
                 })
                 .then(res => {
                    console.log(res.status);
                    if (res.status === 200)
                      callback(res.data); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }    
  },
  provideVM: async (data,jwt,callback) => {
        if(!jwt) {
          callback(false);
        } else
        {
               console.log("API PROVIDE");
               axios.post(config.default.api+'/terraform/provide', data,
                  {
                           headers: {
                               Authorization: "Bearer "+jwt
                           },
                 })
                 .then(res => {
                    console.log(res.status);
                    if (res.status === 200)
                      callback(res.data); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }    
  },
  showLog: async (data,jwt,callback) => {
        if(!jwt) {
          callback(false);
        } else
        {
               console.log("API PROVIDE");
               axios.post(config.default.api+'/terraform/log', data,
                  {
                           headers: {
                               Authorization: "Bearer "+jwt
                           },
                 })
                 .then(res => {
                    console.log(res.status);
                    if (res.status === 200)
                      callback(res.data); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }    
  },

  get: async (t,jwt,callback) => {        
        if(!jwt) {
          callback(false);
        } else
        {
               console.log("API GET");      
               axios.get(config.default.api+'/'+t,{
                           headers: {
                               Authorization: "Bearer "+jwt
                           }
                 })
                 .then(res => {
                    console.log(res.status);
                    if (res.status === 200)
                      callback(res.data); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }
  },
  getFilter: async (t,jwt,filter,callback) => {        
        if(!jwt) {
          callback(false);
        } else
        {
               console.log("API GET");      
               axios.get(config.default.api+'/'+t+'?'+filter,{
                           headers: {
                               Authorization: "Bearer "+jwt
                           }
                 })
                 .then(res => {
                    console.log(res.status);
                    if (res.status === 200)
                      callback(res.data); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }
  },
  create: async (t,data,jwt,callback) => {        
        if(!jwt) {
          callback(false);
        } else
        {
               console.log("API CREATE");      
               axios.post(config.default.api+'/'+t, data,
                  {
                           headers: {
                               Authorization: "Bearer "+jwt
                           },
                 })
                 .then(res => {
                    console.log(res.status);
                    if (res.status === 200)
                      callback(res.data); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }
  },
  update: async (t,id,data,jwt,callback) => {        
        if(!jwt) {
          callback(false);
        } else
        {
               console.log("API UPDATE");      
               axios.put(config.default.api+'/'+t+'/'+id, data,
                  {
                           headers: {
                               Authorization: "Bearer "+jwt
                           },
                 })
                 .then(res => {
                    console.log(res.status);
                    if (res.status === 200)
                      callback(res.data); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }
  },
  delete: async (t,id,jwt,callback) => {        
        if(!jwt) {
          callback(false);
        } else
        {
               console.log("API DELETE "+id);      
               axios.delete(config.default.api+'/'+t+'/'+id, 
                  {
                           headers: {
                               Authorization: "Bearer "+jwt
                           },
                 })
                 .then(res => {
                    console.log(res.status);
                    if (res.status === 200)
                      callback(res.data); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }
  }

};

export default api;
