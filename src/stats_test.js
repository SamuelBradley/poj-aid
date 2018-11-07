const twitchApi = require('./twitchApi');
const tmi = require('tmi.js')
const log4js = require('log4js');
const db = require('diskdb');

let opts = {
  options:{
    clientId: "jj8pabc82tb8imhiotli7eovtht8ne"
  },
  connection: {
    reconnect: true
  },
  identity: {
    username: "PojAid",
    password: "oauth:pqkqr2jlg22quhus676nfv4mtl2m7u"
  },
  channels: ["moredhel88"]  
}
twitchClient = new tmi.client(opts);

log4js.configure({
  appenders: { 
    out: { type: 'stdout' } 
  },
  categories: { 
    default: { appenders: ['out'], level: 'debug' } 
  }
});
let logger = log4js.getLogger('test')

twitchApi.initialise(logger, db.connect("../data", ['clips']))

twitchApi.getClips(twitchClient, "jj8pabc82tb8imhiotli7eovtht8ne", "POJ__", function(clip){
  console.log(clip)
});

twitchApi.searchClips(twitchClient, "jj8pabc82tb8imhiotli7eovtht8ne", "POJ__", function(clip){
  console.log(clip.slug)
});

console.log("End of file");