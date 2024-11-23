// createChannel.js

'use strict';

import FabricClient from 'fabric-client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WALLET_PATH } from "../config.js";

// Convert import.meta.url to a path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        // Load the network configuration (connection profile)
        const ccpPath = path.resolve(__dirname, '../configs/local_connection.json'); // Adjust this path to your connection profile
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new Fabric client
        const client = FabricClient.loadFromConfig(ccp);

        // Define variables
        const channelName = 'mychannel';
        const channelTxPath = '/etc/hyperledger/config/channel.tx';

        // Set up client key-value store
        const wallet = await FabricClient.newDefaultKeyValueStore({ path: WALLET_PATH });
        client.setStateStore(wallet);

        // Get admin identity from wallet
        const user = await client.getUserContext('admin', true);
        if (!user || !user.isEnrolled()) {
            throw new Error('Admin user is not enrolled');
        }

        // Create the channel using the configuration file (channel.tx)
        const envelope = fs.readFileSync(channelTxPath);
        const channelConfig = client.extractChannelConfig(envelope);
        const signature = client.signChannelConfig(channelConfig);

        const request = {
            config: channelConfig,
            signatures: [signature],
            name: channelName,
            orderer: client.getOrderer(ccp.orderers['orderer.example.com'].url),
            txId: client.newTransactionID(),
        };

        const response = await client.createChannel(request);
        if (response && response.status === 'SUCCESS') {
            console.log(`Channel '${channelName}' created successfully`);
        } else {
            console.error('Failed to create the channel:', response);
        }
    } catch (error) {
        console.error(`Error creating channel: ${error}`);
        process.exit(1);
    }
}

main();
