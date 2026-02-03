// Parse AI response into individual ideas
function parseIdeas(aiResponse) {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    const ideas = [];
    let currentIdea = null;

    for (const line of lines) {
        // Check if line starts with a number (1., 2., etc.)
        const match = line.match(/^(\d+)[\.\)]\s*(.+)/);
        if (match) {
            if (currentIdea) {
                ideas.push(currentIdea);
            }
            currentIdea = {
                title: match[2].trim(),
                description: ''
            };
        } else if (currentIdea && line.trim()) {
            // Add to description if it's not empty
            currentIdea.description += (currentIdea.description ? ' ' : '') + line.trim();
        }
    }

    if (currentIdea) {
        ideas.push(currentIdea);
    }

    return ideas.map((idea, index) => ({
        id: index + 1,
        title: idea.title,
        description: idea.description || 'Create engaging content around this topic.',
        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
        estimatedTime: ['15-30 min', '30-60 min', '1-2 hours'][Math.floor(Math.random() * 3)],
        tags: generateTags(idea.title)
    }));
}

// Generate relevant tags from title
function generateTags(title) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = title.toLowerCase().split(' ')
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .slice(0, 3);
    
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
}

// Create idea card HTML
function createIdeaCard(idea) {
    const difficultyClass = `difficulty-${idea.difficulty.toLowerCase()}`;
    
    return `
        <div class="idea-card">
            <div class="idea-header">
                <div class="idea-icon">
                    <i data-lucide="lightbulb"></i>
                </div>
                <h3 class="idea-title">${idea.title}</h3>
            </div>
            <p class="idea-description">${idea.description}</p>
            <div class="idea-tags">
                ${idea.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="idea-footer">
                <div class="idea-meta">
                    <div class="meta-item">
                        <i data-lucide="trending-up"></i>
                        <span class="difficulty-badge ${difficultyClass}">${idea.difficulty}</span>
                    </div>
                    <div class="meta-item">
                        <i data-lucide="clock"></i>
                        <span>${idea.estimatedTime}</span>
                    </div>
                </div>
                <button class="copy-btn" onclick="copyIdea(${idea.id})">
                    <i data-lucide="copy"></i>
                    <span>Copy</span>
                </button>
            </div>
        </div>
    `;
}

// Store ideas globally for copy function
let currentIdeas = [];

// Copy idea to clipboard
function copyIdea(ideaId) {
    const idea = currentIdeas.find(i => i.id === ideaId);
    if (!idea) return;

    const text = `${idea.title}\n\n${idea.description}\n\nDifficulty: ${idea.difficulty}\nEstimated Time: ${idea.estimatedTime}\nTags: ${idea.tags.join(', ')}`;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show copied feedback
        const btn = event.target.closest('.copy-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check"></i><span>Copied!</span>';
        lucide.createIcons();
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            lucide.createIcons();
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Main form submission handler
async function generateIdeas() {
    const niche = document.getElementById('niche').value;
    const contentType = document.getElementById('content-type').value;
    const platform = document.getElementById('platform').value;
    const tone = document.getElementById('tone').value;

    if (!niche.trim()) {
        alert('Please enter a topic or niche!');
        return;
    }

    // Show loading, hide other sections
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('generate-btn').disabled = true;
    document.getElementById('btn-text').textContent = 'Generating Ideas...';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                niche: niche,
                content_type: contentType,
                platform: platform,
                tone: tone
            })
        });

        const data = await response.json();

        // Hide loading
        document.getElementById('loading').style.display = 'none';
        document.getElementById('generate-btn').disabled = false;
        document.getElementById('btn-text').textContent = 'Generate Content Ideas';

        if (data.success) {
            // Parse the AI response into individual ideas
            currentIdeas = parseIdeas(data.ideas);
            
            // Show results
            const resultsGrid = document.getElementById('results-grid');
            resultsGrid.innerHTML = currentIdeas.map(idea => createIdeaCard(idea)).join('');
            
            document.getElementById('ideas-count').textContent = currentIdeas.length;
            document.getElementById('results-section').style.display = 'block';
            
            // Re-initialize Lucide icons
            lucide.createIcons();
            
            // Scroll to results
            document.getElementById('results-section').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } else {
            alert('Error: ' + data.error);
            document.getElementById('empty-state').style.display = 'block';
        }

    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('generate-btn').disabled = false;
        document.getElementById('btn-text').textContent = 'Generate Content Ideas';
        document.getElementById('empty-state').style.display = 'block';
        alert('Error connecting to server: ' + error);
    }
}

// Form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('generator-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        generateIdeas();
    });
});