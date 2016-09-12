var Bitcore = require('bitcore-lib-dash');
var Transaction = Bitcore.Transaction;
// Bitcore.Networks.defaultNetwork = Bitcore.Networks.testnet;

var Mnemonic = require('bitcore-mnemonic-dash');
var WalletService = require('bitcore-wallet-service').Server;
var Storage = require('bitcore-wallet-service').Storage;
var MessageBroker = require('bitcore-wallet-service').MessageBroker;
var BlockchainExplorer = require('bitcore-wallet-service').BlockchainExplorer;
var FiatRateService = require('bitcore-wallet-service').FiatRateService;
var Common = require('bitcore-wallet-service').Common;
var Utils = Common.Utils;

var TestData = require('./testdata');
var BufferUtil = Bitcore.util.buffer;
var helpers = require('./helpers');

var Block = Bitcore.Block;
var BlockHeader = Bitcore.BlockHeader;

var fs = require('fs');

var HDPrivateKey = new Bitcore.HDPrivateKey(TestData.copayers[1].xPrivKey);
//var HDPrivateKey = new Bitcore.HDPrivateKey();
//var object = HDPrivateKey.toObject();

var derived = HDPrivateKey.derive("m/0/0/1");
console.log(derived.privateKey.toAddress());

var derived = HDPrivateKey.derive("m/1/1/0");
console.log(derived.privateKey.toAddress());

var derived = HDPrivateKey.derive("m/1/0/0");
console.log(derived.privateKey.toAddress());


var opts = {};
opts.storage = null;
opts.messagebroker = MessageBroker;

WalletService.initialize(opts, function() {
    console.log("--Wallet Service Starting--");

    helpers.createAndJoinWallet(1, 1, {
        supportBIP44AndP2PKH: false
    }, function(s, w) {
        server = s;
        wallet = w;

        console.log("success...");


        server.createAddress({}, function(err, result) {
            console.log(result);
        });

        server.createAddress({}, function(err, result) {
            console.log(result);
        });

        server.createAddress({}, function(err, result) {
            console.log(result);
        });

        server.createAddress({}, function(err, result) {
            console.log(result);
        });


        var address = wallet.createAddress(true);
        console.log(address);




    });

});




