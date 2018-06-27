<template>
  <div class="search">
    <input type="search" name="search" v-model="searchQuery" placeholder="Search and compare multiple currencies, example: BTC, XRP, NEO" />
    <div class="search__body">
      <span class="btn btn-small" v-for="searchSymbol in searchSymbols" :key="searchSymbol" @click.prevent="removeSymbol(searchSymbol)">{{ searchSymbol }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Search',
  data: () => ({
    searchQuery: null,
    searchSymbols: []
  }),
  methods: {
    removeSymbol (symbol) {
      const index = this.searchSymbols.indexOf(symbol)
      this.searchSymbols.splice(index, 1)
      this.searchQuery.replace(symbol, '')
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
      this.$emit('searched', this.searchSymbols)
    }
  }
}
</script>

<style lang="scss">
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

  .search__body {
    .btn {
      margin-right: 10px;
    }
  }
}
</style>
