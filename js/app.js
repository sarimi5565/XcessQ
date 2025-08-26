document.addEventListener('DOMContentLoaded', () => {
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

    // 2. Display questions
    function displayQuestions(questions) {
        questionsContainer.innerHTML = '';
        if (questions.length === 0) {
            questionsContainer.innerHTML = '<p class="empty">No questions found. Try a different filter!</p>';
            return;
        }
        
        questions.forEach(q => {
            const card = document.createElement('div');
            card.className = 'card';

            // Combine topic, subtopic, and tags for display
            const displayTags = [q.topic, q.subtopic, ...(q.tags || [])].filter(Boolean);

            // Removed the inline style="display: none;" from the solution div
            card.innerHTML = `
                <div class="meta">
                    <span>Course: <b>${q.course}</b></span>
                    <span>Difficulty: <b>${q.difficulty}</b></span>
                </div>
                <div class="tags">
                    ${displayTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
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
            questionsContainer.appendChild(card);
        });

        // Re-run MathJax to render LaTeX
        if (window.MathJax) {
            window.MathJax.typeset();
        }
    }

    // 3. Populate Filters (Unchanged)
    function populateInitialFilters(questions) {
        const courses = [...new Set(questions.map(q => q.course))];
        const topics = [...new Set(questions.map(q => q.topic))];
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseFilter.appendChild(option);
        });

        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicFilter.appendChild(option);
        });

        populateSubtopics();
    }

    function populateSubtopics() {
        const selectedTopic = topicFilter.value;
        subtopicFilter.innerHTML = '<option value="">All Subtopics</option>'; // Reset
        
        if (selectedTopic) {
            const subtopics = [...new Set(allQuestions
                .filter(q => q.topic === selectedTopic)
                .map(q => q.subtopic)
            )];
            subtopics.sort().forEach(sub => { // Added sort for consistency
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                subtopicFilter.appendChild(option);
            });
        }
    }

    // 4. Filter Logic (Unchanged)
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCourse = courseFilter.value;
        const selectedTopic = topicFilter.value;
        const selectedSubtopic = subtopicFilter.value;
        const selectedDifficulty = difficultyFilter.value;

        const filteredQuestions = allQuestions.filter(q => {
            const tagsMatch = q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const matchesSearch = searchTerm === '' ||
                q.questionText.toLowerCase().includes(searchTerm) ||
                q.topic.toLowerCase().includes(searchTerm) ||
                q.subtopic.toLowerCase().includes(searchTerm) ||
                `q${q.id}`.includes(searchTerm) ||
                tagsMatch;

            const matchesCourse = selectedCourse === '' || q.course === selectedCourse;
            const matchesTopic = selectedTopic === '' || q.topic === selectedTopic;
            const matchesSubtopic = selectedSubtopic === '' || q.subtopic === selectedSubtopic;
            const matchesDifficulty = selectedDifficulty === '' || q.difficulty === selectedDifficulty;

            return matchesSearch && matchesCourse && matchesTopic && matchesSubtopic && matchesDifficulty;
        });
        
        displayQuestions(filteredQuestions);
    }
    
    // 5. Random Question (Unchanged)
    function displayRandomQuestion() {
        if (allQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * allQuestions.length);
            resetFilters();
            displayQuestions([allQuestions[randomIndex]]);
        }
    }

    // 6. Reset Filters (Unchanged)
    function resetFilters() {
        searchInput.value = '';
        courseFilter.value = '';
        topicFilter.value = '';
        subtopicFilter.value = '';
        difficultyFilter.value = '';
        populateSubtopics();
        displayQuestions(allQuestions);
    }

    // 7. Event Listeners
    
    // UPDATED Event delegation for "Show Solution" buttons
    questionsContainer.addEventListener('click', (e) => {
        // Check if the clicked element is the button we want
        if (e.target.classList.contains('show-answer-btn')) {
            const card = e.target.closest('.card');
            const solution = card.querySelector('.solution');
            
            // Toggle the visibility class
            solution.classList.toggle('is-visible');

            // Update button text based on whether the class is present
            const isVisible = solution.classList.contains('is-visible');
            e.target.textContent = isVisible ? 'Hide Solution' : 'Show Solution';
        }
    });

    topicFilter.addEventListener('change', () => {
        populateSubtopics();
        applyFilters();
    });

    subtopicFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    courseFilter.addEventListener('change', applyFilters);
    difficultyFilter.addEventListener('change', applyFilters);
    randomBtn.addEventListener('click', displayRandomQuestion);
    resetBtn.addEventListener('click', resetFilters);
});
