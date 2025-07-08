<template>
  <div class="pl-box">
    <div class="logo-wrap">
      <img src="@/assets/logo.png" alt="" width="66" height="66" style="margin-right: 10px;border-radius: 10px;" />
    </div>
    <n-scrollbar class="pm-name-wrap">
      <div class="p-name" v-for="item in pList">
        <router-link :to="'/pd/' + item">项目{{ item }}</router-link>
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
const pList = 20
</script>

<style scoped>
.pl-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  padding-right: 0px;
  background-color: #f9fcfe;
  box-sizing: border-box;
}

.logo-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.pm-name-wrap {
  flex: 1;
  overflow-y: auto;
}

.pm-name-wrap .p-name {
  margin-right: 10px;
  border-radius: 8px;
  padding: 8px 10px;
  transition: all 0.2s ease-in-out;
}

.pm-name-wrap .p-name:hover {
  background-color: #edf7fe;
}
</style>
