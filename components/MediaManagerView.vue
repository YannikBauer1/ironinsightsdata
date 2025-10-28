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
      
      <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ event?.competition?.name_short }} - {{ division.category_name }}</h2>
    </div>

    <!-- Add New Media Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Media</h3>
      
      <div class="space-y-4">
        <div>
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

        <!-- Grid Layout: Media on left, Athlete Selection on right -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Media Embed on Left -->
          <div class="flex-shrink-0 max-w-2xl">
            <!-- Instagram Embed -->
            <div v-if="mediaPreview.type === 'instagram_post' || mediaPreview.type === 'instagram_reel'" class="bg-white rounded-lg border border-gray-200 p-2 max-h-[800px] overflow-hidden">
              <blockquote
                class="instagram-media"
                :data-instgrm-permalink="`https://www.instagram.com/p/${mediaPreview.identifier}/`"
                :data-instgrm-version="14"
                style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:100%; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"
              ></blockquote>
            </div>

            <!-- YouTube Embed -->
            <div
              v-if="mediaPreview.type === 'youtube'"
              class="relative pb-[56.25%] h-0 overflow-hidden rounded-lg bg-gray-100 max-h-[600px]"
            >
              <iframe
                :src="`https://www.youtube.com/embed/${mediaPreview.identifier}`"
                class="absolute top-0 left-0 w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>

          <!-- Athlete Selection and Description on Right -->
          <div class="space-y-4">
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <input
                v-model="mediaPreview.description"
                type="text"
                placeholder="e.g., Finals highlights, Backstage moments..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
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
              <div class="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                <div
                  v-for="athlete in filteredAthletes"
                  :key="athlete.id"
                  @click="toggleAthleteSelection(athlete.id)"
                  :class="[
                    'flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100',
                    selectedAthletes.includes(athlete.id) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <img
                      :src="athlete.image_url"
                      :alt="athlete.name"
                      class="w-8 h-8 rounded-full object-cover"
                      @error="$event.target.src = athlete.image_placeholder"
                    />
                    <span>{{ athlete.name }}</span>
                  </div>
                  <svg v-if="selectedAthletes.includes(athlete.id)" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p v-if="filteredAthletes.length === 0" class="text-sm text-gray-500 p-2">No athletes found.</p>
              </div>
              
              <p class="text-sm text-gray-500 mt-2">{{ selectedAthletes.length }} athlete(s) selected</p>
            </div>

            <!-- Save button -->
            <button
              @click="saveMedia"
              :disabled="!mediaPreview || selectedAthletes.length === 0 || saving"
              class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {{ saving ? 'Saving...' : 'Save Media Entry' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Existing Media -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Existing Media</h3>
        
        <!-- Filter Tabs -->
        <div ref="filterTabsRef" class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            @click="mediaFilter = 'division'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border-2',
              mediaFilter === 'division' 
                ? 'bg-blue-600 text-white shadow-sm border-blue-600' 
                : getDivisionMediaCount() === 0
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-orange-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'
            ]"
          >
            Division
          </button>
          <button
            v-for="athlete in athletes"
            :key="athlete.id"
            @click="mediaFilter = athlete.id"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 border-2',
              mediaFilter === athlete.id 
                ? 'bg-blue-600 text-white shadow-sm border-blue-600' 
                : getAthleteMediaCount(athlete.id) === 0
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-orange-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'
            ]"
          >
            {{ athlete.name }}
          </button>
        </div>
      </div>
      
      <div v-if="loadingMedia" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading...</p>
      </div>

      <div v-else-if="mediaList.length === 0" class="text-center py-8 text-gray-500">
        No media entries yet
      </div>

      <div v-else :class="mediaFilter === 'division' ? 'space-y-4' : 'grid grid-cols-2 gap-4'" class="overflow-x-auto">
        <div
          v-for="media in filteredMediaList"
          :key="media.id"
          :class="mediaFilter === 'division' ? 'p-4 border border-gray-200 rounded-lg hover:border-blue-300 bg-white' : 'p-4 border border-gray-200 rounded-lg hover:border-blue-300 bg-white'"
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mr-2">
                {{ media.type }}
              </span>
              <span class="text-sm text-gray-600">{{ media.identifier }}</span>
            </div>
            <div class="flex gap-2">
              <button
                v-if="editingMediaId !== media.id"
                @click="startEditMedia(media)"
                class="text-blue-600 hover:text-blue-800"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteMedia(media.id)"
                class="text-red-600 hover:text-red-800"
                :disabled="editingMediaId === media.id"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Description -->
          <div v-if="editingMediaId === media.id" class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              v-model="editDescription"
              type="text"
              placeholder="e.g., Finals highlights, Backstage moments..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            <!-- Action Buttons for Athlete View (when editing) -->
            <div v-if="mediaFilter !== 'division'" class="mt-3 flex gap-2">
              <button
                @click="saveEditMedia(media)"
                :disabled="savingEdit"
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ savingEdit ? 'Saving...' : 'Save' }}
              </button>
              <button
                @click="cancelEditMedia"
                :disabled="savingEdit"
                class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
          <p v-else-if="media.description" class="text-sm text-gray-700 mb-3">{{ media.description }}</p>
            
          <!-- Main Content: Media + Tagged Athletes / Edit Form -->
          <div :class="mediaFilter === 'division' ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'">
                <!-- Media on the left (2/3 width) -->
                <div>
              <!-- Instagram Embed -->
              <div v-if="media.type === 'instagram_post' || media.type === 'instagram_reel'" class="bg-white rounded-lg border border-gray-200 p-2 max-w-3xl max-h-[800px] overflow-hidden">
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
                class="relative pb-[56.25%] h-0 overflow-hidden rounded-lg bg-gray-100 max-w-2xl max-h-96"
                style="max-height: 24rem;"
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
            
            <!-- Right Column: Edit Form OR Tagged Athletes -->
            <div v-if="mediaFilter === 'division'" class="col-span-1">
              <!-- Edit Form (when editing) -->
              <div v-if="editingMediaId === media.id" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tagged Athletes</label>
                  
                  <!-- Search athletes -->
                  <input
                    v-model="editAthleteSearch"
                    type="text"
                    placeholder="Search athletes..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
                  />

                  <!-- Athlete list -->
                  <div class="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white">
                    <div
                      v-for="athlete in editFilteredAthletes"
                      :key="athlete.id"
                      @click="toggleEditAthleteSelection(athlete.id)"
                      :class="[
                        'flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100',
                        editSelectedAthletes.includes(athlete.id) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                      ]"
                    >
                      <div class="flex items-center gap-3">
                        <img
                          :src="athlete.image_url"
                          :alt="athlete.name"
                          class="w-8 h-8 rounded-full object-cover"
                          @error="$event.target.src = athlete.image_placeholder"
                        />
                        <span>{{ athlete.name }}</span>
                      </div>
                      <svg v-if="editSelectedAthletes.includes(athlete.id)" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <p class="text-sm text-gray-500 mt-2">{{ editSelectedAthletes.length }} athlete(s) selected</p>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2">
                  <button
                    @click="saveEditMedia(media)"
                    :disabled="savingEdit"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {{ savingEdit ? 'Saving...' : 'Save' }}
                  </button>
                  <button
                    @click="cancelEditMedia"
                    :disabled="savingEdit"
                    class="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <!-- Tagged Athletes (when not editing) -->
              <div v-else>
                <div v-if="media.tagged_athletes && media.tagged_athletes.length > 0">
                  <p class="text-sm font-semibold text-gray-800 mb-2">Tagged Athletes</p>
                  <div class="space-y-2">
                    <div
                      v-for="tagged in media.tagged_athletes"
                      :key="tagged.athlete_id"
                      class="flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-800"
                    >
                      <img
                        :src="tagged.image_url"
                        :alt="tagged.name"
                        class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        @error="$event.target.src = tagged.image_placeholder"
                      />
                      <span>{{ tagged.name }}</span>
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
const mediaFilter = ref('division')

const mediaPreview = ref(null)
const selectedAthletes = ref([])
const athletes = ref([])
const mediaList = ref([])
const athleteResults = ref([])

// Edit mode state
const editingMediaId = ref(null)
const editDescription = ref('')
const editSelectedAthletes = ref([])
const editAthleteSearch = ref('')
const savingEdit = ref(false)

// Smooth scrolling for filter tabs
const filterTabsRef = ref(null)


onMounted(async () => {
  await loadAthletes()
  await loadMedia()
  
  // Make filter tabs smoothly scrollable with mouse wheel
  if (filterTabsRef.value) {
    filterTabsRef.value.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        filterTabsRef.value.scrollLeft += e.deltaY
      }
    })
  }
  
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
    // Get athletes who competed in this division with their results
    const { data: resultsData, error: resultsError } = await $supabase
      .from('result')
      .select('id, athlete_id, place')
      .eq('division_id', props.division.id)
      .limit(500)

    if (resultsError) throw resultsError

    // Store results for filtering
    athleteResults.value = resultsData

    const athleteIds = [...new Set(resultsData.map(r => r.athlete_id))]
    
    if (athleteIds.length === 0) return

    // Create a map of athlete_id to place
    const athletePlaceMap = {}
    resultsData.forEach(r => {
      if (r.place && !athletePlaceMap[r.athlete_id]) {
        athletePlaceMap[r.athlete_id] = r.place
      }
    })

    const { data: athletesData, error: athletesError } = await $supabase
      .from('athlete')
      .select(`
        *,
        person:person_id(name, name_short, sex)
      `)
      .in('id', athleteIds)

    if (athletesError) throw athletesError

    // Map athletes with their places and sort
    const athletesWithPlace = athletesData.map(a => {
      const nameLong = a.person?.name || a.person?.name_short || 'Unknown'
      const nameShort = a.person?.name_short || a.person?.name || 'Unknown'
      
      // Build image filename from name
      const imageFilename = nameLong.toLowerCase().replace(/[^a-z0-9]/g, '_')
      
      // Build image URL
      let imageUrl = `https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/logos/persons/${imageFilename}.png`
      
      // Placeholder based on sex
      const placeholder = a.person?.sex === 'female' 
        ? 'https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/placeholder/woman.png'
        : 'https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/placeholder/man.png'
      
      return {
        ...a,
        name: nameShort,
        name_long: nameLong,
        nickname: a.nickname || null,
        place: athletePlaceMap[a.id] || 999, // Default to 999 if no place
        sex: a.person?.sex || null,
        image_url: imageUrl,
        image_placeholder: placeholder
      }
    })

    // Sort by place (lower is better), then by name
    athletes.value = athletesWithPlace.sort((a, b) => {
      if (a.place !== b.place) {
        return a.place - b.place
      }
      return a.name.localeCompare(b.name)
    })
  } catch (err) {
    console.error('Error loading athletes:', err)
  }
}

async function loadMedia() {
  try {
    loadingMedia.value = true
    
    // Get result IDs for this division
    const { data: divisionResults } = await $supabase
      .from('result')
      .select('id')
      .eq('division_id', props.division.id)
    
    const resultIds = divisionResults?.map(r => r.id) || []
    
    // Load media: either has division_id OR has result_id for this division
    const { data, error } = await $supabase
      .from('media')
      .select(`
        *,
        tagged_athletes:media_tagged(
          athlete_id,
          athlete!inner(
            id,
            person:person_id(name, name_short, sex)
          )
        ),
        result:result_id(id, athlete_id, division_id)
      `)
      .or(`division_id.eq.${props.division.id},result_id.in.(${resultIds.join(',')})`)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Process media data and add image URLs for tagged athletes
    mediaList.value = (data || []).map(media => {
      if (media.tagged_athletes && media.tagged_athletes.length > 0) {
        media.tagged_athletes = media.tagged_athletes.map(tagged => {
          const nameLong = tagged.athlete?.person?.name || tagged.athlete?.person?.name_short || 'Unknown'
          const imageFilename = nameLong.toLowerCase().replace(/[^a-z0-9]/g, '_')
          const imageUrl = `https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/logos/persons/${imageFilename}.png`
          const placeholder = tagged.athlete?.person?.sex === 'female'
            ? 'https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/placeholder/woman.png'
            : 'https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/placeholder/man.png'
          
          return {
            ...tagged,
            image_url: imageUrl,
            image_placeholder: placeholder,
            name: tagged.athlete?.person?.name_short || tagged.athlete?.person?.name || 'Unknown'
          }
        })
      }
      return media
    })
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

function toggleAthleteSelection(athleteId) {
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

    // Determine media entry fields based on number of selected athletes
    let mediaEntryData = {
      type: mediaPreview.value.type,
      identifier: mediaPreview.value.identifier,
      description: mediaPreview.value.description || null
    }

    if (selectedAthletes.value.length === 1) {
      // Single athlete: use result_id only
      const athleteId = selectedAthletes.value[0]
      const result = athleteResults.value.find(r => r.athlete_id === athleteId)
      
      if (!result) {
        throw new Error('Could not find result for selected athlete')
      }
      
      mediaEntryData.result_id = result.id
    } else {
      // Multiple athletes: use division_id only
      mediaEntryData.division_id = props.division.id
    }

    // Create media entry
    const { data: mediaData, error: mediaError } = await $supabase
      .from('media')
      .insert(mediaEntryData)
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
    // First, delete all media_tagged entries for this media
    const { error: tagsError } = await $supabase
      .from('media_tagged')
      .delete()
      .eq('media_id', mediaId)

    if (tagsError) throw tagsError

    // Then, delete the media entry itself
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

const filteredMediaList = computed(() => {
  let filtered = []
  
  if (mediaFilter.value === 'division') {
    // Show only media with division_id (not result_id)
    filtered = mediaList.value.filter(media => !media.result_id)
  } else {
    // Show media where athlete is tagged AND media has result_id
    const athleteId = mediaFilter.value
    filtered = mediaList.value.filter(media => {
      // Only show media with result_id
      if (!media.result_id) return false
      
      // Check if athlete is tagged in this media
      const isTagged = media.tagged_athletes && media.tagged_athletes.some(
        tagged => tagged.athlete_id === athleteId
      )
      
      // Check if result.athlete_id matches
      const resultMatches = media.result && media.result.athlete_id === athleteId
      
      return isTagged || resultMatches
    })
  }
  
  // Sort: posts first, then reels, then others, ordered by created_at desc within each group
  const typeOrder = { instagram_post: 1, instagram_reel: 2, youtube: 3 }
  
  return filtered.sort((a, b) => {
    const aOrder = typeOrder[a.type] || 999
    const bOrder = typeOrder[b.type] || 999
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder
    }
    
    // Within same type, order by created_at desc
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

function getAthleteMediaCount(athleteId) {
  return mediaList.value.filter(media => {
    // Only count media with result_id
    if (!media.result_id) return false
    
    // Check if athlete is tagged in this media
    const isTagged = media.tagged_athletes && media.tagged_athletes.some(
      tagged => tagged.athlete_id === athleteId
    )
    
    // Check if result.athlete_id matches
    const resultMatches = media.result && media.result.athlete_id === athleteId
    
    return isTagged || resultMatches
  }).length
}

function getDivisionMediaCount() {
  // Count media without result_id (division-level media)
  return mediaList.value.filter(media => !media.result_id).length
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Edit mode functions
function startEditMedia(media) {
  editingMediaId.value = media.id
  editDescription.value = media.description || ''
  
  // Set selected athletes to currently tagged ones
  editSelectedAthletes.value = media.tagged_athletes?.map(t => t.athlete_id) || []
  editAthleteSearch.value = ''
}

function cancelEditMedia() {
  editingMediaId.value = null
  editDescription.value = ''
  editSelectedAthletes.value = []
  editAthleteSearch.value = ''
}

async function saveEditMedia(media) {
  try {
    savingEdit.value = true
    
    // Update media description
    const { error: mediaError } = await $supabase
      .from('media')
      .update({
        description: editDescription.value || null
      })
      .eq('id', media.id)
    
    if (mediaError) throw mediaError
    
    // Update tagged athletes (only if in division view)
    if (mediaFilter.value === 'division') {
      // Delete existing tags
      const { error: deleteError } = await $supabase
        .from('media_tagged')
        .delete()
        .eq('media_id', media.id)
      
      if (deleteError) throw deleteError
      
      // Create new tags
      if (editSelectedAthletes.value.length > 0) {
        const tags = editSelectedAthletes.value.map(athleteId => ({
          media_id: media.id,
          athlete_id: athleteId
        }))
        
        const { error: tagsError } = await $supabase
          .from('media_tagged')
          .insert(tags)
        
        if (tagsError) throw tagsError
      }
    }
    
    // Exit edit mode
    cancelEditMedia()
    
    // Reload media list
    await loadMedia()
    
    alert('Media entry updated successfully!')
  } catch (err) {
    console.error('Error saving media edit:', err)
    alert('Error saving media: ' + err.message)
  } finally {
    savingEdit.value = false
  }
}

function toggleEditAthleteSelection(athleteId) {
  const index = editSelectedAthletes.value.indexOf(athleteId)
  if (index === -1) {
    editSelectedAthletes.value.push(athleteId)
  } else {
    editSelectedAthletes.value.splice(index, 1)
  }
}

const editFilteredAthletes = computed(() => {
  if (!editAthleteSearch.value) return athletes.value
  
  const query = editAthleteSearch.value.toLowerCase()
  return athletes.value.filter(a =>
    a.name.toLowerCase().includes(query) ||
    (a.nickname && a.nickname.toLowerCase().includes(query))
  )
})
</script>

