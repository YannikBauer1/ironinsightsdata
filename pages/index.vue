<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Media Management System</h1>
      
      <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <button
          @click="$router.push('/media-entry')"
          class="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-left group"
        >
          <div class="flex items-center mb-4">
            <div class="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-gray-900 ml-4">Media Entry</h2>
          </div>
          <p class="text-gray-600 mb-4">Easy creation of entries for media embedments and their tags</p>
          <div class="text-sm text-gray-500">
            ✓ Browse past events<br>
            ✓ Select divisions<br>
            ✓ Add Instagram/YouTube media<br>
            ✓ Tag athletes
          </div>
        </button>

        <button
          disabled
          class="bg-gray-100 rounded-lg shadow p-8 text-left opacity-50 cursor-not-allowed"
        >
          <div class="flex items-center mb-4">
            <div class="bg-gray-200 rounded-lg p-3">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-gray-600 ml-4">Data Correction</h2>
          </div>
          <p class="text-gray-500 mb-4">Easily correcting data mistakes</p>
          <div class="text-sm text-gray-400">
            Coming soon...
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})
</script>