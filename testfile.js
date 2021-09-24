const models = require("./database/models");

const getTransactions = async () => {
    let transactions = await models.PlaidTransaction
    .findAll({ order: [ ['date', 'DESC'], ['createdAt', 'DESC'], ['name', 'DESC']]
    , include: [ models.PlaidAccount] });
}


getTransactions().catch(e => console.log("error", e));




