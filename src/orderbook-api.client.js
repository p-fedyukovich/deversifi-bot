'use strict'

const http = require('https');

function getOrderbook(symbol = 'tETHUSD', precision = 'P0') {
  const options = {
    method: 'GET',
    hostname: 'api.deversifi.com',
    path: `/bfx/v2/book/${symbol}/${precision}`
  }

  return new Promise((resolve, reject) => {
    const req = http
      .request(options, (res) => {
        if (res.statusCode === 200) {
          const chunks = []

          res.on('data', chunk => {
            chunks.push(chunk)
          })

          res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const orderbookArray = JSON.parse(buffer.toString());

            const orderbook = orderbookArray.reduce((acc, [price, count, amount]) => {
              if (amount > 0) {
                acc.bids.push({
                  price, count, amount
                })
              } else {
                acc.asks.push({
                  price, count, amount: Math.abs(amount)
                })
              }
              return acc
            }, {
              asks: [],
              bids: []
            });

            resolve(orderbook)
          })
        } else {
          reject(
            new Error(
              `Request error: status code is ${res.statusCode}`
            )
          )
        }
      })
      .on('error', (error) => {
        reject(error)
      })

    req.end()
  })
}

module.exports = {
  getOrderbook
}
