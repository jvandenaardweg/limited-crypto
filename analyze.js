const fetch = require('node-fetch')
const numeral = require('numeral')
const groupBy = require('lodash/groupBy')
const util = require('util')
const redis = require('./redis')

// let stepSize = 10000000 // Every 10 million

function groupByMaxSupply (currency, key) {
  const grouping = Math.floor(currency.max_supply / stepSize)
  return grouping
}

async function getCryptocurrencies () {
  let cryptocurrencies = []
  let results = []

  const cachedData = await redis.hget('coinmarketcap', 'all')

  if (cachedData) {
    console.log('Got Coinmarketcap data from cache.')
    return JSON.parse(cachedData)
  } else {
    const limitPerRequest = 100
    const totalCryptocurrencies = await fetch('https://api.coinmarketcap.com/v2/listings/').then(result => result.json()).then(json => json.data.length)
    const totalRequests = totalCryptocurrencies / limitPerRequest

    for (var i = 0;i < totalRequests; i++) {
      const start = (i === 0) ? 1 : (limitPerRequest * i) + 1
      const url = `https://api.coinmarketcap.com/v2/ticker/?structure=array&start=${start}&limit=100&sort=id`
      console.log('Fetching...', url)
      const results = await fetch(url).then(result => result.json()).then(json => json.data)
      console.log(`Got ${results.length} currencies from CoinmarketCap.com`)
      if (results) cryptocurrencies.push(...results)
    }

    redis.hset('coinmarketcap', 'all', JSON.stringify(cryptocurrencies))
    redis.expire('coinmarketcap', (60 * 60))
    return cryptocurrencies
  }
}

async function analyze(stepSize, orderBy) {
  const cryptocurrencies = await getCryptocurrencies()
  stepSize = parseFloat(stepSize)

  const maxSupplyCryptocurrencies = cryptocurrencies.filter(currency => currency.max_supply)

  // Group currencies by max supply, so we can compare similar supply currencies
  const groupedByMaxSupply = groupBy(maxSupplyCryptocurrencies, (currency, key) => {
    if (stepSize) return Math.floor(currency.max_supply / stepSize)
    return 'all'
  })

  // Add and transform data, to make it usuable in our frontend code
  const data = Object.keys(groupedByMaxSupply).reduce((prev, step) => {
    const group = groupedByMaxSupply[step]
    if (!prev) prev = {}

    // We don't want steps with 0 in it, meaning: 0 max supply
    if (step && step !== '0') {

      // Calculate average price
      const totalInGroup = group.length
      const totalGroupPrice = group.reduce((prev, currency) => {
        const price = (currency.quotes && currency.quotes.USD) ? currency.quotes.USD.price : 0
        return prev + price
      }, null)
      const averagePrice = parseFloat(totalGroupPrice / totalInGroup)

      // Return a transformed object with additional info
      prev[step] = group.map(currency => {
        let valued
        const priceValue = parseFloat(currency.quotes.USD.price)
        const priceDifferenceWithAverage = priceValue - averagePrice
        const supplyPercentage = (currency.circulating_supply / currency.max_supply)

        if (priceValue > averagePrice) {
          valued = 'Above average for similar supply coins'
        } else if (priceValue < averagePrice) {
          valued = 'Below average for similar supply coins'
        } else {
          valued = 'Neutral'
        }

        const data = {
          symbol: currency.symbol,
          name: currency.name,
          rank: currency.rank,
          url: 'https://coinmarketcap.com/currencies/' + currency.website_slug,
          slug: currency.website_slug,
          maxSupply: currency.max_supply,
          totalSupply: currency.total_supply,
          circulatingSupply: currency.circulating_supply,
          percentageSupplied: supplyPercentage,
          price: priceValue,
          differenceWithAverage: priceDifferenceWithAverage,
          marketCap: currency.quotes.USD.market_cap,
          volume24h: currency.quotes.USD.volume_24h,
          group: {
            step: step,
            stepSize: stepSize,
            total: totalInGroup,
            averagePrice: averagePrice
          },
          currency: currency
        }

        return data

      })

      return prev

    }
  }, {})

  return data
}

module.exports = analyze
