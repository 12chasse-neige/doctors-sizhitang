<script setup lang="ts">
import appearance2 from '../assets/appearance2.jpg'
import appearance3 from '../assets/appearance3.jpg'
</script>

<template>
  <section id="about" class="section about-section" aria-labelledby="about-title">
    <div class="page-shell about-grid">
      <div class="about-copy">
        <p class="eyebrow">环境一览</p>
        <h2 id="about-title">四之堂诊所</h2>
        <p>本页集中展示四之堂相关医生的简介、擅长领域，以及四之堂、惠民和金马三处诊所的坐诊信息。</p>
        <p class="about-note">三处诊所的地址和联系电话已列于坐诊安排中；材料未提供线上预约入口。</p>
      </div>
      <div class="about-gallery">
        <figure>
          <img :src="appearance3" alt="四之堂诊所建筑外观" loading="lazy" />
        </figure>
        <figure>
          <img :src="appearance2" alt="四之堂诊所入口与门匾" loading="lazy" />
        </figure>
      </div>
    </div>
  </section>
</template>
