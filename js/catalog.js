let allItems = [];
let filtered = [];
let currentPage = 1;
let contentType = 'movie';


const genreColors = {
  'Drama':     'linear-gradient(150deg, #1e3a8a 0%, #3b82f6 100%)',
  'Crime':     'linear-gradient(150deg, #1c1917 0%, #44403c 100%)',
  'Thriller':  'linear-gradient(150deg, #134e4a 0%, #0d9488 100%)',
  'Action':    'linear-gradient(150deg, #7c2d12 0%, #ea580c 100%)',
  'Adventure': 'linear-gradient(150deg, #14532d 0%, #16a34a 100%)',
  'Comedy':    'linear-gradient(150deg, #78350f 0%, #d97706 100%)',
  'Fantasy':   'linear-gradient(150deg, #4c1d95 0%, #7c3aed 100%)',
  'Sci-Fi':    'linear-gradient(150deg, #0c4a6e 0%, #0284c7 100%)',
  'Horror':    'linear-gradient(150deg, #7f1d1d 0%, #dc2626 100%)',
  'Mystery':   'linear-gradient(150deg, #3b0764 0%, #9333ea 100%)',
  'Romance':   'linear-gradient(150deg, #831843 0%, #db2777 100%)',
  'War':       'linear-gradient(150deg, #292524 0%, #78716c 100%)',
  'History':   'linear-gradient(150deg, #431407 0%, #92400e 100%)',
  'Biography': 'linear-gradient(150deg, #1e3a5f 0%, #1d4ed8 100%)'
};

function getGradient(item) {
  const g = item.genre && item.genre[0] ? item.genre[0] : '';
  return genreColors[g] || 'linear-gradient(150deg, #1e293b 0%, #334155 100%)';
}

function getInitials(title) {
  const words = title.trim().split(' ');
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return title.substring(0, 2).toUpperCase();
}


function loadData(url, type) {
  contentType = type;
  $('#catalogGrid').html(`<div class="loading-spinner" style="grid-column:1/-1">
    <div class="spinner"></div>
    <p class="loading-text">Loading...</p>
  </div>`);

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    success: function (res) {
      try {
        const key = (type === 'series') ? 'series' : 'movies';
        if (!res[key] || !Array.isArray(res[key])) throw new Error('Invalid JSON format');

        allItems = res[key];
        filtered = allItems.slice();
        currentPage = 1;

        populateGenres();

        const lastSearch = lsLoad(LS_KEYS.lastSearch);
        if (lastSearch) $('#searchInput').val(lastSearch);

        renderPage();
      } catch (e) {
        showError('Error processing data: ' + e.message);
        showToast('Error loading data.', 'error');
      }
    },
    error: function (xhr, status) {
      showError('Data could not be loaded. Please try again.');
      showToast('Error: data not loaded (' + status + ').', 'error');
    }
  });
}


function sortItems(field, order) {
  filtered.sort(function (a, b) {
    let vA, vB;
    if (field === 'rating') {
      vA = a.rating ? a.rating.imdb : 0;
      vB = b.rating ? b.rating.imdb : 0;
    } else if (field === 'year') {
      vA = a.year || 0;
      vB = b.year || 0;
    } else if (field === 'title') {
      return order === 'asc'
        ? a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        : b.title.toLowerCase().localeCompare(a.title.toLowerCase());
    } else if (field === 'duration') {
      vA = a.duration || a.episodeDuration || 0;
      vB = b.duration || b.episodeDuration || 0;
    } else {
      return 0;
    }
    return order === 'asc' ? vA - vB : vB - vA;
  });
  currentPage = 1;
  renderPage();
}


function filterItems(genres, ratingMin, search) {
  filtered = [];

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    let ok = true;

    if (genres && genres.length > 0) {
      for (let g = 0; g < genres.length; g++) {
        if (item.genre.indexOf(genres[g]) === -1) { ok = false; break; }
      }
    }

    if ((item.rating ? item.rating.imdb : 0) < ratingMin) ok = false;

    if (ok && search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      const inTitle = item.title.toLowerCase().indexOf(q) !== -1;
      const inDir   = (item.director || item.creator || '').toLowerCase().indexOf(q) !== -1;
      let inTags = false;
      if (item.tags) {
        for (let t = 0; t < item.tags.length; t++) {
          if (item.tags[t].toLowerCase().indexOf(q) !== -1) { inTags = true; break; }
        }
      }
      if (!inTitle && !inDir && !inTags) ok = false;
    }

    if (ok) filtered.push(item);
  }

  if (search !== undefined) lsSave(LS_KEYS.lastSearch, search || '');

  currentPage = 1;
  sortItems($('#sortField').val() || 'rating', $('#sortOrder').val() || 'desc');
}


function renderPage() {
  const $grid = $('#catalogGrid');
  const end    = currentPage * ITEMS_PER_PAGE;
  const items  = filtered.slice(0, end);
  const shown  = Math.min(end, filtered.length);

  $('#resultsInfo').html(`Showing <strong>${shown}</strong> of <strong>${filtered.length}</strong> results`);

  if (items.length === 0) {
    $grid.html(`<div class="no-results" style="grid-column:1/-1">
      <div class="no-results-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></div>
      <p>No results found.</p>
      <p style="font-size:0.85rem;margin-top:8px">Try adjusting your filters or search.</p>
    </div>`);
    $('#loadMoreBtn').hide();
    return;
  }

  let html = '';
  for (let i = 0; i < items.length; i++) html += buildCard(items[i]);
  $grid.html(html);

  if (end >= filtered.length) {
    $('#loadMoreBtn').hide();
    $('#loadMoreInfo').text('Showing all ' + filtered.length + ' results.');
  } else {
    $('#loadMoreBtn').show();
    $('#loadMoreInfo').text('Showing ' + shown + ' of ' + filtered.length);
  }
}


function buildCard(item) {
  const rating   = item.rating ? item.rating.imdb : null;
  const isFav    = isFavorite(item.id, contentType);
  const gradient = getGradient(item);

  let genresHtml = '';
  for (let i = 0; i < item.genre.length && i < 2; i++) {
    genresHtml += `<span class="genre-tag">${item.genre[i]}</span>`;
  }

  const imgTag = item.imgPath
    ? `<img class="card-poster" src="${item.imgPath}" alt="${item.title}" loading="lazy"
        onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex';">`
    : '';

  return `<div class="card" data-id="${item.id}">
    <div class="card-poster-wrapper">
      ${imgTag}
      <div class="card-poster-placeholder" style="${item.imgPath ? 'display:none;' : ''}background:${gradient}">
        <div class="placeholder-initials">${getInitials(item.title)}</div>
        <div class="poster-title">${truncateText(item.title, 22)}</div>
      </div>
      <div class="card-poster-overlay">
        <button class="btn btn-sm btn-primary btn-details" data-id="${item.id}">Details</button>
        <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${item.id}" title="Favorites">${isFav ? '♥' : '♡'}</button>
      </div>
    </div>
    <div class="card-body">
      <div class="card-title" title="${item.title}">${truncateText(item.title, 28)}</div>
      <div class="card-meta">
        <span class="card-year">${item.year}</span>
        <span class="card-rating">★ ${rating ? rating.toFixed(1) : 'N/A'}</span>
      </div>
      <div class="card-genres">${genresHtml}</div>
    </div>
  </div>`;
}


function openModal(id) {
  let item = null;
  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].id == id) { item = allItems[i]; break; }
  }
  if (!item) return;

  const rating   = item.rating || {};
  const director = item.director || item.creator || 'N/A';
  const gradient = getGradient(item);

  let duration = '';
  if (item.duration) duration = formatDuration(item.duration);
  else if (item.seasons) duration = `${item.seasons} seasons / ${item.episodes} ep.`;
  else duration = 'N/A';

  let castHtml = '';
  if (item.cast && item.cast.length > 0) {
    for (let c = 0; c < item.cast.length; c++) {
      castHtml += `<div class="cast-item">
        <div class="cast-name">${item.cast[c].name}</div>
        <div class="cast-role">${item.cast[c].role}</div>
      </div>`;
    }
  }

  let tagsHtml = '';
  if (item.tags && item.tags.length > 0) {
    for (let t = 0; t < item.tags.length; t++) {
      tagsHtml += `<span class="genre-tag">${item.tags[t]}</span>`;
    }
  }

  const imgTag = item.imgPath
    ? `<img src="${item.imgPath}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;display:block;"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">`
    : '';

  $('#modalTitle').text(item.title);
  $('#modalBody').html(`<div class="modal-movie">
    <div class="modal-poster">
      ${imgTag}
      <div style="${item.imgPath ? 'display:none;' : ''}width:100%;height:100%;border-radius:10px;background:${gradient};display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:800;color:rgba(255,255,255,0.9);">${getInitials(item.title)}</div>
    </div>
    <div class="modal-info">
      <h2>${item.title}</h2>
      <div class="modal-meta-row">
        <span class="modal-badge badge-year">${item.year}</span>
        <span class="modal-badge badge-lang">${item.language}</span>
        <span class="modal-badge badge-status">${item.status}</span>
      </div>
      <p class="modal-description">${item.description}</p>
      <div class="modal-detail-row"><span class="detail-label">Duration:</span><span class="detail-value">${duration}</span></div>
      <div class="modal-detail-row"><span class="detail-label">Genre:</span><span class="detail-value">${item.genre.join(', ')}</span></div>
      <div class="modal-detail-row"><span class="detail-label">Director:</span><span class="detail-value">${director}</span></div>
      <div class="modal-detail-row"><span class="detail-label">IMDb:</span><span class="detail-value">★ ${rating.imdb ? rating.imdb.toFixed(1) : 'N/A'} (${formatNumber(rating.votes || 0)} votes)</span></div>
      <div class="modal-detail-row"><span class="detail-label">Added:</span><span class="detail-value">${formatDate(item.addedDate)}</span></div>
      ${castHtml ? `<div class="modal-cast"><h4>Cast</h4><div class="cast-list">${castHtml}</div></div>` : ''}
      ${tagsHtml ? `<div class="card-genres" style="margin-top:14px">${tagsHtml}</div>` : ''}
    </div>
  </div>`);

  $('#itemModal').addClass('open');
  $('body').css('overflow', 'hidden');
}


function populateGenres() {
  const $list = $('#genreFilterList');
  if (!$list.length) return;

  const genres = [];
  for (let i = 0; i < allItems.length; i++) {
    for (let j = 0; j < allItems[i].genre.length; j++) {
      const g = allItems[i].genre[j];
      if (genres.indexOf(g) === -1) genres.push(g);
    }
  }
  genres.sort();

  let html = '';
  for (let k = 0; k < genres.length; k++) {
    html += `<label class="checkbox-item">
      <input type="checkbox" name="genre" value="${genres[k]}"> ${genres[k]}
    </label>`;
  }
  $list.html(html);
}


function showError(msg) {
  $('#catalogGrid').html(`<div class="no-results" style="grid-column:1/-1">
    <div class="no-results-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg></div>
    <p>${msg}</p>
  </div>`);
}


function initCatalogPage(dataUrl, type) {

  loadData(dataUrl, type);

  $('#sortField, #sortOrder').on('change', function () {
    sortItems($('#sortField').val(), $('#sortOrder').val());
  });

  let searchTimer;
  $('#searchInput').on('input', function () {
    clearTimeout(searchTimer);
    const val = $(this).val();
    searchTimer = setTimeout(function () {
      const genres = [];
      $('#genreFilterList input:checked').each(function () { genres.push($(this).val()); });
      filterItems(genres, parseFloat($('#ratingMinFilter').val()) || 0, val);
    }, 350);
  });

  $('#filterToggleBtn').on('click', function () {
    $('#filterPanel').toggleClass('open');
    $(this).text($('#filterPanel').hasClass('open') ? 'Hide filters ▲' : 'Show filters ▼');
  });

  $('#applyFiltersBtn').on('click', function () {
    const genres = [];
    $('#genreFilterList input:checked').each(function () { genres.push($(this).val()); });
    const ratingMin = parseFloat($('#ratingMinFilter').val());
    try {
      if (ratingMin < 0 || ratingMin > 10) throw new Error('Rating must be between 0 and 10!');
      filterItems(genres, ratingMin, $('#searchInput').val());
      showToast('Filters applied.', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  });

  $('#resetFiltersBtn').on('click', function () {
    $('#genreFilterList input').prop('checked', false);
    $('#ratingMinFilter').val(0).next('.range-display').text('0');
    $('#searchInput').val('');
    lsRemove(LS_KEYS.lastSearch);
    filterItems([], 0, '');
    showToast('Filters reset.', 'info');
  });

  $('input[type="range"]').on('input', function () {
    $(this).next('.range-display').text($(this).val());
  });

  $('#loadMoreBtn').on('click', function () {
    currentPage++;
    renderPage();
    showToast('More items loaded.', 'info');
  });

  $('#catalogGrid').on('click', '.btn-details', function () {
    openModal($(this).data('id'));
  });

  $('#catalogGrid').on('click', '.btn-fav', function () {
    const id    = $(this).data('id');
    const added = toggleFavorite(id, contentType);
    if (added) {
      $(this).addClass('active').text('♥');
      showToast('Added to favorites!', 'success');
    } else {
      $(this).removeClass('active').text('♡');
      showToast('Removed from favorites.', 'info');
    }
  });

  $('#modalClose').on('click', function () {
    $('#itemModal').removeClass('open');
    $('body').css('overflow', '');
  });

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      $('#itemModal').removeClass('open');
      $('body').css('overflow', '');
    }
  });
}
