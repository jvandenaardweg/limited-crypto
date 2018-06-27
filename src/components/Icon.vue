<template>
  <span class="icon"><img v-if="iconUrl(symbol)" :src="iconUrl(symbol)" width="20" /></span>
</template>

<script>
import availableCryptocurrenciesIcons from '../../public/icons/manifest.json'

export default {
  name: 'Icon',
  props: ['symbol'],
  data: () => ({
    availableCryptocurrenciesIcons: availableCryptocurrenciesIcons.icons
  }),
  methods: {
    iconUrl (symbol) {
      if (symbol) {
        const symbolLower = symbol.toLowerCase()
        if (this.availableCryptocurrenciesIcons.includes(symbolLower)) {
          return '/icons/' + symbolLower + '@2x.png'
        }
      }
      return null
    }
  }
}
</script>

<style lang="scss">
.icon {
  background: #2E3F4B;
  width: 20px;
  height: 20px;
  border-radius: 100%;
  display: inline-block;
  margin-right: 10px;
  vertical-align: middle;
}
</style>
