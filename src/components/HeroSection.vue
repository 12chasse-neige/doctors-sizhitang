<script setup lang="ts">
import heroImage from '../assets/appearance1.jpg'
</script>

<template>
  <section class="hero" aria-labelledby="page-title">
    <img class="hero__image" :src="heroImage" alt="四之堂诊所外观" fetchpriority="high" />
    <div class="hero__overlay"></div>
    <div class="hero__content page-shell">
      <p class="eyebrow eyebrow--light">四之堂 · 医生信息</p>
      <h1 id="page-title">医道有传承<br />诊疗有温度</h1>
      <p class="hero__lead">汇集 14 位医生的专业简介、擅长领域与坐诊安排，帮助您清晰了解医生信息。</p>
      <div class="hero__actions">
        <a class="button button--primary" href="#doctors">认识医生</a>
        <a class="button button--ghost" href="#schedule">查看坐诊</a>
      </div>
      <dl class="hero__facts" aria-label="网站内容概览">
        <div><dt>14</dt><dd>位医生</dd></div>
        <div><dt>3</dt><dd>处坐诊点</dd></div>
        <div><dt>中医 · 全科</dt><dd>多领域诊疗信息</dd></div>
      </dl>
    </div>
  </section>
</template>
