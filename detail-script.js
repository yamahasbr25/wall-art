document.addEventListener('DOMContentLoaded', function() {
    const detailTitle = document.getElementById('detail-title');
    const detailImageContainer = document.getElementById('detail-image-container');
    const detailBody = document.getElementById('detail-body');
    const relatedPostsContainer = document.getElementById('related-posts-container');
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    const keyword = keywordFromQuery.replace(/-/g, ' ').trim();
    
    // Set untuk menyimpan keyword yang sudah tampil agar tidak duplikat di related post
    const displayedKeywords = new Set();
    if (keyword) {
        displayedKeywords.add(keyword.toLowerCase());
    }
    
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

    // Fungsi baru untuk mengambil 5 keyword acak dari keyword.txt
    function appendRandomKeywords() {
        fetch('keyword.txt')
            .then(response => response.text())
            .then(data => {
                // Memisahkan teks berdasarkan baris, menghapus spasi kosong, dan memfilter yang sudah tampil
                const keywords = data.split('\n')
                    .map(k => k.trim())
                    .filter(k => k.length > 0 && !displayedKeywords.has(k.toLowerCase()));
                
                if (keywords.length === 0) {
                    checkSectionDisplay();
                    return;
                }
                
                // Mengacak urutan array keyword (Fisher-Yates Shuffle)
                for (let i = keywords.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [keywords[i], keywords[j]] = [keywords[j], keywords[i]];
                }
                
                // Mengambil maksimal 5 keyword teratas yang sudah diacak
                const selectedKeywords = keywords.slice(0, 5);
                
                selectedKeywords.forEach(relatedTerm => {
                    displayedKeywords.add(relatedTerm.toLowerCase());
                    
                    const keywordForUrl = relatedTerm.replace(/\s/g, '-').toLowerCase();
                    const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                    
                    const queryImage = relatedTerm + " wall art poster";
                    const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                    
                    const newRelatedTitle = generateSeoTitle(relatedTerm);
                    const card = `<article class="content-card"><a href="${linkUrl}"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body"><h3>${newRelatedTitle}</h3></div></a></article>`;
                    relatedPostsContainer.innerHTML += card;
                });
                
                checkSectionDisplay();
            })
            .catch(error => {
                console.error('Gagal mengambil keyword.txt:', error);
                checkSectionDisplay();
            });
    }

    // Fungsi untuk memastikan section related posts disembunyikan jika kosong
    function checkSectionDisplay() {
        if (relatedPostsContainer.innerHTML.trim() === '') {
            relatedPostsContainer.closest('.related-posts-section').style.display = 'none';
        } else {
            relatedPostsContainer.closest('.related-posts-section').style.display = 'block';
        }
    }

    function generateRelatedPosts(term) {
        const script = document.createElement('script');
        script.src = `https://suggestqueries.google.com/complete/search?client=youtube&jsonp=handleRelatedSuggest&hl=en&q=${encodeURIComponent(term)}`;
        document.head.appendChild(script);
        script.onload = () => script.remove();
        script.onerror = () => { 
            relatedPostsContainer.innerHTML = ''; 
            script.remove(); 
            // Tetap coba muat dari keyword.txt jika API Google gagal
            appendRandomKeywords();
        }
    }

    window.handleRelatedSuggest = function(data) {
        const suggestions = data[1];
        relatedPostsContainer.innerHTML = '';
        let relatedCount = 0;
        
        if (suggestions && suggestions.length > 0) {
            suggestions.forEach(item => {
                const relatedTerm = typeof item === 'string' ? item : item[0];
                const termLower = relatedTerm ? relatedTerm.toLowerCase() : '';
                
                // BATAS 1: Tampilkan hanya 5, dan hindari duplikat
                if (!termLower || displayedKeywords.has(termLower) || relatedCount >= 5) return;
                
                displayedKeywords.add(termLower);
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
        
        // BATAS 2: Setelah menampilkan maksimal 5 dari Google Suggest, muat lagi 5 random dari keyword.txt
        appendRandomKeywords();
    };

    populateMainContent(keyword);
    generateRelatedPosts(keyword);
});
