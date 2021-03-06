<template>
  <div class="currencies">
    <div class="currencies__header">
      <search @searched="handleSearch"></search>

      <div class="currencies__controls">
          <h2>Group by similar max supply:</h2>

          <ul class="filters">
            <li><btn className="btn-small" label="1m" @click.native="getData(1000000)" :class="{'is-active': stepSize === 1000000}"></btn></li>
            <li><btn className="btn-small" label="5m" @click.native="getData(5000000)" :class="{'is-active': stepSize === 5000000}"></btn></li>
            <li><btn className="btn-small" label="10m" @click.native="getData(10000000)" :class="{'is-active': stepSize === 10000000}"></btn></li>
            <li><btn className="btn-small" label="50m" @click.native="getData(50000000)" :class="{'is-active': stepSize === 50000000}"></btn></li>
            <li><btn className="btn-small" label="100m" @click.native="getData(100000000)" :class="{'is-active': stepSize === 100000000}"></btn></li>
            <li><btn className="btn-small" label="250m" @click.native="getData(250000000)" :class="{'is-active': stepSize === 250000000}"></btn></li>
            <li><btn className="btn-small" label="500m" @click.native="getData(500000000)" :class="{'is-active': stepSize === 500000000}"></btn></li>
            <li><btn className="btn-small" label="1b" @click.native="getData(1000000000)" :class="{'is-active': stepSize === 1000000000}"></btn></li>
            <li><btn className="btn-small" label="10b" @click.native="getData(10000000000)" :class="{'is-active': stepSize === 10000000000}"></btn></li>
            <li><btn className="btn-small" label="100b" @click.native="getData(100000000000)" :class="{'is-active': stepSize === 100000000000}"></btn></li>
            <li><btn className="btn-small" label="don't group" @click.native="getData(0)" :class="{'is-active': stepSize === 0}"></btn></li>
          </ul>
      </div>
    </div>

    <div class="currencies__body">
      <div v-if="isLoading" class="currencies__loader"><p>Loading...</p></div>

      <div v-if="!isLoading && sortedGroupedCurrencies[key].length" class="currencies-group" :class="{'is-collapsed': collapsed.includes(key) }" v-for="(group, key) in sortedGroupedCurrencies" :key="key">
        <header @click.prevent="handleCollapse(key)">
          <h2>{{ groupTitle(key, group) }}</h2>
          <small>Average price: <span>{{ averageGroupPrice(group) }}</span></small>
        </header>
        <div class="currencies-group__body" v-if="group.length">
          <table class="table table--header">
            <thead>
              <tr>
                <th width="50"><button type="button" name="sortBy" value="rank" :class="{'is-active': sortBy === 'rank', 'is-asc': orderBy === 'asc', 'is-desc': orderBy === 'desc'}" @click.prevent="handleSortBy">#</button></th>
                <th width="200"><button type="button" name="sortBy" value="name" :class="{'is-active': sortBy === 'name', 'is-asc': orderBy === 'asc', 'is-desc': orderBy === 'desc'}" @click.prevent="handleSortBy">Name</button></th>
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
                  <td width="50"><small>{{ currency.rank }}</small></td>
                  <td width="200">
                    <icon :symbol="currency.symbol"></icon>
                    <a :href="currency.url"><strong>{{ currency.name }}</strong> ({{ currency.symbol }})</a>
                  </td>
                  <td width="125"><small>{{ toCurrency(currency.price) }}</small></td>
                  <td width="125"><small>${{ toSmallNumber(currency.marketCap) }}</small></td>
                  <td width="125"><small>{{ toSmallNumber(currency.circulatingSupply) }}</small></td>
                  <td width="125"><small>{{ toSmallNumber(currency.maxSupply) }}</small></td>
                  <td width="100"><small>{{ toPercentage(currency.percentageSupplied) }}</small></td>
                </tr>
                <tr>
                  <td colspan="7"><div class="progress"><div :style="{'width': toPercentage(currency.percentageSupplied)}"></div></div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral'
import Search from '@/components/Search'
import Icon from '@/components/Icon'
import Btn from '@/components/Btn'

export default {
  name: 'Currencies',
  components: {
    Search,
    Icon,
    Btn
  },
  data: () => ({
    stepSize: 0, // Don't group on initial page load
    groupedCurrencies: null,
    isLoading: true,
    collapsed: [],
    sortBy: 'marketCap',
    orderBy: 'desc',
    searchQuery: null,
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
    groupTitle (key, group) {
      if (!this.stepSize) return 'All currencies' + `(${group.length})`
      return this.keyToStepSize(key) + `(${group.length})`
    },
    hasCurrencies (key) {
      return !this.isLoading && this.sortedGroupedCurrencies[key].length
    },
    handleSearch (data) {
      this.searchSymbols = data
    },
    handleCollapse (key) {
      // If the key already exist, it's already collapsed. We now open it.
      if (this.collapsed.includes(key)) {
        const index = this.collapsed.indexOf(key)
        this.collapsed.splice(index, 1)
      } else {
        this.collapsed.push(key)
      }
    },
    async getData (stepSize) {
      const baseUrl = (process.env.NODE_ENV !== 'production') ? 'http://localhost:3000/' : '/'

      try {
        this.isLoading = true
        this.stepSize = stepSize
        this.groupedCurrencies = await fetch(`${baseUrl}api?stepSize=${stepSize}`).then(result => result.json())
      } catch (err) {
        console.log(err)
      } finally {
        this.isLoading = false
      }
    },
    keyToStepSize (key) {
      if (key === 'all') return 'All currencies'
      const total = key * this.stepSize
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
      }
      this.sortBy = value
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

  .currencies__header {
    margin-bottom: 20px;
  }

  .currencies__controls {
    border-bottom: 1px #2E3F4B solid;
    padding-bottom: 20px;

    h2 {
      font-size: 16px;
    }
  }

  .currencies__loader {
    font-size: 24px;
    text-align: center;
    padding: 20px 0;
  }
}

.currencies-group {
  margin-bottom: 5px;

  header {
    border-bottom: 1px #2E3F4B solid;
    padding-bottom: 10px;
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

.table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  text-align: left;

  &.table--header {
    margin-bottom: 10px;
  }

  tbody {

    td {
      text-align: right;
      transition: 250ms all;

      &:first-child,
      &:nth-child(2) {
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

      &:first-child,
      &:nth-child(2) {
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
