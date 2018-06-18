<template>
  <div class="currencies">
    <div class="search">
      <input type="search" name="search" v-model="searchQuery" @input="handleSearchInput" placeholder="Search and compare multiple currencies, example: BTC, XRP, NEO" />
      <span class="btn btn-small" v-for="searchSymbol in searchSymbols" :key="searchSymbol">{{ searchSymbol }}</span>
    </div>
    <small>
      Group by similar max supply:
      <ul class="filters">
        <li><button type="button" class="btn btn-small" @click.prevent="getData(1000000)" :class="{'is-active': stepSize === 1000000}">1m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(5000000)" :class="{'is-active': stepSize === 5000000}">5m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(10000000)" :class="{'is-active': stepSize === 10000000}">10m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(50000000)" :class="{'is-active': stepSize === 50000000}">50m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(100000000)" :class="{'is-active': stepSize === 100000000}">100m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(250000000)" :class="{'is-active': stepSize === 250000000}">250m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(500000000)" :class="{'is-active': stepSize === 500000000}">500m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(1000000000)" :class="{'is-active': stepSize === 1000000000}">1b</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(1000000000)" :class="{'is-active': stepSize === 10000000000}">10b</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(1000000000)" :class="{'is-active': stepSize === 100000000000}">100b</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(0)" :class="{'is-active': stepSize === 0}">don't group</button></li>
      </ul>
    </small><br />
    <!-- <small>
      Filter by:
      <button type="button" class="btn btn-small">market cap > 100m</button>
      <button type="button" class="btn btn-small">remove exponential highest per group</button>
      <button type="button" class="btn btn-small">don't filter</button>
      <button type="button" class="btn btn-small">hide low market caps</button>
    </small> -->

    <p v-if="isLoading">Loading...</p>

    <div v-if="!isLoading && sortedGroupedCurrencies[key].length" class="currencies-group" :class="{'is-collapsed': collapsed.includes(key) }" v-for="(group, key) in sortedGroupedCurrencies" :key="key">
      <!-- <button type="button" >collapse</button> -->
      <header @click.prevent="handleCollapse(key)">
        <h2>{{ keyToStepSize(key) }} ({{ group.length }})</h2>
        <small>Average price: <span>{{ averageGroupPrice(group) }}</span></small>
      </header>
      <div class="currencies-group__body" v-if="group.length">
        <table class="table table--header">
          <thead>
            <tr>
              <th width="250"><button type="button" name="sortBy" value="name" :class="{'is-active': sortBy === 'name', 'is-asc': orderBy === 'asc', 'is-desc': orderBy === 'desc'}" @click.prevent="handleSortBy">Name</button></th>
              <th width="125"><button type="button" name="sortBy" value="price" :class="{'is-active': sortBy === 'price', 'is-asc': orderBy === 'asc', 'is-desc': orderBy === 'desc'}"  @click.prevent="handleSortBy">Price</button></th>
              <th width="125"><button type="button" name="sortBy" value="marketCap" :class="{'is-active': sortBy === 'marketCap', 'is-asc': orderBy === 'asc', 'is-desc': orderBy === 'desc'}"  @click.prevent="handleSortBy">Market cap.</button></th>
              <th width="125"><button type="button" name="sortBy" value="circulatingSupply" :class="{'is-active': sortBy === 'circulatingSupply', 'is-asc': orderBy === 'asc', 'is-desc': orderBy === 'desc'}"  @click.prevent="handleSortBy">Circ. supply</button></th>
              <th width="125"><button type="button" name="sortBy" value="maxSupply" :class="{'is-active': sortBy === 'maxSupply', 'is-asc': orderBy === 'asc', 'is-desc': orderBy === 'desc'}"  @click.prevent="handleSortBy">Max. supply</button></th>
              <th width="100"><button type="button" name="sortBy" value="percentageSupplied" :class="{'is-active': sortBy === 'percentageSupplied', 'is-asc': orderBy === 'asc', 'is-desc': orderBy === 'desc'}"  @click.prevent="handleSortBy">Supplied</button></th>
            </tr>
          </thead>
        </table>
        <div class="currencies-item" v-for="currency in group" :key="currency.slug">
          <table class="table">
            <tbody>
              <tr :class="{'is-btc': currency.symbol === 'BTC'}">
                <td width="250">
                  <span class="icon"><img v-if="iconUrl(currency.symbol)" :src="iconUrl(currency.symbol)" width="20" /></span>
                  <a :href="currency.url"><strong>{{ currency.name }}</strong> ({{ currency.symbol }})</a>
                </td>
                <td width="125"><small>{{ toCurrency(currency.price) }}</small></td>
                <td width="125"><small>${{ toSmallNumber(currency.marketCap) }}</small></td>
                <td width="125"><small>{{ toSmallNumber(currency.circulatingSupply) }}</small></td>
                <td width="125"><small>{{ toSmallNumber(currency.maxSupply) }}</small></td>
                <td width="100"><small>{{ toPercentage(currency.percentageSupplied) }}</small></td>
              </tr>
              <tr>
                <td colspan="6"><div class="progress"><div :style="{'width': toPercentage(currency.percentageSupplied)}"></div></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral'
import availableCryptocurrenciesIcons from '../../public/icons/manifest.json'

export default {
  name: 'Currencies',
  data: () => ({
    stepSize: 10000000,
    groupedCurrencies: null,
    isLoading: true,
    collapsed: [],
    sortBy: 'name',
    orderBy: 'asc',
    searchQuery: null,
    availableCryptocurrenciesIcons: availableCryptocurrenciesIcons.icons,
    searchSymbols: []
  }),
  beforeMount () {
    this.getData(this.stepSize)
  },
  computed: {
    sortedGroupedCurrencies () {
      if (this.groupedCurrencies) {
        return Object.keys(this.groupedCurrencies).map(group => {
          const filtered = this.groupedCurrencies[group].filter(currency => {
            if (this.searchSymbols.length) return this.searchSymbols.includes(currency.symbol)
            return true
          })
          return filtered.sort((a, b) => {
            if (this.orderBy === 'asc') {
              if (a[this.sortBy] < b[this.sortBy]) return -1
              if (a[this.sortBy] > b[this.sortBy]) return 1
            } else {
              if (a[this.sortBy] < b[this.sortBy]) return 1
              if (a[this.sortBy] > b[this.sortBy]) return -1
            }
            return 0
          })
        })
      }
    }
  },
  methods: {
    handleSearchInput (event) {
      console.log(event)
    },
    handleCollapse (key) {
      this.collapsed.push(key)
    },
    iconUrl (symbol) {
      const symbolLower = symbol.toLowerCase()
      if (this.availableCryptocurrenciesIcons.includes(symbolLower)) {
        return '/icons/' + symbolLower + '@2x.png'
      } else {
        return null
      }
    },
    async getData (stepSize) {
      this.isLoading = true
      this.stepSize = stepSize
      this.groupedCurrencies = await fetch(`http://localhost:3000/api?stepSize=${stepSize}`).then(result => result.json())
      this.isLoading = false
    },
    keyToStepSize (key) {
      // console.log(key)
      if (key === 'all') return 'All currencies'
      const total = key * this.stepSize
      // const smallNumber = this.toSmallNumber(total)
      return numeral(total).format('0,0') + ' - ' + numeral(total + this.stepSize - 1).format('0,0')
    },
    averageGroupPrice (group) {
      if (group[0]) return this.toCurrency(group[0].group.averagePrice)
      return 0
    },
    toSmallNumber (number) {
      return numeral(number).format('0,0a')
    },
    toCurrency (number) {
      return numeral(number).format('$0,0.00')
    },
    toPercentage (number) {
      return numeral(number).format('0%')
    },
    handleSortBy (event) {
      const value = event.target.value
      if (this.sortBy === value) {
        if (this.orderBy === 'desc') this.orderBy = 'asc'
        else if (this.orderBy === 'asc') this.orderBy = 'desc'
        // console.log(this.orderBy)
      }
      this.sortBy = value
      // console.log(event.target.value)
    }
  },
  watch: {
    searchQuery (newValue, oldValue) {
      const uppercasedValue = newValue.toUpperCase().trim()
      if (uppercasedValue.includes(',')) {
        this.searchSymbols = uppercasedValue.split(',')
      } else if (newValue) {
        this.searchSymbols = [uppercasedValue]
      } else {
        this.searchSymbols = []
      }
    }
  }
}
</script>

<style lang="scss">
.currencies {
  width: 850px;
  margin: 0 auto;
}

.icon {
  background: #2E3F4B;
  width: 20px;
  height: 20px;
  border-radius: 100%;
  display: inline-block;
  // float: left;
  margin-right: 10px;
  vertical-align: middle;
}

.currencies-group {
  margin-bottom: 5px;

  header {
    border-bottom: 1px #2E3F4B solid;
    padding-bottom: 10px;
    // margin-bottom: 10px;
    display: flex;
    line-height: 40px;
    cursor: pointer;

    h2 {
      font-size: 28px;
      margin: 0;
    }

    small {
      margin-left: auto;

      span {
        color: #EEF3F6;
      }
    }
  }

  &.is-collapsed {
    .currencies-group__body {
      display: none;
    }
  }

  .currencies-group__body {
    margin-bottom: 40px;
  }
}

.currencies-item {
  // padding-top: 10px;
  // margin-bottom: 10px;
  // padding-bottom: 20px;
  // border-bottom: 1px #2E3F4B solid;
  // progress {
  //   width: 100%;
  //   border: 0;
  //   // background: red;
  // }

  a {
    color: #EEF3F6;
    text-decoration: none;
  }

  .currencies-item__title {
    font-weight: 600;
    font-size: 18px;
    margin: 0;
  }

  .progress {
    width: 100%;
    background-color: #151E25;
    height: 3px;
    border-radius: 3px;
    overflow: hidden;
    margin-top: 10px;
    margin-bottom: 10px;

    > div {
      height: 3px;
      background-color: #2481EB;
      width: 0;
    }
  }
}

.progress-legend {
  display: flex;

  .total {
    margin-left: auto;
  }
}

.btn {
  display: inline-block;
  background: none;
  border: 0;
  margin: 0;
  color: #EEF3F6;
  font-size: 16px;
  border-radius: 3px;
  cursor: pointer;
  transition: 250ms all;
  padding: 2px 7px;
  text-align: center;

  &.btn-small {
    font-size: 14px;
    font-family: 'Droid Sans Mono', monospace;
    color: #7C8E9C;
    border: 1px #7C8E9C solid;

    &:hover,
    &.is-active {
      background-color: #7C8E9C;
      color: #151E25;
    }
  }
}

.table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  text-align: left;

  &.table--header {
    margin-bottom: 10px;
  }

  // &:hover {
  //   // tbody {
  //     // tr {
  //       &:hover {
  //         td {
  //           background-color: #2E3F4B;
  //         }
  //       }
  //     // }
  //   // }
  // }

  tbody {

    td {
      text-align: right;
      transition: 250ms all;
      // border-radius: 5px;
      // padding: 0 10px;

      &:first-child {
        text-align: left;
      }
    }
  }

  thead {
    font-family: 'Droid Sans Mono', monospace;
    color: #7C8E9C;
    font-size: 14px;
    border: 0;
    font-weight:  normal;

    th {
      border-bottom: 1px #2E3F4B solid;
      text-align: right;

      &:first-child {
        button {
          text-align: left;
        }
      }

      button {
        border: 0;
        background: none;
        margin: 0;
        padding: 0;
        width: 100%;
        display: block;
        padding: 10px 0;
        text-align: right;
        font-size: 14px;
        color: #7C8E9C;
        font-weight: bold;
        cursor: pointer;

        &:focus {
          outline: none;
        }

        &:after {
          display: inline-block;
          width: 0;
          height: 0;
          margin-left: 5px;
          vertical-align: 4px;
          content: "";
          border-top: 4px solid;
          border-right: 4px solid transparent;
          border-bottom: 0;
          border-left: 4px solid transparent;
        }

        &.is-active {
          color: #EEF3F6;

          &:after {
            display: inline-block;
          }

          &.is-asc {
            &:after {
              border-top: 4px solid;
              border-bottom: 0;
            }
          }

          &.is-desc {
            &:after {
              border-bottom: 4px solid;
              border-top: 0;
            }
          }
        }
      }
    }
  }

  .is-btc {
    color: #F7931A;

    a, small {
      color: #F7931A;
    }
  }
}

.search {
  input {
    border: 0;
    font-size: 16px;
    background-color: #151E25;
    padding: 15px;
    width: 100%;
    border-radius: 3px;
    color: #EEF3F6;
    margin-bottom: 15px;

    &::placeholder {
      color: #7C8E9C;
      opacity: 1;
    }

    &:-ms-input-placeholder {
        color: #7C8E9C;
    }

    &::-ms-input-placeholder {
        color: #7C8E9C;
    }
  }
}

.filters {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;

  li {
    margin-right: 10px;
  }
}
</style>
