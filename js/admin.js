document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('addQuestionForm');
    const existingList = document.getElementById('existingQuestionsList');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyBtn = document.getElementById('copyBtn');

    let questions = [];

    // Load initial data
    fetch('data/questions.json')
        .then(res => res.json())
        .then(data => {
            questions = data;
            renderList();
        });

    function renderList() {
        // Display existing questions
        existingList.innerHTML = '';
        questions.forEach(q => {
            const item = document.createElement('div');
            item.className = 'existing-question';
            item.innerHTML = `<span><b>ID ${q.id}:</b> ${q.questionText.substring(0, 80)}...</span>`;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteQuestion(q.id);
            item.appendChild(deleteBtn);
            existingList.appendChild(item);
        });
        
        // Update the JSON output
        jsonOutput.value = JSON.stringify(questions, null, 2); // Pretty print JSON
    }

    function addQuestion(e) {
        e.preventDefault();
        const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
        
        const newQuestion = {
            id: newId,
            course: document.getElementById('course').value,
            topic: document.getElementById('topic').value,
            subtopic: document.getElementById('subtopic').value,
            difficulty: document.getElementById('difficulty').value,
            questionText: document.getElementById('questionText').value,
            questionImages: document.getElementById('questionImages').value.split(',').map(s => s.trim()).filter(Boolean),
            answerText: document.getElementById('answerText').value,
            answerImages: document.getElementById('answerImages').value.split(',').map(s => s.trim()).filter(Boolean),
            answerVideo: document.getElementById('answerVideo').value,
        };
        
        questions.push(newQuestion);
        renderList();
        addForm.reset();
    }
    
    function deleteQuestion(id) {
        questions = questions.filter(q => q.id !== id);
        renderList();
    }

    addForm.addEventListener('submit', addQuestion);

    copyBtn.addEventListener('click', () => {
        jsonOutput.select();
        document.execCommand('copy');
        alert('JSON copied to clipboard!');
    });
});