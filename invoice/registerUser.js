'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Register and Enroll a user
 */

var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');

var path = require('path');
var util = require('util');
var os = require('os');

//
var fabric_client = new Fabric_Client();
var fabric_ca_client = null;
var admin_user = null;

var member_user_ibm = null;
var member_user_lotus = null;
var member_user_ubp = null;

var secret_user_ibm = null;
var secret_user_lotus = null;
var secret_user_ubp = null;

var store_path = path.join(__dirname, 'hfc-key-store');
console.log(' Store path:'+store_path);

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
    // assign the store to the fabric client
    fabric_client.setStateStore(state_store);
    var crypto_suite = Fabric_Client.newCryptoSuite();
    // use the same location for the state store (where the users' certificate are kept)
    // and the crypto store (where the users' keys are kept)
    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
    var	tlsOptions = {
    	trustedRoots: [],
    	verify: false
    };
    // be sure to change the http to https when the CA is running TLS enabled
    fabric_ca_client = new Fabric_CA_Client('http://localhost:7054', null , '', crypto_suite);

    // first check to see if the admin is already enrolled
    return fabric_client.getUserContext('admin', true);
}).then((user_from_store) => {
    if (user_from_store && user_from_store.isEnrolled()) {
        console.log('Successfully loaded admin from persistence');
        admin_user = user_from_store;
    } else {
        throw new Error('Failed to get admin.... run enrollAdmin.js');
    }

    // at this point we should have the admin user
    // first need to register the user with the CA server
    //var attributes = {username:"Amol:ecert",org:"ICICI:ecert"};
    let attributes = [
        //Supplier
        {name:"username", value:"IBM",ecert:true }, 
        //OEM
        {name:"username", value:"Lotus",ecert:true }, 
        //Bank
        {name:"username", value:"UBP",ecert:true }];

    return fabric_ca_client
    .register({enrollmentID: 'IBM', affiliation: 'org1.department1',role: 'supplier', attrs: attributes}, admin_user)
    .then((ibm_secret)=> {
        secret_user_ibm = ibm_secret
        return fabric_ca_client
            .register({enrollmentID: 'Lotus', affiliation: 'org1.department1',role: 'oem', attrs: attributes}, admin_user)
            .then((lotus_secret)=> {
                secret_user_lotus = lotus_secret
                return fabric_ca_client
                    .register({enrollmentID: 'UBP', affiliation: 'org1.department1',role: 'bank', attrs: attributes}, admin_user)
            })
    })

}).then((ibm_secret) => {
    secret_user_ubp = ibm_secret;
    // next we need to enroll the user with CA server
    console.log('Successfully registered IBM - secret:'+ secret_user_ibm);
    console.log('Successfully registered Lotus - secret:'+ secret_user_lotus);
    console.log('Successfully registered UBP - secret:'+ secret_user_ubp);

    return fabric_ca_client
        .enroll({enrollmentID: 'IBM', enrollmentSecret: secret_user_ibm})
        .then(()=>{
            return fabric_ca_client
                .enroll({enrollmentID:"Lotus", enrollmentSecret: secret_user_lotus})
                .then(()=>{
                    return fabric_ca_client
                    .enroll({enrollmentID:"UBP", enrollmentSecret:secret_user_ubp})
                })
        })
}).then((enrollment) => {
  console.log('Successfully enrolled member users "IBM", "Lotus", "UBP"! ');
  return fabric_client
    .createUser(
     {username: 'IBM', mspid: 'Org1MSP', cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
     }).then(()=>{
         return fabric_client
            .createUser(
                {username: 'Lotus', mspid: 'Org1MSP', cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
            }).then(()=>{
                return fabric_client
                    .createUser(
                        {username: 'UBP', mspid: 'Org1MSP', cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
                    })
                })
            })
}).then((user) => {
     member_user_ibm = user;
     member_user_lotus = user;
     member_user_ubp = user;

     return fabric_client
        .setUserContext(member_user_ibm)
        .then(()=> {
            return fabric_client
                .setUserContext(member_user_lotus)
                .then(()=>{
                    return fabric_client
                        .setUserContext(member_user_ubp)
                })
        })
}).then(()=>{
     console.log('Users were successfully registered and enrolled and is ready to interact with the fabric network');

}).catch((err) => {
    console.error('Failed to register: ' + err);
	if(err.toString().indexOf('Authorization') > -1) {
		console.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
		'Try again after deleting the contents of the store directory '+store_path);
	}
});
