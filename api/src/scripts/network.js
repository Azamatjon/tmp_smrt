import { Gateway, Wallets } from 'fabric-network';
import path from 'path';
import fs from 'fs';
import { create } from 'ipfs-http-client';
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });
import { fileURLToPath } from 'url';
import {WALLET_PATH} from "../config.js";

const namespace = 'org.nykredit.co';
let businessNetworkName = 'nykredit-network';

// Convert import.meta.url to a path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load connection profile
const ccpPath = path.resolve(__dirname, '../configs/local_connection.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

const walletPath = path.resolve(WALLET_PATH);
export default {

  createUser: async function (cardId, id) {
    try {
      // Create a new file system-based wallet for managing identities
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check if the user already exists
      const userExists = await wallet.get(id);
      if (userExists) {
        console.log(`An identity for the user ${id} already exists in the wallet`);
        return;
      }

      // Check if admin identity exists in wallet
      const adminExists = await wallet.get('admin');
      if (!adminExists) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        return;
      }

      // Create a new gateway for connecting to the network
      const gateway = new Gateway();
      await gateway.connect(ccp, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true },
        tlsInfo: {
          verify: false,
        },
      });

      // Get the network (channel) the contract is deployed to
      const network = await gateway.getNetwork('mychannel');

      // Get the contract from the network
      const contract = network.getContract('nykredit-network');

      // Submit transaction to add a user
      await contract.submitTransaction('createUser', userId, orgMsp);

      // Disconnect from the gateway
      await gateway.disconnect();

      console.log(`User ${userId} successfully created`);
      return true;
    } catch (err) {
      console.log(err);
      const error = { error: err.message };
      return error;
    }
  },

  checkUser: async function (cardId, id) {
    try {
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: cardId, discovery: { enabled: true, asLocalhost: true } });

      const network = await gateway.getNetwork('mychannel');
      const contract = network.getContract(businessNetworkName);

      const user = await contract.evaluateTransaction('checkUser', id);

      await gateway.disconnect();
      return JSON.parse(user.toString());
    } catch (err) {
      console.log(err);
      const error = { error: err.message };
      return error;
    }
  },

  createReport: async function (cardId, id, reportId, text) {
    try {
      const content = ipfs.types.Buffer.from(JSON.stringify({ text }));
      const ipfsHash = await ipfs.files.add(content);

      const wallet = await Wallets.newFileSystemWallet(walletPath);
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: cardId, discovery: { enabled: true, asLocalhost: true } });

      const network = await gateway.getNetwork('mychannel');
      const contract = network.getContract(businessNetworkName);

      const report = { id, reportId, ipfsHash: ipfsHash[0].hash };
      await contract.submitTransaction('createReport', JSON.stringify(report));

      await gateway.disconnect();
      return report;
    } catch (err) {
      console.log(err);
      const error = { error: err.message };
      return error;
    }
  },

  updateReport: async function (cardId, reportId, text) {
    try {
      const content = ipfs.types.Buffer.from(JSON.stringify({ text }));
      const ipfsHash = await ipfs.files.add(content);

      const wallet = await Wallets.newFileSystemWallet(walletPath);
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: cardId, discovery: { enabled: true, asLocalhost: true } });

      const network = await gateway.getNetwork('mychannel');
      const contract = network.getContract(businessNetworkName);

      const reportUpdate = { reportId, newIpfsHash: ipfsHash[0].hash };
      await contract.submitTransaction('updateReport', JSON.stringify(reportUpdate));

      await gateway.disconnect();
      return reportUpdate;
    } catch (err) {
      console.log(err);
      const error = { error: err.message };
      return error;
    }
  },

  getReport: async function (cardId, reportId) {
    try {
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: cardId, discovery: { enabled: true, asLocalhost: true } });

      const network = await gateway.getNetwork('mychannel');
      const contract = network.getContract(businessNetworkName);

      const reportResult = await contract.evaluateTransaction('getReport', reportId);
      const rawReport = await ipfs.files.cat(JSON.parse(reportResult.toString()).ipfsHash);
      const report = JSON.parse(rawReport);

      await gateway.disconnect();
      return report;
    } catch (err) {
      console.log(err);
      const error = { error: err.message };
      return error;
    }
  }
};
