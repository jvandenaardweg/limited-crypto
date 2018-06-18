<template>
  <div id="app">
    <header class="header">
      <h1>Limited cryptocurrencies</h1>
      <h2>Compare cryptocurrencies having similar limited supply</h2>
    </header>

    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <router-view/>

    <div class="footer">
      <p>Created with &hearts; in Amsterdam, by Jordy van den Aardweg. <a href="https://www.linkedin.com/in/jvandenaardweg/">Available for hire!</a></p>
    </div>
  </div>
</template>

<style lang="scss">
body {
  background-color: #1E2833;
  color: #EEF3F6;
  font-size: 16px;
  font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
}

.footer {
  text-align: center;
  color: #7C8E9C;

  p, a {
    color: #7C8E9C;
    font-size: 14px;
  }
}

.footer {
  text-align: center;

}

.header {
  text-align: center;
  display: block;
  margin: 50px 0;

  h1 {
    font-size: 46px;
    line-height: 1.2;
    margin: 0;
  }

  h2 {
    color: #7C8E9C;
    font-size: 20px;
    font-weight: normal;
    margin: 0;
  }
}

small {
  font-family: 'Droid Sans Mono', monospace;
  color: #7C8E9C;
  font-weight: normal;

  a {
    color: #7C8E9C;
  }
}



h1, h2, h3, h4 {
  font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
  font-weight: 700;
}
</style>
