'use strict';
module.exports = (sequelize, DataTypes) => {
  const PlaidTransaction = sequelize.define('PlaidTransaction', {
    userId: DataTypes.STRING,
    transactionId: DataTypes.STRING,
    accountId: DataTypes.STRING,
    amount: DataTypes.NUMBER,
    isoCurrencyCode: DataTypes.STRING,
    unofficialCurrencyCode: DataTypes.STRING,
    category: DataTypes.STRING,
    categoryId: DataTypes.STRING,
    date: DataTypes.DATE,
    authorizedDate: DataTypes.DATE,
    locationId: DataTypes.STRING,
    name: DataTypes.STRING,
    merchantName: DataTypes.STRING,
    paymentMetaId: DataTypes.STRING,
    paymentChannel: DataTypes.STRING,
    pending: DataTypes.BOOLEAN,
    pendingTransactionId: DataTypes.STRING,
    accountOwner: DataTypes.STRING,
    transactionCode: DataTypes.STRING,
    transactionType: DataTypes.STRING
  }, {});
  PlaidTransaction.associate = function(models) {
    // associations can be defined here
  };
  return PlaidTransaction;
};