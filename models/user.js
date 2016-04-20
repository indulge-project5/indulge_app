'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    phone: DataTypes.BIGINT,
    partner_phone: DataTypes.BIGINT,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    partner_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        this.hasMany(models.Note);
      },
      createSecure: function(email, password) {
        if(password.length < 1) {
          throw new Error("Password too short");
        }
        return this.create({
          email: email,
          password: password,
          first_name: first_name,
          last_name: last_name,
          phone: phone,
          partner_phone: partner_phone
        });
      },
      authenticate: function(email, password) {
        // find a user in the DB
        return this.find({
          where: {
            email: email
          }
        }) 
        .then(function(user){
          if (user === null){
            throw new Error("Username does not exist");
          }
          else if (user.password === user.password){
            return user;
          }

        });
      }
    }
  });
  return User;
};