<script setup lang="ts">
import AboutSection from './components/AboutSection.vue'
import DoctorDirectory from './components/DoctorDirectory.vue'
import HeroSection from './components/HeroSection.vue'
import ScheduleSection from './components/ScheduleSection.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
</script>

<template>
  <div id="top" class="site-root">
    <a class="skip-link" href="#main-content">跳至主要内容</a>
    <SiteHeader />
    <main id="main-content">
      <HeroSection />
      <DoctorDirectory />
      <ScheduleSection />
      <AboutSection />
    </main>
    <SiteFooter />
  </div>
</template>
