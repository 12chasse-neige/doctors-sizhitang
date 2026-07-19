<script setup lang="ts">
import appearance2 from '../assets/appearance2.jpg'
import appearance3 from '../assets/appearance3.jpg'
import { enterprise } from '../data/enterprise'
</script>

<template>
  <section id="about" class="section about-section" aria-labelledby="about-title">
    <div class="page-shell">
      <div class="section-heading about-heading">
        <div>
          <p class="eyebrow">企业介绍</p>
          <h2 id="about-title">百年四之堂</h2>
        </div>
        <p>{{ enterprise.name }}，前身四之堂始创于{{ enterprise.founded }}。</p>
      </div>

      <div class="about-grid">
        <article class="about-copy">
          <p class="heritage-quote">
            <span>“四之”堂名寓意</span>
            <strong>{{ enterprise.nameMeaning }}</strong>
          </p>
          <p v-for="paragraph in enterprise.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </article>

        <div class="about-gallery">
          <figure>
            <img :src="appearance3" alt="四之堂医馆建筑外观" loading="lazy" />
          </figure>
          <figure>
            <img :src="appearance2" alt="四之堂医馆入口与门匾" loading="lazy" />
          </figure>
        </div>
      </div>

      <ol class="milestone-list" aria-label="四之堂发展历程">
        <li v-for="milestone in enterprise.milestones" :key="milestone.year">
          <span>{{ milestone.year }}</span>
          <div>
            <h3>{{ milestone.title }}</h3>
            <p>{{ milestone.description }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
