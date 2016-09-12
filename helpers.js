'use strict';

var _ = require('lodash');
var async = require('async');

var Bitcore = require('bitcore-lib-dash');

var WalletService = require('bitcore-wallet-service').Server;
var Common = require('./node_modules/bitcore-wallet-service/lib/common');
var Utils = Common.Utils;
var TestData = require('./testdata');

var helpers = {};

helpers.CLIENT_VERSION = 'bwc-2.0.0';

helpers.createAndJoinWallet = function(m, n, opts, cb) {
    if (_.isFunction(opts)) {
        cb = opts;
        opts = {};
    }
    opts = opts || {};

    var server = new WalletService();
    var copayerIds = [];
    var offset = opts.offset || 0;

    var walletOpts = {
        name: 'a wallet',
        m: m,
        n: n,
        pubKey: TestData.keyPair.pub,
        singleAddress: !!opts.singleAddress,
    };
    if (_.isBoolean(opts.supportBIP44AndP2PKH))
        walletOpts.supportBIP44AndP2PKH = opts.supportBIP44AndP2PKH;

    server.createWallet(walletOpts, function(err, walletId) {
        if (err) return cb(err);

        async.each(_.range(n), function(i, cb) {
            var copayerData = TestData.copayers[i + offset];
            var copayerOpts = helpers.getSignedCopayerOpts({
                walletId: walletId,
                name: 'copayer ' + (i + 1),
                xPubKey: (_.isBoolean(opts.supportBIP44AndP2PKH) && !opts.supportBIP44AndP2PKH) ? copayerData.xPubKey_45H : copayerData.xPubKey_44H_0H_0H,
                requestPubKey: copayerData.pubKey_1H_0,
                customData: 'custom data ' + (i + 1),
            });
            if (_.isBoolean(opts.supportBIP44AndP2PKH))
                copayerOpts.supportBIP44AndP2PKH = opts.supportBIP44AndP2PKH;

            server.joinWallet(copayerOpts, function(err, result) {
                if (err) console.log("err: " + err);
                copayerIds.push(result.copayerId);
                return cb(err);
            });
        }, function(err) {
            if (err) return new Error('Could not generate wallet');
            helpers.getAuthServer(copayerIds[0], function(s) {
                s.getWallet({}, function(err, w) {
                    cb(s, w);
                });
            });
        });
    });
};

helpers.getSignedCopayerOpts = function(opts) {
    var hash = WalletService._getCopayerHash(opts.name, opts.xPubKey, opts.requestPubKey);
    opts.copayerSignature = helpers.signMessage(hash, TestData.keyPair.priv);
    return opts;
};

helpers.signMessage = function(text, privKey) {
    var priv = new Bitcore.PrivateKey(privKey, 'testnet');
    var hash = Utils.hashMessage(text);
    return Bitcore.crypto.ECDSA.sign(hash, priv, 'little').toString();
};

helpers.getAuthServer = function(copayerId, cb) {

    // reinitialize server with auth
    var sig = this.signMessage('ehlo', TestData.copayers[0].privKey_1H_0);

    WalletService.getInstanceWithAuth({
        copayerId: copayerId,
        message: 'ehlo',
        signature: sig,
        clientVersion: helpers.CLIENT_VERSION,
    }, function(err, server) {
        if (err || !server) throw new Error('Could not login as copayerId ' + copayerId + ' err: ' + err);
        return cb(server);
    });
};

module.exports = helpers;
