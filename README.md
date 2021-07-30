# Node.js User Onboarding with Hyperledger Fabric MSP
A Node based module using Mongodb to onboard user's into a very basic application, secured using JWT authorization.

The Node.js app uses [Hapi Framework](https://hapijs.com) and [Hapi Swagger](https://github.com/glennjones/hapi-swagger)

Hyperledger Fabric MSP service is integrated with this application to boost up configuration process when starting with a blockchain-based project. More information about Hyperledger Fabric and MSP can be found [here](https://hyperledger-fabric.readthedocs.io/en/latest/).

PS : This is an ES6 translation of this [project](https://github.com/ChoudharyNavit22/User-Onboarding-Module)

# Contents

* [Manual Deployment](#manual-deployment)
* [Hyperledger Fabric Setup](#fabric-setup)
* [Upload Image/Document Guidelines](UPLOAD_IMAGE_GUIDLINE.md)

# Project Dependencies

* MongoDB ([Install MongoDB](https://docs.mongodb.com/manual/administration/install-community/))

# <a id="manual-deployment"></a>Manual Deployment

## Setup Node.js

Inorder to setup NodeJS you need to fellow the current steps:

### Mac OS X

* Step1: Install Home brew

```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

$ brew -v
```

* Step2: Install Node using Brew

```
$ brew install node

$ node -v

$ npm -v
```

### Linux Systems

* Step1: Install Node using apt-get

```
$ sudo apt-get install curl python-software-properties

$ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

$ sudo apt-get install nodejs

$ node -v

$ npm -v
```
## Setup Node User Onboarding Application

* Step1: Git clone the application

* Step2: Install node modules

```
$ npm i

or 

$ npm install
```

```
$ npm i -g @babel/core @babel/node @babel/cli
```

* Step3: Copy .env.example to .env

```
$ cp .env.example .env
```

# <a id="fabric-setup"></a>Hyperledger Fabric Setup

## Provide organization cryptographic configurations

Copy the organization cryptographic configuration from your Fabric network to the folder `/organization`

The organization folder should have something like this:
```
+-- _organizations
|   +-- _peerOrganizations
|       +-- _ogr1.example.com
|           +-- ca
|           +-- msp
|           +-- peers
|           +-- tlsca
|           +-- users
|           +-- connection-org1.json

```
The `connection-org1.json` file configure the connection to the running Fabric network. Find out how to configure the `connection.json` file [here](CONFIG_FABRIC_CONNECTION.md).

## Setup Fabric constants

Navigate to the `.env` file and modify the constants' values according to your Fabric network configuration
```
CA_ADMIN_ID = " <Your admin ID configured with your CA> " // Ex: admin
CA_ADMIN_PWD = " <Password of the admin> " // Ex: adminpw
CA_ADDRESS = " <The address/url of the CA you are registering to> " // Ex: ca.org1.example.com
MSP_ID = " <MSPID of the organization you are communicate with> " // Ex: Org1MSP
```

## Setup Fabric-SDK parameters

* Navigate to the file `src/lib/fabricManager`, change the following constant variables:
```
const CA_CHAINCODE_USER_ROLE = 'client'; // the role of the user going to be registered to use this app

const USER_AFFILIATION = 'org1.department1'; // user affiliation that was registered on the CA

const CHANNEL = 'mychannel'; // the channel name
const CHAINCODE = 'cert'; // the chaincode name should be invoked
```

* Change the WALLET_PATH if you want to put the wallet somewhere different.

# Start the application

## Development start

* Normal start with Node 
```
$ npm start
```
* Start With Nodemon for hot reload
```
$ npm run startWithNodemon
```

## Deployment Start

* Build
```
$ npm run build
```
* Start the build
```
$ npm run deployment
```

The current version of your application would be running on **http://localhost:8000** or **http://IP_OF_SERVER:8000** (in case you are running on the server)
