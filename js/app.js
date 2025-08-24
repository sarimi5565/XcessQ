document.addEventListener('DOMContentLoaded', () => {
    // ## GETTING THE NEW ELEMENT ##
    const subtopicFilter = document.getElementById('subtopicFilter');
    
    const questionsContainer = document.getElementById('questions-container');
    const searchInput = document.getElementById('searchInput');
    const courseFilter = document.getElementById('courseFilter');
    const topicFilter = document.getElementById('topicFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const randomBtn = document.getElementById('randomBtn');
    const resetBtn = document.getElementById('resetBtn');

    let allQuestions = [];

    // 1. Fetch data from JSON file
    fetch('data/questions.json')
        .then(response => response.json())
        .then(data => {
            allQuestions = data;
            populateInitialFilters(data);
            displayQuestions(data);
        })
        .catch(error => {
            console.error("Error fetching questions:", error);
            questionsContainer.innerHTML = '<p class="empty">Could not load questions. Please check the data file.</p>';
        });

    // (The displayQuestions function is unchanged)
    function displayQuestions(questions) {
        questionsContainer.innerHTML = '';
        if (questions.length === 0) {
            questionsContainer.innerHTML = '<p class="empty">No questions found. Try a different filter!</p>';
            return;
        }
        
        questions.forEach(q => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="meta">
                    <span>Course: <b>${q.course}</b></span>
                    <span>Difficulty: <b>${q.difficulty}</b></span>
                </div>
                <div class="tags">
                    <span class="tag">${q.topic}</span>
                    <span class="tag">${q.subtopic}</span>
                </div>
                <div class="title">Q${q.id}: ${q.questionText}</div>
                ${q.questionImages.length > 0 ? `<div class="thumb">${q.questionImages.map(img => `<img src="${img}" alt="Question Image">`).join('')}</div>` : ''}
                <div class="actions">
                    <button class="small show-answer-btn">Show Solution</button>
                </div>
                <div class="solution">
                    <p>${q.answerText}</p>
                    ${q.answerImages.map(img => `<img src="${img}" alt="Answer Image">`).join('')}
                    ${q.answerVideo ? `<iframe src="${q.answerVideo}" allowfullscreen></iframe>` : ''}
                </div>
            `;
            const answerBtn = card.querySelector('.show-answer-btn');
            const solutionDiv = card.querySelector('.solution');
            answerBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const isVisible = solutionDiv.classList.toggle('open');
                answerBtn.textContent = isVisible ? 'Hide Solution' : 'Show Solution';
            });
            questionsContainer.appendChild(card);
        });
        MathJax.typeset();
    }
    
    // ## UPDATED TO POPULATE ONLY COURSE AND TOPIC INITIALLY ##
    function populateInitialFilters(questions) {
        const courses = [...new Set(questions.map(q => q.course))].sort();
        const topics = [...new Set(questions.map(q => q.topic))].sort();
        
        courses.forEach(course => courseFilter.innerHTML += `<option value="${course}">${course}</option>`);
        topics.forEach(topic => topicFilter.innerHTML += `<option value="${topic}">${topic}</option>`);
    }

    // ## NEW FUNCTION TO DYNAMICALLY POPULATE SUBTOPICS ##
    function populateSubtopics() {
        const selectedTopic = topicFilter.value;
        subtopicFilter.innerHTML = '<option value="">All Subtopics</option>'; // Reset

        if (selectedTopic) {
            const relevantSubtopics = allQuestions
                .filter(q => q.topic === selectedTopic)
                .map(q => q.subtopic);
            
            const uniqueSubtopics = [...new Set(relevantSubtopics)].sort();
            uniqueSubtopics.forEach(subtopic => {
                subtopicFilter.innerHTML += `<option value="${subtopic}">${subtopic}</option>`;
            });
        }
    }

    // ## UPDATED FILTER LOGIC ##
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCourse = courseFilter.value;
        const selectedTopic = topicFilter.value;
        const selectedSubtopic = subtopicFilter.value; // Get subtopic value
        const selectedDifficulty = difficultyFilter.value;

        const filteredQuestions = allQuestions.filter(q => {
            const matchesSearch = searchTerm === '' || 
                                  q.questionText.toLowerCase().includes(searchTerm) || 
                                  q.topic.toLowerCase().includes(searchTerm) || 
                                  q.subtopic.toLowerCase().includes(searchTerm);
            const matchesCourse = selectedCourse === '' || q.course === selectedCourse;
            const matchesTopic = selectedTopic === '' || q.topic === selectedTopic;
            const matchesSubtopic = selectedSubtopic === '' || q.subtopic === selectedSubtopic; // Add subtopic match
            const matchesDifficulty = selectedDifficulty === '' || q.difficulty === selectedDifficulty;
            
            return matchesSearch && matchesCourse && matchesTopic && matchesSubtopic && matchesDifficulty;
        });
        
        displayQuestions(filteredQuestions);
    }
    
    // (Random question function is unchanged)
    function displayRandomQuestion() {
        if (allQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * allQuestions.length);
            resetFilters();
            displayQuestions([allQuestions[randomIndex]]);
        }
    }

    // ## UPDATED RESET FUNCTION ##
    function resetFilters() {
        searchInput.value = '';
        courseFilter.value = '';
        topicFilter.value = '';
        subtopicFilter.value = ''; // Reset subtopic
        difficultyFilter.value = '';
        populateSubtopics(); // Reset subtopic dropdown content
        displayQuestions(allQuestions);
    }

    // ## UPDATED AND NEW EVENT LISTENERS ##
    topicFilter.addEventListener('change', () => {
        populateSubtopics(); // Update subtopics when a topic is chosen
        applyFilters();      // Then apply all filters
    });

    subtopicFilter.addEventListener('change', applyFilters); // New listener for subtopic

    searchInput.addEventListener('input', applyFilters);
    courseFilter.addEventListener('change', applyFilters);
    difficultyFilter.addEventListener('change', applyFilters);
    randomBtn.addEventListener('click', displayRandomQuestion);
    resetBtn.addEventListener('click', resetFilters);
});