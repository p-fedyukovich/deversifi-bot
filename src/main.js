'use strict'

const {AccountEntity} = require("./account.entity");
const {getOrderbook} = require('./orderbook-api.client');
const {TradingBot} = require('./trading-bot');

const BASE_LINE_BALANCE_ETH = 10;
const BASE_LINE_BALANCE_USD = 2000;

// Controls the count of bids and asks
const ORDERS_COUNT = 5;
// Price and amount will be generated within this percent
const MAX_PRICE_AMOUNT_DEVIATION = 5;

const ethAccount = new AccountEntity('ETH', BASE_LINE_BALANCE_ETH);
const usdAccount = new AccountEntity('USD', BASE_LINE_BALANCE_USD);

const tradingBot = new TradingBot(ethAccount, usdAccount, ORDERS_COUNT, MAX_PRICE_AMOUNT_DEVIATION);

async function run() {
  const orderbook = await getOrderbook();

  tradingBot.placeBidsAndAsks(orderbook)
  tradingBot.fillBidsAndAsks(orderbook)

  setTimeout(() => {
    run()
  }, 5000)
}

run()

setInterval(()=> {
  console.log(`${ethAccount.id} balance: ${ethAccount.calculateBalance()}`)
  console.log(`${usdAccount.id} balance: ${usdAccount.calculateBalance()}`)
}, 30000)
