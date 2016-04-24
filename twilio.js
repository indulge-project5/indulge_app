var twilio = require('twilio');

var send_sms_to = function (user) {
  var client = new twilio.RestClient('secret-code', 'super-secret-probation'),
  msg = "Hello potential new user!",
  phone = user.partner_phone,
  name = user.first_name + " " + user.last_name;
  console.log("Entries are: ", user.phone, user.first_name)
  client.sms.messages.create({
    to: phone,
    from:'Twilio phone number goes here',
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