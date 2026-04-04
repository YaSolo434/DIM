function toggleMenu() {
    let sideMenu = document.getElementById('sideMenu');
    let overlay = document.getElementById('overlay');

    sideMenu.classList.toggle('active');
    overlay.classList.toggle('active');
}

const API_KEY = '4e2b3e8856a14eb296393cda20cddf0b';

const newsSection = document.querySelector('.news-section');


async function fetchNews() {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`);
    const data = await response.json();

    const articles = data.articles.splice(0, 8);
    newsSection.innerHTML = articles.map(article => `
        <div class="news">
            <div class="news-image">
                <img src="${article.urlToImage}" alt="News Image">
            </div>
            <div class="news-content">
                <p class="news-time">${new Date(article.publishedAt).toLocaleDateString()}</p>
                <a href="${article.url}" target="_blank" class="news-description">${article.title}</a>
                <p class="news-tags">${article.author}</p>
            </div>
        </div>
        `).join('');
}

fetchNews();

async function searchBooks() {
    const searchInput = document.getElementById('bookSearchInput');
    const resultsContainer = document.getElementById('bookSearchResults');
    const title = searchInput ? searchInput.value.trim() : '';

    if (!title) {
        resultsContainer.innerHTML = '<span style="color: red; text-align: center;">Məlumat daxil edin! (Please enter a search term)</span>';
        return;
    }

    resultsContainer.innerHTML = '<span style="color: gray; text-align: center;">Yüklənir... (Loading...)</span>';

    try {
        const response = await fetch(`http://localhost:5000/api/books/search-books?title=${encodeURIComponent(title)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.status === 404) {
            resultsContainer.innerHTML = `<span style="color: gray; text-align: center;">${data.message}</span>
            `
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            resultsContainer.innerHTML = `<span style="color: red; text-align: center;">Xəta (Error): ${errorText}</span>`;
            return;
        }


        resultsContainer.innerHTML = data.map(book => `
            <div style="padding: 15px; border: 1px solid #ddd; background: white; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <strong style="font-size: 16px; color: #154a9f;">${book.title}</strong>
                <div style="font-size: 13px; color: #555; margin-top: 8px;">
                    ${book.author ? `Müəllif: ${book.author}` : ''}
                    ${book.published_year ? `<br>İl: ${book.published_year}` : ''}
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching books:', err);
        resultsContainer.innerHTML = '<span style="color: red; text-align: center;">Serverə qoşularkən xəta baş verdi. (Server connection error.)</span>';
    }
}

async function checkAuth() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {

            window.location.href = 'login.html';
            return;
        }


        const user = await response.json();
        console.log('Authenticated User:', user);


        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <span style="display: flex; align-items: center; margin-right: 15px; font-size: 14px; font-weight: bold; color: #154a9f;">
                    Xoş gəldiniz, ${user.first_name} ${user.last_name}
                </span>
                <button onclick="logout()" class="btn-login" style="cursor: pointer; padding: 8px 20px; font-size: 13px; font-weight: bold; border: 2px solid #154a9f; border-radius: 4px;">Çıxış</button>
            `;
        }
    } catch (err) {
        console.error('Error during authentication check', err);
        window.location.href = 'login.html';
    }
}


checkAuth();


async function logout() {
    try {
        await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });


        window.location.href = 'login.html';
    } catch (err) {
        console.error('Error logging out', err);
    }
}
