<script setup lang="ts">
import logo from '../assets/sizhitang-logo.png'
</script>

<template>
  <footer class="site-footer">
    <div class="page-shell site-footer__inner">
      <div class="brand brand--footer">
        <img class="brand__logo" :src="logo" alt="" width="44" height="51" />
        <span class="brand__text"><strong>四之堂</strong><small>医生信息</small></span>
      </div>
      <div class="site-footer__copy">
        <p>本页面仅用于医生信息展示，不构成诊断或治疗建议。</p>
        <p>实际坐诊、咨询与预约信息请以诊所或医院官方安排为准。</p>
      </div>
      <a class="back-to-top" href="#top">返回顶部 <span aria-hidden="true">↑</span></a>
    </div>
  </footer>
</template>
