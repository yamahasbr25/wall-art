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
            // Jika API Suggest error (misal diblokir adblock), jalankan fallback array kosong
            window.handleRelatedSuggest([term, []]); 
            script.remove(); 
        };
    }

    window.handleRelatedSuggest = function(data) {
        // Mencegah error jika data [1] kosong dari Google
        const suggestions = (data && data[1]) ? data[1] : [];
        const originalKeyword = keyword.toLowerCase();
        
        let suggestHtml = '';
        let relatedCount = 0;
        
        // 1. Kumpulkan maksimal 5 postingan dari Google Suggest
        if (suggestions.length > 0) {
            suggestions.forEach(item => {
                const relatedTerm = typeof item === 'string' ? item : item[0];
                if (!relatedTerm || relatedTerm.toLowerCase() === originalKeyword || relatedCount >= 5) return;
                relatedCount++;
                
                const keywordForUrl = relatedTerm.replace(/\s/g, '-').toLowerCase();
                const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                
                const queryImage = relatedTerm + " wall art poster";
                const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                
                const newRelatedTitle = generateSeoTitle(relatedTerm);
                suggestHtml += `<article class="content-card"><a href="${linkUrl}"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body"><h3>${newRelatedTitle}</h3></div></a></article>`;
            });
        }
        
        // Render / masukkan hasil suggest pertama ke wadah
        relatedPostsContainer.innerHTML = suggestHtml;
        
        // 2. Fetch maksimal 5 postingan random dari keyword.txt
        fetch('keyword.txt')
            .then(response => response.text())
            .then(text => {
                let keywordsArray = text.split('\n')
                    .map(k => k.trim())
                    .filter(k => k.length > 0 && k.toLowerCase() !== originalKeyword);
                
                // Acak urutan array
                for (let i = keywordsArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [keywordsArray[i], keywordsArray[j]] = [keywordsArray[j], keywordsArray[i]];
                }
                
                const randomKeywords = keywordsArray.slice(0, 5);
                let txtHtml = '';
                
                randomKeywords.forEach(relatedTerm => {
                    const keywordForUrl = relatedTerm.replace(/\s/g, '-').toLowerCase();
                    const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                    
                    const queryImage = relatedTerm + " wall art poster";
                    const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                    
                    const newRelatedTitle = generateSeoTitle(relatedTerm);
                    txtHtml += `<article class="content-card"><a href="${linkUrl}"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body"><h3>${newRelatedTitle}</h3></div></a></article>`;
                });

                // Insert hasil dari txt ke sebelah bawah (append) TANPA menghapus hasil suggest
                if (txtHtml !== '') {
                    relatedPostsContainer.insertAdjacentHTML('beforeend', txtHtml);
                }

                // Cek apakah wadah memiliki isi. Jika kosong sama sekali, sembunyikan section
                if (relatedPostsContainer.innerHTML.trim() === '') {
                    relatedPostsContainer.closest('.related-posts-section').style.display = 'none';
                } else {
                    relatedPostsContainer.closest('.related-posts-section').style.display = 'block';
                }
            })
            .catch(err => {
                console.error("Gagal mengambil keyword.txt:", err);
                if (relatedPostsContainer.innerHTML.trim() === '') {
                    relatedPostsContainer.closest('.related-posts-section').style.display = 'none';
                } else {
                    relatedPostsContainer.closest('.related-posts-section').style.display = 'block';
                }
            });
    };

    populateMainContent(keyword);
    generateRelatedPosts(keyword);
});
