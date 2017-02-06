var dropdownCached = {}

chrome.runtime.onMessage.addListener(function (request) {
  if (request.type === 'startSearch') {
    loadingResult(request.resultId)
  } else if (request.type === 'result') {
    showResult(request.resultId, request.query)
  }
})

function loadingResult(resultId) {
  var wrappedElem = document.createElement('span')
  wrappedElem.classList.add(`vd-search-${resultId}`, 'vd-searched')
  surroundSelection(wrappedElem)

  var cached = (dropdownCached[resultId] = dropdownCached[resultId] || {})
  cached.elem = wrappedElem
}

function showResult(resultId, result) {
  var cached = dropdownCached[resultId]
  var dropdown = new Drop({
    target: cached.elem,
    content: result.shortDef,
    openOn: 'hover',
    classes: 'drop-theme-arrows-bounce'
  }).open()
}

function surroundSelection(element) {
  if (window.getSelection) {
    var sel = window.getSelection()
    if (sel.rangeCount) {
      var range = sel.getRangeAt(0).cloneRange()
      range.surroundContents(element)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }
}
