var twilio = require('twilio');
// var tc = require('./twilio_codes');
// var tw = tc.twilio_c;

var send_sms_to = function (user) {
  // New Twilio code:
var client = require('twilio')(process.env.twilio_sid, process.env.twilio_auth_token);
// Old Twilio code:
  // var client = new twilio.RestClient(tw[0], tw[1]),
  msg = "Hello potential new user! Please visit http://afternoon-sierra-48284.herokuapp.com/confirm/" + user.phone + "/" + user.partner_phone + "/" + user.first_name + "/" + user.last_name;
  phone = user.partner_phone,
  name = user.first_name + " " + user.last_name;
  console.log("Entries are: ", user.phone, user.first_name)
  client.sms.messages.create({
    to: phone,
    from: process.env.twilio_phone,
    body: msg
}, function(error, message) {
    // The HTTP request to Twilio will run asynchronously. This callback
    // function will be called when a response is received from Twilio
    // The "error" variable will contain error information, if any.
    // If the request was successful, this value will be "falsy"
    if (!error) {
        // The second argument to the callback will contain the information
        // sent back by Twilio for the request. In this case, it is the
        // information about the text messsage you just sent:
        console.log('Success! The SID for this SMS message is:');
        console.log(message.sid);
 
        console.log('Message sent on:');
        console.log(message.dateCreated);
    } else {
        console.log('Oops! There was an error.');
    }
  });
}

module.exports.send_sms_to = send_sms_to;