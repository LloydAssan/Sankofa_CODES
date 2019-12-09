// const answerBtn = document.querySelector('.answerBtn');
// const question = document.querySelector('.question').innerHTML;
//
// answerBtn.addEventListener('click', () => {
//   const answer = document.querySelector('.answer').value;
//
//   fetch('/answer', {
//     method: 'put',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       answer: answer,
//       question: question
//     })
//   })
//   .then((response) => {
//     if(response.ok) return response.json()
//   })
//   .then(data => {
//     console.log(data)
//     window.location.reload(true)
//   })
//   .catch(err => console.log(err))
// })
