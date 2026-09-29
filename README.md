# CineHub

Interactive catalog of 20 movies and 20 TV series. A student project for the **Web Programming 2** course at the ICT College of Vocational Studies in Belgrade.

**Live demo:** https://minajevtic7523.github.io/CineHub/

## Features
- Movies and series loaded from JSON files (`data/`) with AJAX
- Search, sort (rating, year, title, duration), filter by genre and minimum rating
- Pagination
- "My List" of favorites saved in the browser with localStorage
- Contact form with validation (demo: the message is saved only in your browser)
- Responsive layout for phones, tablets and desktops

## Built with
HTML5, CSS3, JavaScript, jQuery 3.6

## Structure
```
index.html, movies.html, series.html, favorites.html, contact.html, about.html
css/style.css
js/main.js, js/catalog.js, js/form.js
data/movies.json, data/series.json
movies/, series/   (poster images)
```

## Run locally
Open the folder with a local server (for example the VS Code "Live Server" extension), because the JSON files are loaded with AJAX and will not load from `file://`.

## Note
Movie and series posters belong to their respective owners and are used here for educational purposes only.

Author: Mina Jevtić
