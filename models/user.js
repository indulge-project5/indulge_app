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
      }
    }
  });
  return User;
};