document.addEventListener('DOMContentLoaded', function() {
    // Show/Hide Ask Question Form
    function showAskQuestionForm() {
        document.getElementById('askQuestionForm').classList.remove('hidden');
    }

    function hideAskQuestionForm() {
        document.getElementById('askQuestionForm').classList.add('hidden');
    }

    // Filter Tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // Add filtering logic here
        });
    });

    // Search Functionality
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', function() {
        // Add search logic here
    });

    // Question Form Submission
    const questionForm = document.querySelector('.question-form');
    if (questionForm) {
        questionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add form submission logic here
            hideAskQuestionForm();
        });
    }

    // Make functions globally available
    window.showAskQuestionForm = showAskQuestionForm;
    window.hideAskQuestionForm = hideAskQuestionForm;
}); 