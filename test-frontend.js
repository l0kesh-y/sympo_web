// Simulate the API call that the frontend makes
fetch('/api/bid/my-questions', {
    method: 'GET',
    credentials: 'include' // Include cookies/session
})
.then(response => {
    console.log('Response status:', response.status);
    return response.json();
})
.then(data => {
    console.log('API Response:', data);
})
.catch(error => {
    console.error('API Error:', error);
});