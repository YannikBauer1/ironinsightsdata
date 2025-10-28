<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div
        class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between"
      >
        <div>
          <button
            @click="$router.push('/')"
            class="text-gray-600 hover:text-gray-900 mb-2 flex items-center"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Media Entry</h1>
        </div>
        <div class="text-sm text-gray-600">Step {{ currentStep }} of 3</div>
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
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
            ></div>
            <p class="mt-4 text-gray-600">Loading events...</p>
          </div>

          <!-- Events List -->
          <div v-else class="space-y-2">
            <div
              v-for="event in filteredEvents"
              :key="event.id"
              @click="selectEvent(event)"
              class="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors group bg-white cursor-pointer"
            >
              <div class="flex items-center gap-4">
                <!-- Logo -->
                <div class="flex-shrink-0">
                  <img
                    :src="event.logo"
                    :alt="event.competition_name_short"
                    class="w-14 h-14 object-contain rounded"
                    @error="handleImageError"
                  />
                </div>

                <!-- Event Details -->
                <div class="flex-1 min-w-0">
                  <h3
                    class="font-semibold text-gray-900 group-hover:text-blue-600 truncate"
                  >
                    {{ formatEventTitle(event) }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ formatDateRange(event.start_date, event.end_date) }}
                  </p>
                  <!-- Stats -->
                  <div class="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>🎬 {{ event.athletes_with_media || 0 }}/{{ event.total_athletes || 0 }} athletes</span>
                    <span>📁 {{ event.divisions_with_media || 0 }}/{{ event.total_divisions || 0 }} divisions</span>
                  </div>
                </div>

                <!-- Checkbox -->
                <div class="flex items-center gap-2" @click.stop>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="event.is_complete"
                      @change="toggleEventComplete(event)"
                      class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                <!-- Arrow Icon -->
                <div class="flex-shrink-0 text-blue-600">
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          >
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Step 2: Division Selection -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <!-- Back button -->
          <button
            @click="currentStep = 1"
            class="text-gray-600 hover:text-gray-900 flex items-center mb-4"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Events
          </button>

          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            {{ selectedEvent?.year }} -
            {{ selectedEvent?.competition?.name_short }}
          </h2>

          <!-- Loading -->
          <div v-if="loadingDivisions" class="text-center py-8">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
            ></div>
            <p class="mt-4 text-gray-600">Loading divisions...</p>
          </div>

          <!-- Divisions List -->
          <div v-else class="space-y-2">
            <button
              v-for="division in divisions"
              :key="division.id"
              @click="selectDivision(division)"
              :class="[
                'w-full text-left p-4 border-2 rounded-lg hover:border-blue-500 transition-colors group',
                (currentStep === 2 && getDivisionMediaCountInEvent(division.id) === 0)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:bg-blue-50'
              ]"
            >
              <div class="flex justify-between items-center">
                <div>
                  <h4
                    class="font-semibold text-gray-900 group-hover:text-blue-600"
                  >
                    {{ division.category_name }}
                  </h4>
                  <p
                    v-if="division.description"
                    class="text-sm text-gray-600 mt-1"
                  >
                    {{ division.description }}
                  </p>
                </div>
                <svg
                  class="w-6 h-6 text-gray-400 group-hover:text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
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
  layout: "default",
});

const { $supabase } = useNuxtApp();

const currentStep = ref(1);
const loading = ref(true);
const loadingDivisions = ref(false);
const error = ref(null);
const searchQuery = ref("");

const selectedEvent = ref(null);
const selectedDivision = ref(null);

const events = ref([]);
const divisions = ref([]);
const divisionsWithMedia = ref({});

onMounted(async () => {
  await loadEvents();
});

async function loadEvents() {
  try {
    loading.value = true;
    error.value = null;

    const today = new Date().toISOString().split("T")[0];

    const { data, error: queryError } = await $supabase
      .from("event")
      .select(
        `
        *,
        competition!inner(
          name,
          name_short
        )
      `
      )
      .lte("start_date", today)
      .order("start_date", { ascending: false })
      .limit(100);

    if (queryError) throw queryError;

    // Load completed events from JSON
    const completedEvents = await loadCompletedEvents();

    events.value = await Promise.all(data.map(async (e) => {
      const competitionName = e.competition.name || "unknown";
      const competitionNameForPath = competitionName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");

      const year = e.start_date ? new Date(e.start_date).getFullYear() : null;
      const eventKey = `${year}-${e.competition.name_short || e.competition.name}`;
      
      // Load stats for this event
      const stats = await loadEventStats(e.id);

      return {
        ...e,
        competition_name:
          e.competition.name ||
          e.competition.name_short ||
          "Unknown Competition",
        competition_name_short:
          e.competition.name_short || e.competition.name || "Unknown",
        logo: `https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/logos/competitions/${competitionNameForPath}.png`,
        athletes_with_media: stats.athletes_with_media,
        total_athletes: stats.total_athletes,
        divisions_with_media: stats.divisions_with_media,
        total_divisions: stats.total_divisions,
        is_complete: completedEvents.includes(eventKey),
      };
    }));
  } catch (err) {
    error.value = err.message;
    console.error("Error loading events:", err);
  } finally {
    loading.value = false;
  }
}

async function loadEventStats(eventId) {
  try {
    // Get all divisions for this event
    const { data: divisions } = await $supabase
      .from('division')
      .select('id')
      .eq('event_id', eventId);

    const totalDivisions = divisions?.length || 0;
    
    if (totalDivisions === 0) {
      return { athletes_with_media: 0, total_athletes: 0, divisions_with_media: 0, total_divisions: 0 };
    }

    const divisionIds = divisions.map(d => d.id);

    // Get all results for divisions in this event
    const { data: results } = await $supabase
      .from('result')
      .select('id, athlete_id, division_id')
      .in('division_id', divisionIds);

    const totalAthletes = [...new Set(results?.map(r => r.athlete_id) || [])].length;

    // Get media for divisions
    const { data: media } = await $supabase
      .from('media')
      .select('id, division_id, result_id')
      .in('division_id', divisionIds);

    // Count divisions with media
    const divisionsWithMedia = [...new Set(media?.map(m => m.division_id) || [])].length;

    // Get media_tagged entries for all media in these divisions
    const mediaIds = media?.map(m => m.id) || [];
    let athletesWithMediaSet = new Set();
    
    if (mediaIds.length > 0) {
      const { data: tagged } = await $supabase
        .from('media_tagged')
        .select('athlete_id')
        .in('media_id', mediaIds);
      
      tagged?.forEach(t => {
        if (t.athlete_id) {
          athletesWithMediaSet.add(t.athlete_id);
        }
      });
    }

    return {
      athletes_with_media: athletesWithMediaSet.size,
      total_athletes: totalAthletes,
      divisions_with_media: divisionsWithMedia,
      total_divisions: totalDivisions
    };
  } catch (err) {
    console.error('Error loading event stats:', err);
    return { athletes_with_media: 0, total_athletes: 0, divisions_with_media: 0, total_divisions: 0 };
  }
}

async function loadCompletedEvents() {
  if (!process.client) return [];
  
  try {
    const stored = localStorage.getItem('completedEvents');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (err) {
    return [];
  }
}

async function saveCompletedEvents(completedEvents) {
  try {
    // Save to localStorage
    if (process.client) {
      localStorage.setItem('completedEvents', JSON.stringify(completedEvents));
    }
  } catch (err) {
    console.error('Error saving completed events:', err);
  }
}

async function toggleEventComplete(event) {
  const year = event.start_date ? new Date(event.start_date).getFullYear() : null;
  const eventKey = `${year}-${event.competition_name_short}`;
  
  const completedEvents = await loadCompletedEvents();
  const index = completedEvents.indexOf(eventKey);
  
  if (index > -1) {
    completedEvents.splice(index, 1);
    event.is_complete = false;
  } else {
    completedEvents.push(eventKey);
    event.is_complete = true;
  }
  
  await saveCompletedEvents(completedEvents);
}

const filteredEvents = computed(() => {
  if (!events.value) return [];
  if (!searchQuery.value) return events.value;

  const query = searchQuery.value.toLowerCase();
  return events.value.filter(
    (e) =>
      e.competition_name?.toLowerCase().includes(query) ||
      e.competition_name_short?.toLowerCase().includes(query) ||
      e.location?.toLowerCase().includes(query)
  );
});

function formatDate(dateString) {
  if (!dateString) return "Date TBA";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function handleImageError(event) {
  event.target.src =
    "https://qesnrciwmhxfhdaojwwo.supabase.co/storage/v1/object/public/placeholder/competition.png";
}

function formatEventTitle(event) {
  const year = event.start_date
    ? new Date(event.start_date).getFullYear()
    : null;
  const nameShort =
    event.competition_name_short || event.competition_name || "Unknown";

  return year ? `${year} - ${nameShort}` : nameShort;
}

function formatDateRange(startDate, endDate) {
  if (!startDate) return "Date TBA";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  // If start and end are the same day, just show the start date
  if (!end || start.toDateString() === end.toDateString()) {
    return formatDate(startDate);
  }

  // Different dates - show range
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

async function selectEvent(event) {
  selectedEvent.value = event;
  currentStep.value = 2;

  try {
    loadingDivisions.value = true;
    const { data, error: queryError } = await $supabase
      .from("division")
      .select(
        `
        *,
        category!inner(
          category_type:category_type!inner(name_short),
          category_age:category_age!inner(name),
          category_level:category_level!inner(name),
          category_weight:category_weight!inner(name)
        )
      `
      )
      .eq("event_id", event.id)
      .order("order")
      .limit(200);

    if (queryError) throw queryError;

    divisions.value = data.map((d) => ({
      ...d,
      category_name: buildCategoryName(d.category),
    }));

    // Get media counts for each division
    const divisionIds = divisions.value.map(d => d.id);
    if (divisionIds.length > 0) {
      const { data: mediaData } = await $supabase
        .from('media')
        .select('division_id')
        .in('division_id', divisionIds);
      
      // Count media per division
      const counts = {};
      mediaData?.forEach(m => {
        counts[m.division_id] = (counts[m.division_id] || 0) + 1;
      });
      
      divisionsWithMedia.value = counts;
    } else {
      divisionsWithMedia.value = {};
    }
  } catch (err) {
    error.value = err.message;
    console.error("Error loading divisions:", err);
  } finally {
    loadingDivisions.value = false;
  }
}

function buildCategoryName(category) {
  if (!category) return "Unknown Category";

  const parts = [];
  if (category.category_type?.name_short)
    parts.push(category.category_type.name_short);
  if (category.category_age?.name && category.category_age.name !== "Open")
    parts.push(category.category_age.name);
  if (
    category.category_weight?.name &&
    category.category_weight.name !== "Open"
  )
    parts.push(category.category_weight.name);
  if (category.category_level?.name && category.category_level.name !== "Pro")
    parts.push(category.category_level.name);

  return parts.join(" - ") || "Open Category";
}

function getDivisionMediaCountInEvent(divisionId) {
  try {
    if (!divisionsWithMedia || !divisionsWithMedia.value || typeof divisionsWithMedia.value !== 'object') return 0;
    return divisionsWithMedia.value[divisionId] || 0;
  } catch (e) {
    return 0;
  }
}

async function selectDivision(division) {
  selectedDivision.value = division;
  currentStep.value = 3;
}
</script>
