'use strict'

const {expect} = require('chai');

const {AccountEntity} = require("../src/account.entity");
const {TradingBot} = require("../src/trading-bot");

describe('Trading bot test', () => {
  let ethAccount;
  let usdAccount;
  let tradingBot;

  beforeEach(() => {
    ethAccount = new AccountEntity('ETH', 10);
    usdAccount = new AccountEntity('USD', 2000);

    tradingBot = new TradingBot(ethAccount, usdAccount);
  })

  describe('when bot does not have placed bids', () => {
    it('should place correct 5 bids', () => {
      const bestBid = {
        price: 1000,
        count: 2,
        amount: 5
      };
      const bids = tradingBot.placeBids({
        bids: [bestBid, {
          price: 900,
          count: 2,
          amount: 4
        }]
      });

      expect(bids).to.be.an('array').that.has.lengthOf(5)

      bids.forEach(bid => {
        expect(bid.price).to.be.lessThan(1000)
        const diffPrice = bestBid.price - bid.price;
        const percentagePrice = diffPrice / bestBid.price * 100;
        expect(percentagePrice).to.be.lessThan(5)
        expect(percentagePrice).to.be.greaterThan(0)

        const diffAmount = bid.amount - bestBid.amount;
        const percentageAmount = diffAmount / bid.amount * 100;
        expect(percentageAmount).to.be.lessThan(5)
        expect(percentageAmount).to.be.greaterThan(0)
      })
    });
  });

  describe('when bot has 1 placed bid', () => {
    beforeEach(() => {
      tradingBot.bids = [{
        price: 999,
        amount: 5.2
      }]
    })

    it('should place correct 4 bids', () => {
      const bestBid = {
        price: 1000,
        count: 2,
        amount: 5
      };
      const bids = tradingBot.placeBids({
        bids: [bestBid, {
          price: 900,
          count: 2,
          amount: 4
        }]
      });

      expect(bids).to.be.an('array').that.has.lengthOf(5)

      bids.forEach(bid => {
        expect(bid.price).to.be.lessThan(1000)
        const diffPrice = bestBid.price - bid.price;
        const percentagePrice = diffPrice / bestBid.price * 100;
        expect(percentagePrice).to.be.lessThan(5)
        expect(percentagePrice).to.be.greaterThan(0)

        const diffAmount = bid.amount - bestBid.amount;
        const percentageAmount = diffAmount / bid.amount * 100;
        expect(percentageAmount).to.be.lessThan(5)
        expect(percentageAmount).to.be.greaterThan(0)
      })
    });
  })

  describe('when bot does not have placed asks', () => {
    beforeEach(() => {
      tradingBot.bids = [{
        price: 999,
        amount: 5.2
      }]
    })

    it('should place correct 4 asks', () => {
      const bestAsk = {
        price: 1000,
        count: 2,
        amount: 5
      };
      const asks = tradingBot.placeAsks({
        asks: [bestAsk, {
          price: 1100,
          count: 2,
          amount: 4
        }]
      });

      expect(asks).to.be.an('array').that.has.lengthOf(5)

      asks.forEach(ask => {
        expect(ask.price).to.be.greaterThan(bestAsk.price)
        const diffPrice = ask.price - bestAsk.price;
        const percentagePrice = diffPrice / ask.price * 100;
        expect(percentagePrice).to.be.lessThan(5)
        expect(percentagePrice).to.be.greaterThan(0)

        const diffAmount = ask.amount- bestAsk.amount;
        const percentageAmount = diffAmount / ask.amount * 100;
        expect(percentageAmount).to.be.lessThan(5)
        expect(percentageAmount).to.be.greaterThan(0)
      })
    });
  });

  describe('when bot has 1 placed ask', () => {
    it('should place correct 5 asks', () => {
      const bestAsk = {
        price: 1000,
        count: 2,
        amount: 5
      };
      const asks = tradingBot.placeAsks({
        asks: [bestAsk, {
          price: 1100,
          count: 2,
          amount: 4
        }]
      });

      expect(asks).to.be.an('array').that.has.lengthOf(5)

      asks.forEach(ask => {
        expect(ask.price).to.be.greaterThan(bestAsk.price)
        const diffPrice = ask.price - bestAsk.price;
        const percentagePrice = diffPrice / ask.price * 100;
        expect(percentagePrice).to.be.lessThan(5)
        expect(percentagePrice).to.be.greaterThan(0)

        const diffAmount = ask.amount- bestAsk.amount;
        const percentageAmount = diffAmount / ask.amount * 100;
        expect(percentageAmount).to.be.lessThan(5)
        expect(percentageAmount).to.be.greaterThan(0)
      })
    });
  });

  describe('when bot has 1 placed bid', () => {
    describe('which can be filled', () => {
      describe('and account has enough assets', () => {
        beforeEach(() => {
          tradingBot.bids = [{
            price: 1100,
            amount: 1
          }]
        })

        it('should fill the bid', () => {
          tradingBot.fillBids({
            bids: [{
              price: 1000,
              count: 2,
              amount: 5
            }]
          });

          expect(tradingBot.bids).to.have.lengthOf(0)

          expect(ethAccount.calculateBalance()).to.eq(11)
          expect(usdAccount.calculateBalance()).to.eq(900)
        });
      });

      describe('and account does not have enough assets', () => {
        beforeEach(() => {
          tradingBot.bids = [{
            price: 2001,
            amount: 1
          }]
        })

        it('should ignore the bid', () => {
          tradingBot.fillBids({
            bids: [{
              price: 1000,
              count: 2,
              amount: 5
            }]
          });

          expect(tradingBot.bids).to.have.lengthOf(0)

          expect(ethAccount.calculateBalance()).to.eq(10)
          expect(usdAccount.calculateBalance()).to.eq(2000)
        });
      });
    });

    describe('which can not be filled', () => {
      beforeEach(() => {
        tradingBot.bids = [{
          price: 999,
          amount: 1
        }]
      })

      it('should leave the bid', () => {
        tradingBot.fillBids({
          bids: [{
            price: 1000,
            count: 2,
            amount: 5
          }]
        });

        expect(tradingBot.bids).to.have.lengthOf(1)

        expect(ethAccount.calculateBalance()).to.eq(10)
        expect(usdAccount.calculateBalance()).to.eq(2000)
      });
    });

    describe('which has retired since deviation changed more then 5%', () => {
      beforeEach(() => {
        tradingBot.bids = [{
          price: 500,
          amount: 1
        }]
      })

      it('should remove the bid', () => {
        tradingBot.fillBids({
          bids: [{
            price: 1000,
            count: 2,
            amount: 5
          }]
        });

        expect(tradingBot.bids).to.have.lengthOf(0)

        expect(ethAccount.calculateBalance()).to.eq(10)
        expect(usdAccount.calculateBalance()).to.eq(2000)
      });
    });
  });

  describe('when bot has 1 placed ask', () => {
    describe('which can be filled', () => {
      describe('and account has enough assets', () => {
        beforeEach(() => {
          tradingBot.asks = [{
            price: 900,
            amount: 1
          }]
        })

        it('should fill the ask', () => {
          tradingBot.fillAsks({
            asks: [{
              price: 1000,
              count: 2,
              amount: 5
            }]
          });

          expect(tradingBot.asks).to.have.lengthOf(0)

          expect(ethAccount.calculateBalance()).to.eq(9)
          expect(usdAccount.calculateBalance()).to.eq(2900)
        });
      });

      describe('and account does not have enough assets', () => {
        beforeEach(() => {
          tradingBot.asks = [{
            price: 900,
            amount: 11
          }]
        })

        it('should ignore the ask', () => {
          tradingBot.fillAsks({
            asks: [{
              price: 1000,
              count: 2,
              amount: 5
            }]
          });

          expect(tradingBot.bids).to.have.lengthOf(0)

          expect(ethAccount.calculateBalance()).to.eq(10)
          expect(usdAccount.calculateBalance()).to.eq(2000)
        });
      });
    });

    describe('which can not be filled', () => {
      beforeEach(() => {
        tradingBot.asks = [{
          price: 1001,
          amount: 1
        }]
      })

      it('should leave the bid', () => {
        tradingBot.fillAsks({
          asks: [{
            price: 1000,
            count: 2,
            amount: 5
          }]
        });

        expect(tradingBot.asks).to.have.lengthOf(1)

        expect(ethAccount.calculateBalance()).to.eq(10)
        expect(usdAccount.calculateBalance()).to.eq(2000)
      });
    });

    describe('which has retired since deviation changed more then 5%', () => {
      beforeEach(() => {
        tradingBot.asks = [{
          price: 1500,
          amount: 1
        }]
      })

      it('should remove the ask', () => {
        tradingBot.fillAsks({
          asks: [{
            price: 1000,
            count: 2,
            amount: 5
          }]
        });

        expect(tradingBot.asks).to.have.lengthOf(0)

        expect(ethAccount.calculateBalance()).to.eq(10)
        expect(usdAccount.calculateBalance()).to.eq(2000)
      });
    });
  });
});
