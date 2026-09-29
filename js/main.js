const ITEMS_PER_PAGE = 6;

const DATA_URLS = {
  movies: 'data/movies.json',
  series: 'data/series.json'
};

const LS_KEYS = {
  favMovies:  'cineHub_favMovies',
  favSeries:  'cineHub_favSeries',
  lastSearch: 'cineHub_lastSearch'
};


function lsSave(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

function lsLoad(key) {
  try {
    const val = localStorage.getItem(key);
    return val != null ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
}

function lsRemove(key) {
  localStorage.removeItem(key);
}


let favMoviesList = lsLoad(LS_KEYS.favMovies) || [];
let favSeriesList = lsLoad(LS_KEYS.favSeries) || [];

function isFavorite(id, type) {
  const list = (type === 'series') ? favSeriesList : favMoviesList;
  for (let i = 0; i < list.length; i++) {
    if (list[i] == id) return true;
  }
  return false;
}

function toggleFavorite(id, type) {
  const list = (type === 'series') ? favSeriesList : favMoviesList;
  const key  = (type === 'series') ? LS_KEYS.favSeries : LS_KEYS.favMovies;

  if (isFavorite(id, type)) {
    const newList = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i] != id) newList.push(list[i]);
    }
    if (type === 'series') favSeriesList = newList;
    else favMoviesList = newList;
    lsSave(key, newList);
    return false;
  } else {
    list.push(Number(id));
    lsSave(key, list);
    return true;
  }
}


function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('sr-RS', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch (e) {
    return dateStr || 'N/A';
  }
}

function formatDuration(min) {
  if (!min || isNaN(min)) return 'N/A';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m < 10 ? '0' + m : m}m` : `${m}m`;
}

function truncateText(text, max) {
  if (!text) return '';
  return text.length > max ? text.substring(0, max) + '...' : text;
}

function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return Math.floor(num / 1000) + 'K';
  return String(num);
}


function showToast(msg, type) {
  if (!type) type = 'info';
  let icon = 'i';
  if (type === 'success') icon = '✓';
  else if (type === 'error') icon = '✕';
  else if (type === 'warning') icon = '⚠';

  const $toast = $(`<div class="toast toast-${type}">
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${msg}</span>
  </div>`);

  $('#toast-container').append($toast);
  setTimeout(function () {
    $toast.addClass('fadeOut');
    setTimeout(function () { $toast.remove(); }, 350);
  }, 3500);
}


$(document).ready(function () {

  let currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $('.nav-links a').each(function () {
    if ($(this).attr('href') === currentPage) $(this).addClass('active');
  });

  $('#navHamburger').on('click', function () {
    $('#navLinks').toggleClass('open');
  });

  $('#navLinks a').on('click', function () {
    $('#navLinks').removeClass('open');
  });

  const $scrollBtn = $(`<button class="scroll-top-btn" id="scrollTopBtn" aria-label="Back to top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  </button>`);
  $('body').append($scrollBtn);

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 300) $scrollBtn.addClass('visible');
    else $scrollBtn.removeClass('visible');
  });

  $scrollBtn.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 380);
  });

  const totalFav = (lsLoad(LS_KEYS.favMovies) || []).length + (lsLoad(LS_KEYS.favSeries) || []).length;
  if (totalFav > 0) {
    $('#navFavBadge').text(totalFav).addClass('visible');
  }

});
