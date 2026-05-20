import { ref, watch } from 'vue';

export function useStudents() {
  const students = ref([]);
  const loading = ref(false);
  const backgroundLoading = ref(false);
  const error = ref('');
  const searchTerm = ref('');
  const page = ref(1);
  const limit = 50;
  const hasMore = ref(true);
  const total = ref(0);
  const totalPages = ref(1);

  let searchTimeout = null;

  const fetchChunk = async (pageNum, search = '') => {
    try {
      const url = new URL('/api/students', window.location.origin);
      url.searchParams.append('page', pageNum);
      url.searchParams.append('limit', limit);
      if (search) {
        url.searchParams.append('search', search);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const json = await response.json();

      // Support both old array responses and new { data, total, page, limit, totalPages }
      if (Array.isArray(json)) {
        return { rows: json, meta: { total: json.length, page: pageNum, limit, totalPages: 1 } };
      }

      if (json && json.data) {
        const meta = {
          total: json.total || (json.data ? json.data.length : 0),
          page: json.page || pageNum,
          limit: json.limit || limit,
          totalPages: json.totalPages || 1
        };
        return { rows: json.data || [], meta };
      }

      return { rows: [], meta: { total: 0, page: pageNum, limit, totalPages: 1 } };
    } catch (err) {
      error.value = err.message;
      return { rows: [], meta: { total: 0, page: pageNum, limit, totalPages: 1 } };
    }
  };

  const loadInitial = async () => {
    loading.value = true;
    error.value = '';
    page.value = 1;
    hasMore.value = true;

    const { rows, meta } = await fetchChunk(page.value, searchTerm.value);
    students.value = rows;
    total.value = meta.total;
    totalPages.value = meta.totalPages;

    // Determine hasMore using total when available
    if (meta.total && students.value.length >= meta.total) {
      hasMore.value = false;
    } else if (rows.length < limit) {
      hasMore.value = false;
    }

    loading.value = false;

    // Start background loading if no search is active
    if (hasMore.value && !searchTerm.value) {
      startBackgroundLoading();
    }
  };

  const startBackgroundLoading = async () => {
    if (backgroundLoading.value || !hasMore.value || searchTerm.value) return;

    backgroundLoading.value = true;

    try {
      while (hasMore.value && !searchTerm.value) {
        page.value++;
        const { rows, meta } = await fetchChunk(page.value, '');

        if (rows.length > 0) {
          // Append to the existing array
          students.value = [...students.value, ...rows];
        }

        // Update total info
        total.value = meta.total || total.value;
        totalPages.value = meta.totalPages || totalPages.value;

        if ((meta.total && students.value.length >= meta.total) || rows.length < limit) {
          hasMore.value = false;
        }

        // Small delay to prevent freezing the UI thread completely during massive loads
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } finally {
      backgroundLoading.value = false;
    }
  };

  // Watch for search term changes and debounce
  watch(searchTerm, (newVal) => {
    if (searchTimeout) clearTimeout(searchTimeout);

    // Stop background loading immediately when search starts
    if (newVal) {
      hasMore.value = false;
    }

    searchTimeout = setTimeout(() => {
      loadInitial();
    }, 300); // 300ms debounce
  });

  const addStudent = async (formData) => {
    const response = await fetch('/api/students', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to add student');
    // Reload from start to ensure correct order
    searchTerm.value = '';
    await loadInitial();
    return response;
  };

  const updateStudent = async (id, formData) => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update student');
    // We could optimize by replacing in place, but reloading ensures DB consistency
    searchTerm.value = '';
    await loadInitial();
    return response;
  };

  const deleteStudent = async (id) => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete student');
    // Remove locally for instant feedback, or reload
    students.value = students.value.filter(s => s.id !== id);
    // adjust total count
    if (total.value) total.value = Math.max(0, total.value - 1);
    return response;
  };

  const loadNextPage = async () => {
    if (page.value < totalPages.value) {
      page.value++;
      loading.value = true;
      const { rows, meta } = await fetchChunk(page.value, searchTerm.value);
      students.value = rows;
      total.value = meta.total;
      totalPages.value = meta.totalPages;
      loading.value = false;
    }
  };

  const loadPreviousPage = async () => {
    if (page.value > 1) {
      page.value--;
      loading.value = true;
      const { rows, meta } = await fetchChunk(page.value, searchTerm.value);
      students.value = rows;
      total.value = meta.total;
      totalPages.value = meta.totalPages;
      loading.value = false;
    }
  };

  return {
    students,
    loading,
    backgroundLoading,
    error,
    searchTerm,
    hasMore,
    total,
    totalPages,
    page,
    loadInitial,
    addStudent,
    updateStudent,
    deleteStudent,
    loadNextPage,
    loadPreviousPage
  };
}
