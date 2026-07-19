<script setup lang="ts">
import { computed, ref } from 'vue'
import DoctorCard from './DoctorCard.vue'
import { clinics, doctors, type ClinicName } from '../data/doctors'

type Filter = '全部医生' | ClinicName
const activeFilter = ref<Filter>('全部医生')
const filters: Filter[] = ['全部医生', ...clinics]

const filteredDoctors = computed(() => {
  if (activeFilter.value === '全部医生') return doctors
  return doctors.filter((doctor) => doctor.schedules.some((item) => item.clinic === activeFilter.value))
})
</script>

<template>
  <section id="doctors" class="section doctors-section" aria-labelledby="doctors-title">
    <div class="page-shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">医者介绍</p>
          <h2 id="doctors-title">认识坐诊医生</h2>
        </div>
        <p>选择诊所查看对应医生，点击资料卡可展开完整介绍与坐诊时间。</p>
      </div>

      <div class="filter-bar" role="group" aria-label="按诊所筛选医生">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          :class="{ active: activeFilter === filter }"
          :aria-pressed="activeFilter === filter"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>

      <p class="result-count" aria-live="polite">当前显示 {{ filteredDoctors.length }} 位医生</p>

      <div class="doctor-grid">
        <DoctorCard v-for="doctor in filteredDoctors" :key="doctor.id" :doctor="doctor" />
      </div>
    </div>
  </section>
</template>
