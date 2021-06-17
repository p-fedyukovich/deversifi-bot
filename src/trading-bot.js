'use strict'

const _ = require('lodash');
const {random} = require('./utils');

class TradingBot {
  constructor(commodityAccount, currencyAccount, ordersCount = 5, maxPercent = 5) {
    this.commodityAccount = commodityAccount
    this.currencyAccount = currencyAccount
    this.bids = []
    this.asks = []
    this.ordersCount = ordersCount
    this.maxPercent = maxPercent
  }

  placeOrders(orderType, orders, bestOrder) {
    _.times(this.ordersCount - orders.length, () => {
      let price;

      if (orderType === 'BID') {
        price = bestOrder.price - random(this.maxPercent / 100) * bestOrder.price;
      } else {
        price = bestOrder.price + random(this.maxPercent / 100) * bestOrder.price;
      }

      const amount = bestOrder.amount + random(this.maxPercent / 100) * bestOrder.amount;

      // should I place order even if account doesn't have enough assets?
      orders.push({price, amount})

      console.log(`PLACE ${orderType} @ PRICE: ${price} AMOUNT: ${amount}`)
    })

    return orders
  }

  placeBids(orderbook) {
    return this.placeOrders('BID', this.bids, orderbook.bids[0])
  }

  placeAsks(orderbook) {
    return this.placeOrders( 'ASK', this.asks, orderbook.asks[0])
  }

  placeBidsAndAsks(orderbook) {
    this.placeBids(orderbook)
    this.placeAsks(orderbook)
  }

  fillOrders(orderType, orders, bestOrder) {
    const remainingOrders = []
    let lastOrder;

    while (orders.length) {
      lastOrder = orders.pop();
      const total = lastOrder.amount * lastOrder.price;

      switch (orderType) {
        case 'BID':
          if (lastOrder.price > bestOrder.price) {
            const withdrawalSucceeded = this.currencyAccount.withdraw(total);
            if (withdrawalSucceeded) {
              this.commodityAccount.deposit(lastOrder.amount);
              console.log(`FILLED BID @ PRICE AMOUNT (ETH + ${lastOrder.amount} USD - ${total})`)
            }
            // else should I just ignore this bid?
          } else {
            const diff = bestOrder.price - lastOrder.price;
            const percentage = diff / bestOrder.price * 100;
            if (percentage < this.maxPercent) {
              remainingOrders.push(lastOrder)
            }
          }
          break
        case 'ASK':
          if (lastOrder.price < bestOrder.price) {
            const withdrawalSucceeded = this.commodityAccount.withdraw(lastOrder.amount)
            if (withdrawalSucceeded) {
              this.currencyAccount.deposit(total);
              console.log(`FILLED ASK @ PRICE AMOUNT (ETH - ${lastOrder.amount} USD + ${total})`)
            }
            // else should I just ignore this ask?
          } else {
            const diff = lastOrder.price - bestOrder.price;
            const percentage = diff / lastOrder.price * 100;
            if (percentage < this.maxPercent) {
              remainingOrders.push(lastOrder)
            }
          }
          break
      }
    }

    orders.push(...remainingOrders)
  }

  fillBids(orderbook) {
    this.fillOrders('BID', this.bids, orderbook.bids[0])
  }

  fillAsks(orderbook) {
    this.fillOrders('ASK', this.asks, orderbook.asks[0])
  }

  fillBidsAndAsks(orderbook) {
    this.fillBids(orderbook)
    this.fillAsks(orderbook)
  }
}

module.exports = {
  TradingBot
}
