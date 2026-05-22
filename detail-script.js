document.addEventListener('DOMContentLoaded', function() {
    const detailTitle = document.getElementById('detail-title');
    const detailImageContainer = document.getElementById('detail-image-container');
    const detailBody = document.getElementById('detail-body');
    const relatedPostsContainer = document.getElementById('related-posts-container');
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    const keyword = keywordFromQuery.replace(/-/g, ' ').trim();
    
    function capitalizeEachWord(str) { if (!str) return ''; return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); }
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

    if (!keyword) { detailTitle.textContent = 'Design Not Found'; detailBody.innerHTML = '<p>Sorry, the requested art could not be found. Please return to the <a href="index.html">homepage</a>.</p>'; if (relatedPostsContainer) { relatedPostsContainer.closest('.related-posts-section').style.display = 'none'; } return; }

    function populateMainContent(term) {
        const newTitle = generateSeoTitle(term);
        const capitalizedTermForArticle = capitalizeEachWord(term);
        document.title = `${newTitle} | Home Decor Ideas`;
        detailTitle.textContent = newTitle;

        const queryImage = term + " wall art poster";
        // Gambar utama tetap rasion vertikal Pinterest untuk memudahkan pengunjung melakukan repin
        const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=600&h=900&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
        detailImageContainer.innerHTML = `<img src="${imageUrl}" alt="${newTitle}">`;

        // SPINTAX TEMA WALL ART / DECORATION
        const spintaxArticleTemplate = `
            <p>{Welcome|Hello, decor enthusiasts|Greetings, interior lovers} to our design gallery! {This time|Today|In this post}, we will {explore|share|discover} some {beautiful and inspiring|aesthetic and creative|minimalist and trendy} ideas for <strong>${capitalizedTermForArticle}</strong>.
            {Finding|Discovering} the {right|perfect|ideal} wall art for your space {can sometimes be a challenge|is essential for bringing a room together|requires a bit of creative vision}.
            {That's why|Therefore}, we've {curated|gathered|collected} {a variety of|several} of the {best concepts|most stunning prints} for {you|our lovely readers}.</p>

            <h3>{Key Elements|Main Focus|Crucial Details} of ${capitalizedTermForArticle}</h3>
            <p>To {achieve|create|design} the {best|most aesthetic|most satisfying} look with your <strong>${capitalizedTermForArticle}</strong>, there are {several things|a few key aspects} that {need your attention|you should consider}.
            {From|Whether it's} the {frame selection|choice of paper}, {printing technique|sizing options}, to the {final placement|gallery wall layout}, everything {plays a crucial role|makes a huge difference|contributes significantly}.</p>

            <h4>1. {High-Quality|Premium|Perfect} {Paper Quality|Printing}</h4>
            <p>{The foundation of|The secret to} a great digital download is the print quality.
            For your <strong>${capitalizedTermForArticle}</strong>, {we recommend using|try printing on} {heavyweight matte paper|fine art textured paper|premium cardstock} to {create|achieve} a finish that looks {professional and vibrant|gallery-worthy and elegant|authentic and high-end}.</p>

            <h4>2. {Choosing|Selecting|Finding} The Right Frame</h4>
            <p>{A good frame|The right framing} must {complement the artwork|elevate your poster}.
            {Choose|Select} a frame that {matches your interior style|highlights the colors of} the <strong>${capitalizedTermForArticle}</strong>.
            {For instance|For example}, a {natural oak wood frame|sleek black metal frame|vintage gold ornate frame} can be a {game-changer|stunning addition} to your living room or bedroom.</p>

            <h4>3. {Creating|Designing|Planning} a Gallery Wall</h4>
            <p>{Wall art never has to be lonely|Mixing and matching sizes} {creates a stunning focal point|adds character to blank walls}.
            {Consider combining|Try grouping} your <strong>${capitalizedTermForArticle}</strong> with {typography quotes, abstract shapes, and personal photos|botanical prints and minimalist lines}.</p>

            <h4>4. {Affordable|Budget-Friendly|Smart} Home Decor</h4>
            <p>{Decorating your home doesn't have to be expensive|Printable art is the ultimate DIY hack}. 
            {By choosing digital downloads|With instant download files}, you save on {shipping costs|expensive gallery markups}. 
            Just download your <strong>${capitalizedTermForArticle}</strong>, print it locally or at home, and hang it up!</p>

            <h3>{Conclusion|Final Thoughts|Wrapping It Up}</h3>
            <p>{So there you have it|And that's a wrap}—several {ideas and inspirations|beautiful concepts|tips and tricks} for <strong>${capitalizedTermForArticle}</strong> that {you can try today|will instantly upgrade your space}.
            {Remember, the key is|The most important thing to remember is} {creativity and letting your personality shine|choosing art that makes you happy}.</p>

            <p>{Happy decorating|Enjoy your beautiful home}!</p>
        `;

        detailBody.innerHTML = processSpintax(spintaxArticleTemplate);
    }

    function generateRelatedPosts(term) {
        const script = document.createElement('script');
        script.src = `https://suggestqueries.google.com/complete/search?jsonp=handleRelatedSuggest&hl=en&client=firefox&q=${encodeURIComponent(term)}`;
        document.head.appendChild(script);
        script.onload = () => script.remove();
        script.onerror = () => { relatedPostsContainer.innerHTML = '<div class="loading-placeholder">Could not load related art.</div>'; script.remove(); }
    }

    window.handleRelatedSuggest = function(data) {
        const suggestions = data[1];
        relatedPostsContainer.innerHTML = '';
        if (!suggestions || suggestions.length === 0) { relatedPostsContainer.closest('.related-posts-section').style.display = 'none'; return; }
        const originalKeyword = keyword.toLowerCase();
        let relatedCount = 0;
        suggestions.forEach(relatedTerm => {
            if (relatedTerm.toLowerCase() === originalKeyword || relatedCount >= 10) return;
            relatedCount++;
            const keywordForUrl = relatedTerm.replace(/\s/g, '-').toLowerCase();
            const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
            
            const queryImage = relatedTerm + " wall art poster";
            const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=600&h=900&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
            const newRelatedTitle = generateSeoTitle(relatedTerm);
            const card = `<article class="content-card"><a href="${linkUrl}"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body"><h3>${newRelatedTitle}</h3></div></a></article>`;
            relatedPostsContainer.innerHTML += card;
        });
        if (relatedCount === 0) { relatedPostsContainer.closest('.related-posts-section').style.display = 'none'; }
    };

    populateMainContent(keyword);
    generateRelatedPosts(keyword);
});