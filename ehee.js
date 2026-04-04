function toggleMenu() {
    let sideMenu = document.getElementById('sideMenu');
    let overlay = document.getElementById('overlay');

    sideMenu.classList.toggle('active');
    overlay.classList.toggle('active');
}

const API_KEY = '4e2b3e8856a14eb296393cda20cddf0b';

const newsSection = document.querySelector('.news-section');

let articles = [];

async function fetchNews() {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`);
    const data = await response.json();
    console.log(data);

    articles = data.articles.splice(0, 8);
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
