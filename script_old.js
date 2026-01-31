async function generateIdeas() {
    const platform = document.getElementById('platform').value;
    const niche = document.getElementById('niche').value;
    const contentType = document.getElementById('content-type').value;
    
    // Check if niche is filled
    if (!niche.trim()) {
        alert('Please enter a niche!');
        return;
    }
    
    // Show loading, hide result
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').classList.remove('show');
    document.getElementById('generate-btn').disabled = true;
    
    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                platform: platform,
                niche: niche,
                content_type: contentType
            })
        });
        
        const data = await response.json();
        
        // Hide loading
        document.getElementById('loading').style.display = 'none';
        document.getElementById('generate-btn').disabled = false;
        
        if (data.success) {
            // Show result
            document.getElementById('result').textContent = data.ideas;
            document.getElementById('result').classList.add('show');
        } else {
            alert('Error: ' + data.error);
        }
        
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('generate-btn').disabled = false;
        alert('Error connecting to server: ' + error);
    }
}