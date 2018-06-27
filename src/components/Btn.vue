<template>
  <button type="button" class="btn" :class="className">{{ label }}</button>
</template>

<script>
export default {
  name: 'Btn',
  props: ['className', 'label']
}
</script>

<style lang="scss">
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
</style>
