var axios = require('axios');
var config = require('./appconfig');

var auth = {

  checkLogin: async (jwt,callback) => {        
        if(!jwt) {
          callback(false);
        } else
        {
               axios.get(config.default.api+'/projects',{
                           headers: {
                               Authorization: "Bearer "+jwt
                           }
                 })
                 .then(res => {
                    if (res.status === 200)
                      callback(jwt); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }
  },
  checkAdmin: async (jwt,callback) => {        
        if(!jwt) {
          callback(false);
        } else
        {
               axios.get(config.default.api+'/adminrecords',{
                           headers: {
                               Authorization: "Bearer "+jwt
                           }
                 })
                 .then(res => {
                    if (res.status === 200)
                      callback(true); else
                      callback(false);
                 })
                 .catch(function (error) {
                      console.log(error);
                      callback(false);
                 });
        }
  },
  login: async (login,pass,redirect_uri,callback) => {
    var jwt = false;
    var p = new Promise((resolve) => {
       axios.post(config.default.api+'/ldap', 
       {         
          user:login,
          pass:pass         
       })
      .then(response => {
        if (response.status === 200) {
            if ( response.data.success === true ) {
               console.log("success login");
               axios.get(redirect_uri+'?code='+response.data.code, {withCredentials: true})
                 .then(coderes => {
                    jwt = coderes.data.jwt;
                    resolve(jwt);
               })
            } else
            {
               console.log("error login:"+response.message);
               resolve(false);      
            }
        } else {
          var error = new Error(response.statusText)
          console.log(error)
          error.response = response
          resolve(false);
          throw error
        }
      })
    });
    p.then((res) => {
       callback(res);
    });
  }

};

export default auth;
