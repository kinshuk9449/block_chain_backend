/**
 * Created by Jason Pham 
 * thienhtpham@gmail.com
 */

import 'dotenv/config';
import { Gateway, Wallets } from 'fabric-network';
import path from 'path';
import fs from 'fs';
import FabricCAServices from 'fabric-ca-client';

const CA_ADDRESS = process.env.CA_ADDRESS;
const MSP_ID = process.env.MSP_ID;
const ADMIN_ID = process.env.CA_ADMIN_ID;
const ADMIN_PWD = process.env.CA_ADMIN_PWD

// the role of the user going to be registered to use this app
const CA_CHAINCODE_USER_ROLE = 'client';
// user affiliation that was registered on the CA
const USER_AFFILIATION = 'org1.department1';

const CHANNEL = 'mychannel';
const ERCCHAINCODE = 'ercToken';
const CERTCHAINCODE = 'cert';

const WALLET_PATH = path.join(__dirname, '..', 'wallet');

let wallet;
let ercContract;
let certContract;

const prettyJSONString = (inputString) => {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}

/**
* Please use fabricLogger for logging in this file try to abstain from console
* levels of logging:
* - TRACE - ‘blue’
* - DEBUG - ‘cyan’
* - INFO - ‘green’
* - WARN - ‘yellow’
* - ERROR - ‘red’
* - FATAL - ‘magenta’
*/

class FabricManager {

  /**
 * @author Jason Pham
 * 
 * @param {String} userId the hyperledger app userId that was registered with CA
 * @returns {Object} smart contract Object
 */
  connectHyperledgerGateWay = async (userId) => {
    try {

      if (wallet) {
        // load the network configuration
        // provide the path to where your connection-<orgName>.json file is
        const ccpPath = path.resolve(__dirname, '..', '..', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
          throw new Error(`no such file or directory: ${ccpPath}`);
        }
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        wallet = await Wallets.newFileSystemWallet(WALLET_PATH);
        fabricLogger.info(`Wallet path: ${WALLET_PATH}`);

        // Check to see if app user exist in wallet.
        const identity = await wallet.get(userId);

        if (!identity) {
          fabricLogger.error(`An identity for the user does not exist in the wallet: ${userId}`);
          throw new Error(`An identity for the user does not exist in the wallet: ${userId}`);
        }

        //3. Prepare to call chaincode using fabric javascript node sdk
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
          wallet,
          identity: identity,
          discovery: { enabled: true, asLocalhost: true }
        });


        try {
          // Get the network (channel) our contract is deployed to.
          const network = await gateway.getNetwork(CHANNEL);
          if (!network) throw new Error("Cannot get Fabric network")

          // Get the contract from the network.
          ercContract = network.getContract(ERCCHAINCODE);
          certContract = network.getContract(CERTCHAINCODE);

          // Initialize the chaincode by calling its InitLedger function
          // fabricLogger.info('Submit Transaction: InitLedger to create the very first cert');
          // await contract.submitTransaction('InitLedger');
        } catch (err) {
          fabricLogger.error(err);
          return err;
        }
      }

      if (wallet && ercContract && certContract) {
        fabricLogger.info('Chaincode is ready to be invoked');
      } else {
        throw new Error("Cannot connect with Fabric")
      }
    } catch (err) {
      fabricLogger.error(err);
      return err;
    }
  }

  /**
 * @author Jason Pham
 * 
 * @returns admin identity for registering hyperledger app user 
 */
  enrollFabricAdmin = async () => {
    try {
      // load the network configuration
      // provide the path to where your connection-<orgName>.json file is
      const ccpPath = path.resolve(__dirname, '..', '..', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
      const fileExists = fs.existsSync(ccpPath);
      if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
      }
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new CA client for interacting with the CA.
      const caInfo = ccp.certificateAuthorities[CA_ADDRESS];
      const caTLSCACerts = caInfo.tlsCACerts.pem;
      const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

      // Create a new  wallet : Note that wallet can be resfor managing identities.
      wallet = await Wallets.newFileSystemWallet(WALLET_PATH);

      // Check to see if we've already enrolled the admin user.
      const identity = await wallet.get(ADMIN_ID);
      if (identity) {
        fabricLogger.info('An identity for the admin user already exists in the wallet');
        return;
      }

      // Enroll the admin user, and import the new identity into the wallet.
      const enrollment = await ca.enroll({ enrollmentID: ADMIN_ID, enrollmentSecret: ADMIN_PWD });
      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: MSP_ID,
        type: 'X.509',
      };
      await wallet.put(ADMIN_ID, x509Identity);
      fabricLogger.info('Successfully enrolled admin user and imported it into the wallet');

    } catch (error) {
      console.error(`Failed to enroll admin user : ${error}`);
      process.exit(1);
    }
  };

  /**
   * @author Jason Pham
   * 
   * @param {String} userId the hyperledger app userId to be registered with CA
   * @returns hyperledger app user identity
   */
  registerFabricUser = async (userId) => {
    try {
      // load the network configuration
      // provide the path to where your connection-<orgName>.json file is
      const ccpPath = path.resolve(__dirname, '..', '..', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
      const fileExists = fs.existsSync(ccpPath);
      if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
      }
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new CA client for interacting with the CA.
      const caURL = ccp.certificateAuthorities[CA_ADDRESS].url;
      const ca = new FabricCAServices(caURL);

      if (!wallet) {
        wallet = await Wallets.newFileSystemWallet(WALLET_PATH);
      }

      // Check to see if we've already enrolled the admin user.
      const adminIdentity = await wallet.get(ADMIN_ID);
      if (!adminIdentity) {
        fabricLogger.error('An identity for the admin user does not exist in the wallet');
        fabricLogger.info('Try enroll admin before retrying');
        return;
      }

      // Check to see if we've already enrolled the user.
      const userIdentity = await wallet.get(userId);
      if (userIdentity) {
        fabricLogger.info(`An identity for the user ${userId} already exists in the wallet`);
        return;
      }

      // build a user object for authenticating with the CA
      const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, ADMIN_ID);

      // Register the user, enroll the user, and import the new identity into the wallet.
      // if affiliation is specified by client, the affiliation value must be configured in CA
      const secret = await ca.register({
        affiliation: USER_AFFILIATION,
        enrollmentID: userId,
        role: CA_CHAINCODE_USER_ROLE
      }, adminUser);

      const enrollment = await ca.enroll({
        enrollmentID: userId,
        enrollmentSecret: secret
      });
      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: MSP_ID,
        type: 'X.509',
      };
      await wallet.put(userId, x509Identity);
      fabricLogger.info(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);

    } catch (error) {
      console.error(`Failed to register user : ${error}`);
      process.exit(1);
    }
  }

  // Example chaincode invocation
  getClientId = async () => {
    try {
      let result = await ercContract.evaluateTransaction('ClientAccountID');
      return result.toString('utf8');
      // return result;
    } catch (err) {
      fabricLogger.info(`Error when get identity: ${err}`);
      return err;
    }
  }

  // Example chaincode invocation
  getAllCerts = async () => {
    try {
      let result = await certContract.evaluateTransaction('GetAllCerts');
      // return result.toString('utf8');
      return result;
    } catch (err) {
      fabricLogger.info(`Error when get all certificates: ${err}`);
      return err;
    }
  }
}

const instance = new FabricManager();
export default instance;