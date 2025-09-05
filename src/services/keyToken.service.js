'use strict';

const keyTokenModel = require("../models/keytoken.model");

class KeyTokenService {
    static createKeyToken = async ({ userId , publicKey }) => {
        try {
            const publicKeyString = publicKey.toString();
            const token = await keyTokenModel.create({
                userId, publicKey: publicKeyString
            })

            return token ? token.publicKey : null;
        } catch (error) {
              console.error("Error in createKeyToken:", error.message);
        }
       
    }
}


module.exports =  KeyTokenService;