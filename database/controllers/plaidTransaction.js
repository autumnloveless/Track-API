const models = require("../models");
const { Op, Transaction } = require("sequelize");

exports.create = async (transaction) => {
  const newTransaction = await models.PlaidTransaction.create(transaction);
  return { success: true, transaction: newTransaction };
};

exports.bulkCreate = async (transactions) => {
  await models.PlaidTransaction.bulkCreate(transactions);
  return { success: true };
};

exports.find = async (id) => {
  const transaction = await models.PlaidTransaction.findOne({ where: { id: id }, include: [ models.PlaidAccount] });
  return transaction ? { success: true, transaction: transaction } : { success: false, error: "Transaction Not Found" };
};

exports.bulkFind = async (ids) => {
  const transactions = await models.PlaidTransaction.findAll({ where: { id: { [Op.in]: ids } } });
  return transactions ? { success: true, transactions: transactions } : { success: false, error: "Transactions Not Found" };
};

exports.list = async (query = null) => {
  const transactions = query
    ? await models.PlaidTransaction.findAll({ order: [ ['date', 'DESC'], ['createdAt', 'DESC'], ['name', 'DESC']], where: query, include: [ models.PlaidAccount] })
    : await models.PlaidTransaction.findAll({ order: [ ['date', 'DESC'], ['createdAt', 'DESC'], ['name', 'DESC']], include: [ models.PlaidAccount] });
    if (transactions) {
    return { success: true, transactions: transactions };
  } else {
    return { success: false, error: "transactions Not Found" };
  }
};

exports.listPaginated = async (query=null,limit=10, offset=0) => {
  let { rows:transactions, count } = query 
  ? await models.PlaidTransaction.findAndCountAll({where: query,limit: limit, offset: offset, order: [['date', 'DESC'], ['createdAt', 'DESC'], ['name', 'DESC']]})
  : await models.PlaidTransaction.findAndCountAll({limit: limit, offset: offset, order: [['date', 'DESC'], ['createdAt', 'DESC'], ['name', 'DESC']]});
  return transactions ? { success: true, transactions: transactions, count: count } : { success: false, error: "Transactions Not Found" };
}

exports.delete = async (id) => {
  await models.PlaidTransaction.destroy({ 
    where: {
      [Op.or]: [
        { id: id },
        { transactionId: id }
      ]
    }
  });
  return { "success": true };
};

exports.bulkDelete = async (ids) => {
  await models.PlaidTransaction.destroy({
    where: { transactionId: {
      [Op.in]: ids 
    }
  }});
}

exports.update = async (transaction, newData) => {
  updatedTransaction = await transaction.update(newData);
  return { "success": true, "transaction": updatedTransaction };
};

exports.bulkUpdate = async (ids, newData) => {
  await models.PlaidTransaction.update(newData, { where: {
    id: {
      [Op.in]: ids
    }
  }});
  return { "success": true };
};
