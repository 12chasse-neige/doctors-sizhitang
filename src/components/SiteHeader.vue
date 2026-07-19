<script setup lang="ts">
import { ref } from 'vue'

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner page-shell">
      <a class="brand" href="#top" aria-label="返回四之堂医生主页" @click="closeMenu">
        <span class="brand__mark" aria-hidden="true">四</span>
        <span class="brand__text">
          <strong>四之堂</strong>
          <small>医生信息</small>
        </span>
      </a>

      <button
        class="menu-button"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="primary-navigation"
        aria-label="切换导航菜单"
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span><span></span>
      </button>

      <nav id="primary-navigation" class="site-nav" :class="{ 'site-nav--open': menuOpen }" aria-label="主要导航">
        <a href="#doctors" @click="closeMenu">医生简介</a>
        <a href="#schedule" @click="closeMenu">坐诊安排</a>
        <a href="#about" @click="closeMenu">关于四之堂</a>
      </nav>
    </div>
  </header>
</template>
