<script setup lang="ts">
import type { Doctor } from '../data/doctors'

defineProps<{ doctor: Doctor }>()
</script>

<template>
  <article class="doctor-card" :id="doctor.id">
    <div class="doctor-card__summary">
      <div class="doctor-card__portrait-wrap">
        <img
          class="doctor-card__portrait"
          :src="doctor.portrait"
          :alt="`${doctor.name}${doctor.title}肖像`"
          loading="lazy"
          width="217"
          height="284"
        />
      </div>
      <div class="doctor-card__intro">
        <p class="doctor-card__title">{{ doctor.title }}</p>
        <h3>{{ doctor.name }}</h3>
        <ul class="tag-list" :aria-label="`${doctor.name}的擅长领域`">
          <li v-for="specialty in doctor.specialties" :key="specialty">{{ specialty }}</li>
        </ul>
      </div>
    </div>

    <details class="doctor-card__details">
      <summary>查看完整介绍与坐诊安排 <span aria-hidden="true">＋</span></summary>
      <div class="doctor-card__body">
        <div>
          <h4>医生简介</h4>
          <p>{{ doctor.biography }}</p>
        </div>
        <div>
          <h4>坐诊安排</h4>
          <div class="schedule-brief" v-for="schedule in doctor.schedules" :key="schedule.clinic">
            <strong>{{ schedule.clinic }}</strong>
            <p v-for="time in schedule.times" :key="time">{{ time }}</p>
          </div>
        </div>
      </div>
    </details>
  </article>
</template>
