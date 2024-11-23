// enrollAdmin.js

'use strict';

import { Gateway, Wallets } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {WALLET_PATH} from "../config.js";

// Convert import.meta.url to a path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        // Load the network configuration (connection profile)
        const ccpPath = path.resolve(__dirname, '../configs/local_connection.json'); // Adjust this path to your connection profile
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com']; // Adjust this CA name if needed
        const caURL = caInfo.url;
        const ca = new FabricCAServices(caURL, { verify: false });

        // Create a new file system-based wallet for managing identities.
        const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.get('admin');
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP', // Adjust the MSP ID if needed
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main();