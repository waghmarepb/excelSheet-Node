var config = {
  port: 9943,
  webAppUrl: "http://localhost:4200/#/",
  //Database Credentials
  mongo: {
    db: "sscExam",
    password: '22SWDfs0c7QPoEWy' // create your own mongo db config
  },
  secretKey: "*&^sdfjhd345dfg*&%^3",

  email: {
    // use yours config
    service: "", // use yours config
    accessID: "",
    accessKey: "",
    fromUser: "",
    subject: "",
  },
  loginTokenExpiryDays: 1,
};

//Production
// config.mongo.url = `mongodb+srv://RestAppShop:${config.mongo.password}@sscexam.dkapt.mongodb.net/${config.mongo.db}?retryWrites=true&w=majority`;
config.mongo.url = `mongodb+srv://tigerkiller007:${config.mongo.password}@cluster0.dgevg.mongodb.net/`;
module.exports = config;