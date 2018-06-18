<template>
  <div class="currencies">
    <input type="search" name="search" placeholder="Search..." />
    <small>
      Order by: <button type="button" class="btn btn-small">price</button> <button type="button" class="btn btn-small">name</button> <button type="button" class="btn btn-small">max supply</button> <button type="button" class="btn btn-small">current supply</button> <button type="button" class="btn btn-small">market cap</button>
    </small><br />
    <small>
      Group by:
      <ul>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(1000000)" :class="{'is-active': this.stepSize === 1000000}">1m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(10000000)" :class="{'is-active': this.stepSize === 10000000}">10m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(100000000)" :class="{'is-active': this.stepSize === 100000000}">100m</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(1000000000)" :class="{'is-active': this.stepSize === 1000000000}">1b</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(1000000000)" :class="{'is-active': this.stepSize === 10000000000}">10b</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(1000000000)" :class="{'is-active': this.stepSize === 100000000000}">100b</button></li>
        <li><button type="button" class="btn btn-small" @click.prevent="getData(0)" :class="{'is-active': this.stepSize === 0}">don't group</button></li>
      </ul>
    </small><br />
    <small>
      Filter by:
      <button type="button" class="btn btn-small">market cap > 100m</button>
      <button type="button" class="btn btn-small">remove exponential highest per group</button>
      <button type="button" class="btn btn-small">don't filter</button>
      <button type="button" class="btn btn-small">hide low market caps</button>
    </small>

    <p v-if="isLoading">Loading...</p>

    <div v-if="!isLoading" class="currencies-group" :class="{'is-collapsed': collapsed.includes(key) }" v-for="(group, key) in groupedCurrencies" :key="key">
      <!-- <button type="button" >collapse</button> -->
      <header @click.prevent="handleCollapse(key)">
        <h2>{{ keyToStepSize(key) }} ({{ group.length }})</h2>
        <small>Average price: {{ averageGroupPrice(group) }}</small>
      </header>
      <div class="currencies-item" v-for="currency in group" :key="currency.symbol">
        <h3 class="currencies-item__title">
          <!-- <img :src="`https://raw.githubusercontent.com/hyperdexapp/cryptocurrency-icons/master/32/color/${currency.symbol.toLowerCase()}.png`" width="18" /> -->
          <span>{{ currency.name }} ({{ currency.symbol }})</span>
          <small>{{ toCurrency(currency.price.value) }}</small> /
          <small>${{ toSmallNumber(currency.price.marketCap) }}</small>
        </h3>

        <div class="progress"><div :style="{'width': toPercentage(currency.supply.percentage)}"></div></div>
        <div class="progress-legend">
          <small class="current">Supply current: {{ toSmallNumber(currency.supply.total) }} ({{ toPercentage(currency.supply.percentage) }})</small>
          <small class="total">Max: {{ toSmallNumber(currency.supply.max) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral'

export default {
  name: 'Currencies',
  data: () => ({
    stepSize: 10000000,
    groupedCurrencies: null,
    isLoading: true,
    collapsed: []
  }),
  beforeMount () {
    this.getData(this.stepSize)
  },
  methods: {
    handleCollapse (key) {
      this.collapsed.push(key)
    },
    async getData (stepSize) {
      this.isLoading = true
      this.stepSize = stepSize
      this.groupedCurrencies = await fetch(`http://localhost:3000/api?stepSize=${stepSize}`).then(result => result.json())
      this.isLoading = false
    },
    keyToStepSize (key) {
      if (key === 'all') return 'All currencies'
      const total = key * this.stepSize
      const smallNumber = this.toSmallNumber(total)
      return numeral(total).format('0,0') + ' - ' + numeral(total + this.stepSize - 1).format('0,0')
    },
    averageGroupPrice (group) {
      return this.toCurrency(group[0].group.averagePrice)
    },
    toSmallNumber (number) {
      return numeral(number).format('0,0a')
    },
    toCurrency (number) {
      return numeral(number).format('$0,0.00')
    },
    toPercentage (number) {
      return numeral(number).format('0%')
    }
  }
}
</script>

<style lang="scss">
.currencies {
  width: 700px;
  margin: 0 auto;
}

.currencies-group {
  margin-bottom: 50px;
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
    }
  }

  &.is-collapsed {
    .currencies-item {
      display: none;
    }
  }
}

.currencies-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px #2E3F4B solid;
  // progress {
  //   width: 100%;
  //   border: 0;
  //   // background: red;
  // }

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
</style>
