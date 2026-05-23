document.addEventListener('DOMContentLoaded', function() {
    const detailTitle = document.getElementById('detail-title');
    const detailImageContainer = document.getElementById('detail-image-container');
    const detailBody = document.getElementById('detail-body');
    const relatedPostsContainer = document.getElementById('related-posts-container');
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    const keyword = keywordFromQuery.replace(/-/g, ' ').trim();
    
    function capitalizeEachWord(str) { 
        if (!str) return ''; 
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
    }
    
    function generateSeoTitle(baseKeyword) { 
        const hookWords = ['Printable', 'Aesthetic', 'Minimalist', 'Boho', 'Modern', 'Abstract', 'Vintage', 'DIY', 'Beautiful', 'Digital']; 
        const suffixWords = ['Wall Art', 'Poster', 'Art Print', 'Digital Download', 'Decor'];
        const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; 
        const randomSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
        return `${randomHook} ${capitalizeEachWord(baseKeyword)} ${randomSuffix}`; 
    }

    function processSpintax(text) {
        const spintaxPattern = /{([^{}]+)}/g;
        while (spintaxPattern.test(text)) {
            text = text.replace(spintaxPattern, (match, choices) => {
                const options = choices.split('|');
                return options[Math.floor(Math.random() * options.length)];
            });
        }
        return text;
    }

    if (!keyword) { 
        detailTitle.textContent = 'Design Not Found'; 
        detailBody.innerHTML = '<p>Sorry, the requested art could not be found. Please return to the <a href="index.html">homepage</a>.</p>'; 
        if (relatedPostsContainer) { 
            relatedPostsContainer.closest('.related-posts-section').style.display = 'none'; 
        } 
        return; 
    }

    function populateMainContent(term) {
        const newTitle = generateSeoTitle(term);
        const capitalizedTermForArticle = capitalizeEachWord(term);
        document.title = `${newTitle} | Home Decor Ideas`;
        detailTitle.textContent = newTitle;

        const queryImage = term + " wall art poster";
        const mainImageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=600&h=900&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
        detailImageContainer.innerHTML = `<img src="${mainImageUrl}" alt="${newTitle}">`;

        const spintaxArticleTemplate = `{Get|Download} this premium <strong>${capitalizedTermForArticle}</strong> printable wall art to {instantly upgrade|beautifully elevate} your room decor.`;

        detailBody.innerHTML = processSpintax(spintaxArticleTemplate);
    }

    // Fungsi Baru untuk mengambil dari keyword.txt secara random
    function generateRelatedPosts(term) {
        // Menggunakan fetch API untuk membaca file keyword.txt
        fetch('keyword.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gagal memuat keyword.txt');
                }
                return response.text();
            })
            .then(text => {
                // Memisahkan teks berdasarkan baris dan membersihkan spasi/baris kosong
                let keywords = text.split('\n')
                                   .map(k => k.trim())
                                   .filter(k => k.length > 0);
                
                // Algoritma Fisher-Yates untuk mengacak urutan array (shuffle)
                for (let i = keywords.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [keywords[i], keywords[j]] = [keywords[j], keywords[i]];
                }
                
                relatedPostsContainer.innerHTML = '';
                const originalKeyword = term.toLowerCase();
                let relatedCount = 0;
                
                // Looping hasil yang sudah diacak dan memfilter hingga dapat 10 item
                for (const kw of keywords) {
                    // Hindari menampilkan keyword yang sama persis dengan halaman saat ini
                    if (kw.toLowerCase() === originalKeyword) continue; 
                    
                    // Batasi hanya 10 keyword untuk related post
                    if (relatedCount >= 10) break; 
                    
                    relatedCount++;
                    
                    const keywordForUrl = kw.replace(/\s/g, '-').toLowerCase();
                    const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                    
                    const queryImage = kw + " wall art poster";
                    const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                    
                    const newRelatedTitle = generateSeoTitle(kw);
                    const card = `<article class="content-card">
                                    <a href="${linkUrl}">
                                        <img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy">
                                        <div class="content-card-body">
                                            <h3>${newRelatedTitle}</h3>
                                        </div>
                                    </a>
                                  </article>`;
                    relatedPostsContainer.innerHTML += card;
                }
                
                // Jika keyword habis atau gagal merender sama sekali sembunyikan section
                if (relatedCount === 0) { 
                    relatedPostsContainer.closest('.related-posts-section').style.display = 'none'; 
                }
            })
            .catch(error => {
                console.error('Error fetching keywords:', error);
                relatedPostsContainer.innerHTML = '<div class="loading-placeholder">Could not load related art.</div>';
            });
    }

    populateMainContent(keyword);
    generateRelatedPosts(keyword);
});
