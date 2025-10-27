<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <button @click="$router.push('/')" class="text-gray-600 hover:text-gray-900 mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Media Entry</h1>
        </div>
        <div class="text-sm text-gray-600">
          Step {{ currentStep }} of 3
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Step 1: Event Selection -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Select Event</h2>
          
          <!-- Search -->
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search events..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <!-- Loading -->
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">Loading events...</p>
          </div>

          <!-- Events List -->
          <div v-else class="space-y-2">
            <button
              v-for="event in filteredEvents"
              :key="event.id"
              @click="selectEvent(event)"
              class="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div class="flex items-start gap-4">
                <!-- Logo -->
                <div class="flex-shrink-0">
                  <img
                    :src="event.logo"
                    :alt="event.competition_name_short"
                    class="w-16 h-16 object-contain rounded"
                    @error="handleImageError"
                  />
                </div>
                
                <!-- Event Details -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                    {{ formatEventTitle(event) }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">{{ formatDateRange(event.start_date, event.end_date) }}</p>
                </div>
                
                <svg class="w-6 h-6 text-gray-400 group-hover:text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Error -->
          <div v-if="error" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Step 2: Division Selection -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ selectedEvent?.competition_name }}</h2>
          <p class="text-sm text-gray-600 mb-6">{{ formatDate(selectedEvent?.start_date) }}</p>
          
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Select Division</h3>

          <!-- Loading -->
          <div v-if="loadingDivisions" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">Loading divisions...</p>
          </div>

          <!-- Divisions List -->
          <div v-else class="space-y-2">
            <button
              v-for="division in divisions"
              :key="division.id"
              @click="selectDivision(division)"
              class="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="font-semibold text-gray-900 group-hover:text-blue-600">{{ division.category_name }}</h4>
                  <p v-if="division.description" class="text-sm text-gray-600 mt-1">{{ division.description }}</p>
                </div>
                <svg class="w-6 h-6 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- Back button -->
          <button
            @click="currentStep = 1"
            class="mt-6 text-gray-600 hover:text-gray-900 flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </button>
        </div>
      </div>

      <!-- Step 3: Media Management -->
      <div v-if="currentStep === 3" class="space-y-6">
        <MediaManagerView
          :division="selectedDivision"
          :event="selectedEvent"
          @back="currentStep = 2"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

const { $supabase } = useNuxtApp()

const currentStep = ref(1)
const loading = ref(true)
const loadingDivisions = ref(false)
const error = ref(null)
const searchQuery = ref('')

const selectedEvent = ref(null)
const selectedDivision = ref(null)

const events = ref([])
const divisions = ref([])

onMounted(async () => {
  await loadEvents()
})

async function loadEvents() {
  try {
    loading.value = true
    error.value = null

    const today = new Date().toISOString().split('T')[0]
    
    const { data, error: queryError } = await $supabase
      .from('event')
      .select(`
        *,
        competition!inner(
          name,
          name_short
        )
      `)
      .lte('start_date', today)
      .order('start_date', { ascending: false })
      .limit(100)

    if (queryError) throw queryError

    events.value = data.map(e => {
      const competitionName = e.competition.name || 'unknown'
      const competitionNameForPath = competitionName.toLowerCase().replace(/[^a-z0-9]/g, '_')
      
      return {
        ...e,
        competition_name: e.competition.name || e.competition.name_short || 'Unknown Competition',
        competition_name_short: e.competition.name_short || e.competition.name || 'Unknown',
        logo: `https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/logos/competitions/${competitionNameForPath}.png`
      }
    })
  } catch (err) {
    error.value = err.message
    console.error('Error loading events:', err)
  } finally {
    loading.value = false
  }
}

const filteredEvents = computed(() => {
  if (!searchQuery.value) return events.value
  
  const query = searchQuery.value.toLowerCase()
  return events.value.filter(e =>
    e.competition_name.toLowerCase().includes(query) ||
    e.competition_name_short?.toLowerCase().includes(query) ||
    e.location?.toLowerCase().includes(query)
  )
})

function formatDate(dateString) {
  if (!dateString) return 'Date TBA'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function handleImageError(event) {
  event.target.src = 'https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/placeholder/competition.png'
}

function formatEventTitle(event) {
  const year = event.start_date ? new Date(event.start_date).getFullYear() : null
  const nameShort = event.competition_name_short || event.competition_name || 'Unknown'
  
  return year ? `${year} - ${nameShort}` : nameShort
}

function formatDateRange(startDate, endDate) {
  if (!startDate) return 'Date TBA'
  
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null
  
  // If start and end are the same day, just show the start date
  if (!end || start.toDateString() === end.toDateString()) {
    return formatDate(startDate)
  }
  
  // Different dates - show range
  const startStr = start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  const endStr = end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
  
  return `${startStr} - ${endStr}`
}

async function selectEvent(event) {
  selectedEvent.value = event
  currentStep.value = 2
  
  try {
    loadingDivisions.value = true
    const { data, error: queryError } = await $supabase
      .from('division')
      .select(`
        *,
        category!inner(
          category_type:category_type!inner(name_short),
          category_age:category_age!inner(name),
          category_level:category_level!inner(name),
          category_weight:category_weight!inner(name)
        )
      `)
      .eq('event_id', event.id)
      .order('order')
      .limit(200)

    if (queryError) throw queryError

    divisions.value = data.map(d => ({
      ...d,
      category_name: buildCategoryName(d.category)
    }))
  } catch (err) {
    error.value = err.message
    console.error('Error loading divisions:', err)
  } finally {
    loadingDivisions.value = false
  }
}

function buildCategoryName(category) {
  if (!category) return 'Unknown Category'
  
  const parts = []
  if (category.category_type?.name_short) parts.push(category.category_type.name_short)
  if (category.category_age?.name && category.category_age.name !== 'Open') parts.push(category.category_age.name)
  if (category.category_weight?.name && category.category_weight.name !== 'Open') parts.push(category.category_weight.name)
  if (category.category_level?.name && category.category_level.name !== 'Pro') parts.push(category.category_level.name)
  
  return parts.join(' - ') || 'Open Category'
}

async function selectDivision(division) {
  selectedDivision.value = division
  currentStep.value = 3
}
</script>

