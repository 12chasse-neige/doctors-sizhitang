<script setup lang="ts">
import heroImage from '../assets/appearance1.jpg'
</script>

<template>
  <section class="hero" aria-labelledby="page-title">
    <img class="hero__image" :src="heroImage" alt="四之堂诊所外观" fetchpriority="high" />
    <div class="hero__overlay"></div>
    <div class="hero__content page-shell">
      <p class="eyebrow eyebrow--light">四之堂 · 始创于1914年</p>
      <h1 id="page-title">医道有传承<br />诊疗有温度</h1>
      <p class="hero__lead">汇集 15 位医生的专业简介、擅长领域与坐诊安排，帮助您清晰了解医生信息。</p>
      <div class="hero__actions">
        <a class="button button--primary" href="#doctors">认识医生</a>
        <a class="button button--ghost" href="#schedule">查看坐诊</a>
      </div>
      <dl class="hero__facts" aria-label="网站内容概览">
        <div><dt>15</dt><dd>位医生</dd></div>
        <div><dt>3</dt><dd>处坐诊点</dd></div>
        <div><dt>1914</dt><dd>四之堂始创</dd></div>
      </dl>
    </div>
  </section>
</template>
