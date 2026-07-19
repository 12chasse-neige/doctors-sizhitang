<script setup lang="ts">
import { clinicInfo, clinics, doctors } from '../data/doctors'

function schedulesFor(clinic: (typeof clinics)[number]) {
  return doctors.flatMap((doctor) =>
    doctor.schedules
      .filter((schedule) => schedule.clinic === clinic)
      .map((schedule) => ({ doctor, times: schedule.times })),
  )
}
</script>

<template>
  <section id="schedule" class="section schedule-section" aria-labelledby="schedule-title">
    <div class="page-shell">
      <div class="section-heading section-heading--light">
        <div>
          <p class="eyebrow eyebrow--light">出诊信息</p>
          <h2 id="schedule-title">坐诊安排一览</h2>
        </div>
        <p>按诊所整理，方便快速查找。排班如有临时调整，请以诊所通知为准。</p>
      </div>

      <div class="clinic-grid">
        <article v-for="(clinic, index) in clinics" :key="clinic" class="clinic-card">
          <div class="clinic-card__heading">
            <span aria-hidden="true">0{{ index + 1 }}</span>
            <h3>{{ clinic }}</h3>
          </div>
          <address class="clinic-card__contact">
            <div>
              <span class="clinic-card__contact-label">地址</span>
              <p>{{ clinicInfo[clinic].address }}</p>
            </div>
            <div>
              <span class="clinic-card__contact-label">电话</span>
              <a :href="`tel:${clinicInfo[clinic].telephone}`" :aria-label="`拨打${clinic}电话 ${clinicInfo[clinic].telephone}`">
                {{ clinicInfo[clinic].telephone }}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </address>
          <ul>
            <li v-for="entry in schedulesFor(clinic)" :key="entry.doctor.id">
              <a :href="`#${entry.doctor.id}`">{{ entry.doctor.name }}</a>
              <div>
                <p v-for="time in entry.times" :key="time">{{ time }}</p>
              </div>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>
