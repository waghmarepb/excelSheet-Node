var config = {
  port: 9943,
  webAppUrl: "http://localhost:4200/#/",
  //Database Credentials
  mongo: {
    db: "sscExam",
    password: '' // create your own mongo db config
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
config.mongo.url = `mongodb+srv://RestAppShop:${config.mongo.password}@sscexam.dkapt.mongodb.net/${config.mongo.db}?retryWrites=true&w=majority`;
module.exports = config;