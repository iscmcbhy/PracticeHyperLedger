# Invoice Hyperledger App Created using Fabric-Samples



##Development Environment:

###Install Go: go version go1.11.2 linux/amd64

###OS: deepin15.9.1 (Applicable to Ubuntu)

###GOPATH must be correctly set in your local machine

Note: You can check if go is properly installed by running go version in your terminal 
Check also if gopath is correct. Run echo $GOPATH

###Setting up Network

##Step 1:

Clone the fabric-samples first: https://github.com/hyperledger/fabric-samples. These files contain the network you will use. 

##Step 2:

Copy "invoice" folder and paste it inside fabric-samples and then copy "invoice" folder inside "Chaincode" folder.

##Step 3:

Always check if there is existing docker and network running already in your machine. Run ./teardown.sh under: /fabric-samples/basic-network
Note: This file will teardown and remove existing network in your machine.

##Step 4:

Run ./start.sh inside "invoice" folder inside "fabric-sample" folder. Then run "npm install".

##Step 5: 

Run: node enrollAdmin.js - this will output certificates for your network
     node registerUser.js - this will register user for authorization of each transactions.

Then: node app.js - for testing the application

##Step 6:

Test the endpoints using POSTMAN or INSOMNIA REST Client

###Testing Endpoints

###Display All Invoices

http://localhost:3000/


Use the GET http request in this function as we are getting data

###Raise Invoice

http://localhost:3000/invoice

Use the POST http request in this function as we are pushing data

Select Form URL Encoded as a structure

Parameters
invoiceid
invoicenum
billedto
invoicedate
invoiceamount
itemdescription
gr
ispaid
paidamount
repaid
repaymentamount
NOTE: gr , ispaid , paidamount , repaid , repaymentamount default values are as follows N , N , 0 , N , 0
gr = N 
ispaid = N 
paidamount = 0 
repaid = N 
repaymentamount = 0 



###Goods Received

http://localhost:3000/invoice

Use the PUT http request in this function as we are modifying a data

Select Form URL Encoded as a structure

Parameters
invoiceid
gr



###Bank Payment to Supplier

http://localhost:3000/invoice

Use the PUT http request in this function as we are modifying a data

Select Form URL Encoded as a structure

Parameters
invoiceid
ispaid



###OEM Repays to Bank

http://localhost:3000/invoice

Use the PUT http request in this function as we are modifying a data

Select Form URL Encoded as a structure

Parameters
invoiceid
repaid

