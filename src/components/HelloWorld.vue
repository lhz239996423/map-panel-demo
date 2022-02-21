<template>
  <mapPanel :visible="true" :height="700"> </mapPanel>
</template>
<script>
import mapPanel from './mapPanel.vue'
export default {
  name: 'HelloWorld',
  components: {
    mapPanel
  },
  data() {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
