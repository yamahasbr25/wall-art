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

    function generateRelatedPosts(term) {
        const script = document.createElement('script');
        script.src = `https://suggestqueries.google.com/complete/search?client=youtube&jsonp=handleRelatedSuggest&hl=en&q=${encodeURIComponent(term)}`;
        document.head.appendChild(script);
        script.onload = () => script.remove();
        script.onerror = () => { 
            // Ubah error handling untuk memicu fetch keyword manual jika suggest error
            window.handleRelatedSuggest([term, []]); 
            script.remove(); 
        }
    }

    // Fungsi handleRelatedSuggest yang sudah dimodifikasi
    window.handleRelatedSuggest = function(data) {
        const suggestions = data[1];
        relatedPostsContainer.innerHTML = '';
        
        const originalKeyword = keyword.toLowerCase();
        let relatedCount = 0;
        
        // 1. Render maksimal 5 postingan dari Google Suggest
        if (suggestions && suggestions.length > 0) {
            suggestions.forEach(item => {
                const relatedTerm = typeof item === 'string' ? item : item[0];
                
                if (!relatedTerm || relatedTerm.toLowerCase() === originalKeyword || relatedCount >= 5) return;
                relatedCount++;
                
                const keywordForUrl = relatedTerm.replace(/\s/g, '-').toLowerCase();
                const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                
                const queryImage = relatedTerm + " wall art poster";
                const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                
                const newRelatedTitle = generateSeoTitle(relatedTerm);
                const card = `<article class="content-card"><a href="${linkUrl}"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body"><h3>${newRelatedTitle}</h3></div></a></article>`;
                relatedPostsContainer.innerHTML += card;
            });
        }
        
        // 2. Render maksimal 5 postingan random dari keyword.txt
        fetch('keyword.txt')
            .then(response => response.text())
            .then(text => {
                // Ekstrak keyword, hilangkan baris kosong, dan pastikan tidak sama dengan keyword utama
                let keywordsArray = text.split('\n')
                    .map(k => k.trim())
                    .filter(k => k.length > 0 && k.toLowerCase() !== originalKeyword);
                
                // Acak array dengan Fisher-Yates Shuffle
                for (let i = keywordsArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [keywordsArray[i], keywordsArray[j]] = [keywordsArray[j], keywordsArray[i]];
                }
                
                // Ambil 5 keyword pertama dari hasil acakan
                const randomKeywords = keywordsArray.slice(0, 5);
                
                // Render kartu untuk tiap keyword random
                randomKeywords.forEach(relatedTerm => {
                    const keywordForUrl = relatedTerm.replace(/\s/g, '-').toLowerCase();
                    const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                    
                    const queryImage = relatedTerm + " wall art poster";
                    const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                    
                    const newRelatedTitle = generateSeoTitle(relatedTerm);
                    const card = `<article class="content-card"><a href="${linkUrl}"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body"><h3>${newRelatedTitle}</h3></div></a></article>`;
                    relatedPostsContainer.innerHTML += card;
                });

                // Tampilkan atau sembunyikan section jika tidak ada post sama sekali
                if (relatedPostsContainer.innerHTML.trim() === '') {
                    relatedPostsContainer.closest('.related-posts-section').style.display = 'none';
                } else {
                    relatedPostsContainer.closest('.related-posts-section').style.display = 'block';
                }
            })
            .catch(err => {
                console.error("Gagal mengambil keyword dari keyword.txt:", err);
                // Jika keyword.txt gagal diload dan suggest juga kosong, sembunyikan section
                if (relatedCount === 0) {
                    relatedPostsContainer.closest('.related-posts-section').style.display = 'none';
                } else {
                    relatedPostsContainer.closest('.related-posts-section').style.display = 'block';
                }
            });
    };

    populateMainContent(keyword);
    generateRelatedPosts(keyword);
});
