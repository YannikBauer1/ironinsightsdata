<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow p-6">
      <button
        @click="$emit('back')"
        class="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Divisions
      </button>
      
      <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ division.category_name }}</h2>
      <p class="text-sm text-gray-600">{{ event?.competition_name }} - {{ formatDate(event?.start_date) }}</p>
    </div>

    <!-- Add New Media Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Media</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Media URL (Instagram or YouTube)</label>
          <input
            v-model="newMediaUrl"
            type="text"
            placeholder="https://www.instagram.com/p/... or https://www.youtube.com/watch?v=..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          @click="processMediaUrl"
          :disabled="!newMediaUrl || processing"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ processing ? 'Processing...' : 'Process URL' }}
        </button>
      </div>

      <!-- Media Preview -->
      <div v-if="mediaPreview" class="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="font-semibold text-gray-900">Preview</h4>
            <p class="text-sm text-gray-600">{{ mediaPreview.type }} - {{ mediaPreview.identifier }}</p>
          </div>
          <button
            @click="mediaPreview = null; newMediaUrl = ''"
            class="text-gray-500 hover:text-red-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Embed Preview -->
        <div class="mb-4">
          <iframe
            v-if="mediaPreview.type === 'instagram_post' || mediaPreview.type === 'instagram_reel'"
            :src="`https://www.instagram.com/p/${mediaPreview.identifier}/embed`"
            class="w-full h-96 border-0"
            frameborder="0"
          ></iframe>
          
          <iframe
            v-else-if="mediaPreview.type === 'youtube'"
            :src="`https://www.youtube.com/embed/${mediaPreview.identifier}`"
            class="w-full h-96 border-0"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>

        <!-- Athlete Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tag Athletes</label>
          
          <!-- Search athletes -->
          <input
            v-model="athleteSearch"
            type="text"
            placeholder="Search athletes..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
          />

          <!-- Athlete list -->
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <label
              v-for="athlete in filteredAthletes"
              :key="athlete.id"
              class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="selectedAthletes.includes(athlete.id)"
                @change="toggleAthlete(athlete.id)"
                class="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500"
              />
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ athlete.name }}</p>
                <p v-if="athlete.nickname" class="text-sm text-gray-600">{{ athlete.nickname }}</p>
              </div>
            </label>
          </div>
          
          <p class="text-sm text-gray-500 mt-2">{{ selectedAthletes.length }} athlete(s) selected</p>
        </div>

        <!-- Description -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <input
            v-model="mediaPreview.description"
            type="text"
            placeholder="e.g., Finals highlights, Backstage moments..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Save button -->
        <button
          @click="saveMedia"
          :disabled="saving"
          class="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {{ saving ? 'Saving...' : 'Save Media Entry' }}
        </button>
      </div>
    </div>

    <!-- Existing Media -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Existing Media</h3>
      
      <div v-if="loadingMedia" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading...</p>
      </div>

      <div v-else-if="mediaList.length === 0" class="text-center py-8 text-gray-500">
        No media entries yet
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="media in mediaList"
          :key="media.id"
          class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 bg-white"
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mr-2">
                {{ media.type }}
              </span>
              <span class="text-sm text-gray-600">{{ media.identifier }}</span>
            </div>
            <button
              @click="deleteMedia(media.id)"
              class="text-red-600 hover:text-red-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <p v-if="media.description" class="text-sm text-gray-700 mb-3">{{ media.description }}</p>
          
          <!-- Main Content: Media + Tagged Athletes -->
          <div class="grid grid-cols-3 gap-4">
            <!-- Media on the left (2/3 width) -->
            <div class="col-span-2">
              <!-- Instagram Embed -->
              <div v-if="media.type === 'instagram_post' || media.type === 'instagram_reel'" class="bg-white rounded-lg border border-gray-200 p-2">
                <blockquote
                  class="instagram-media"
                  :data-instgrm-permalink="`https://www.instagram.com/p/${media.identifier}/`"
                  :data-instgrm-version="14"
                  style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:100%; min-width:280px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"
                ></blockquote>
              </div>
              
              <!-- YouTube Embed -->
              <div
                v-if="media.type === 'youtube'"
                class="relative pb-[56.25%] h-0 overflow-hidden rounded-lg bg-gray-100"
              >
                <iframe
                  :src="`https://www.youtube.com/embed/${media.identifier}`"
                  class="absolute top-0 left-0 w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
            
            <!-- Tagged Athletes on the right (1/3 width) -->
            <div class="col-span-1">
              <div v-if="media.tagged_athletes && media.tagged_athletes.length > 0">
                <p class="text-sm font-semibold text-gray-800 mb-2">Tagged Athletes</p>
                <div class="space-y-2">
                  <div
                    v-for="tagged in media.tagged_athletes"
                    :key="tagged.athlete_id"
                    class="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-800"
                  >
                    {{ tagged.athlete?.person?.name_short || tagged.athlete?.person?.name || 'Unknown' }}
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-400 text-sm italic">
                No athletes tagged
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  division: Object,
  event: Object
})

const emit = defineEmits(['back'])

const { $supabase } = useNuxtApp()

const newMediaUrl = ref('')
const processing = ref(false)
const saving = ref(false)
const loadingMedia = ref(false)
const athleteSearch = ref('')

const mediaPreview = ref(null)
const selectedAthletes = ref([])
const athletes = ref([])
const mediaList = ref([])

onMounted(async () => {
  await loadAthletes()
  await loadMedia()
  
  // Load Instagram embed script
  if (!window.instgrm) {
    const script = document.createElement('script')
    script.src = '//www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)
  } else {
    window.instgrm.Embeds.process()
  }
})

onUpdated(() => {
  // Process Instagram embeds when media list updates
  if (window.instgrm) {
    setTimeout(() => {
      window.instgrm.Embeds.process()
    }, 100)
  }
})

async function loadAthletes() {
  try {
    // Get athletes who competed in this division
    const { data: resultsData, error: resultsError } = await $supabase
      .from('result')
      .select('athlete_id')
      .eq('division_id', props.division.id)
      .limit(500)

    if (resultsError) throw resultsError

    const athleteIds = [...new Set(resultsData.map(r => r.athlete_id))]
    
    if (athleteIds.length === 0) return

    const { data: athletesData, error: athletesError } = await $supabase
      .from('athlete')
      .select(`
        *,
        person:person_id(name, name_short)
      `)
      .in('id', athleteIds)

    if (athletesError) throw athletesError

    // Sort by person name after fetching
    athletes.value = athletesData
      .map(a => ({
        ...a,
        name: a.person?.name_short || a.person?.name || 'Unknown',
        name_long: a.person?.name || a.person?.name_short || 'Unknown',
        nickname: a.nickname || null
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error('Error loading athletes:', err)
  }
}

async function loadMedia() {
  try {
    loadingMedia.value = true
    
    const { data, error } = await $supabase
      .from('media')
      .select(`
        *,
        tagged_athletes:media_tagged(
          athlete_id,
          athlete!inner(
            id,
            person:person_id(name, name_short)
          )
        )
      `)
      .eq('division_id', props.division.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    mediaList.value = data || []
  } catch (err) {
    console.error('Error loading media:', err)
  } finally {
    loadingMedia.value = false
  }
}

function processMediaUrl() {
  const url = newMediaUrl.value.trim()
  
  // Parse Instagram post/reel
  const instagramMatch = url.match(/instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/)
  if (instagramMatch) {
    const type = instagramMatch[1] === 'reel' ? 'instagram_reel' : 'instagram_post'
    const identifier = instagramMatch[2]
    
    mediaPreview.value = {
      type,
      identifier,
      description: '',
      url
    }
    return
  }

  // Parse YouTube
  const youtubeMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)|youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) {
    const identifier = youtubeMatch[1] || youtubeMatch[2]
    
    mediaPreview.value = {
      type: 'youtube',
      identifier,
      description: '',
      url
    }
    return
  }

  alert('Please enter a valid Instagram or YouTube URL')
}

function toggleAthlete(athleteId) {
  const index = selectedAthletes.value.indexOf(athleteId)
  if (index === -1) {
    selectedAthletes.value.push(athleteId)
  } else {
    selectedAthletes.value.splice(index, 1)
  }
}

async function saveMedia() {
  if (!mediaPreview.value || selectedAthletes.value.length === 0) {
    alert('Please select at least one athlete')
    return
  }

  try {
    saving.value = true

    // Create media entry
    const { data: mediaData, error: mediaError } = await $supabase
      .from('media')
      .insert({
        division_id: props.division.id,
        event_id: props.event.id,
        type: mediaPreview.value.type,
        identifier: mediaPreview.value.identifier,
        description: mediaPreview.value.description || null
      })
      .select()
      .single()

    if (mediaError) throw mediaError

    // Create athlete tags
    const tags = selectedAthletes.value.map(athleteId => ({
      media_id: mediaData.id,
      athlete_id: athleteId
    }))

    const { error: tagsError } = await $supabase
      .from('media_tagged')
      .insert(tags)

    if (tagsError) throw tagsError

    // Reset form
    newMediaUrl.value = ''
    mediaPreview.value = null
    selectedAthletes.value = []
    
    // Reload media list
    await loadMedia()
    
    alert('Media entry saved successfully!')
  } catch (err) {
    console.error('Error saving media:', err)
    alert('Error saving media: ' + err.message)
  } finally {
    saving.value = false
  }
}

async function deleteMedia(mediaId) {
  if (!confirm('Are you sure you want to delete this media entry?')) return

  try {
    const { error } = await $supabase
      .from('media')
      .delete()
      .eq('id', mediaId)

    if (error) throw error

    await loadMedia()
  } catch (err) {
    console.error('Error deleting media:', err)
    alert('Error deleting media: ' + err.message)
  }
}

const filteredAthletes = computed(() => {
  if (!athleteSearch.value) return athletes.value
  
  const query = athleteSearch.value.toLowerCase()
  return athletes.value.filter(a =>
    a.name.toLowerCase().includes(query) ||
    (a.nickname && a.nickname.toLowerCase().includes(query))
  )
})

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

