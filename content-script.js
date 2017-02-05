chrome.runtime.onMessage.addListener(function (request) {
  if (request.type === 'result') {
    showResult(request.query)
  }
})

function showResult(result) {
  console.log(result)
  console.log('show result: ' + result)
}
