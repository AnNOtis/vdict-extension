var cachedAnchor = {}

document.addEventListener('mouseup', function () {
  var selection = checkSelection()
  var selectionRect = getSelectionRect(selection)
  if (selectionRect) {
    createSearchAnchor(selectionRect, randomHash(), selection.toString())
  }
})

chrome.runtime.onMessage.addListener(function (request) {
  if (request.type === 'startSearch') {
    loadingResult(request.anchorId)
  } else if (request.type === 'result') {
    handleResult(request.anchorId, request.query)
  }
})

function loadingResult(anchorId) {
  // var wrappedElem = document.createElement('span')
  // wrappedElem.classList.add(`vd-search-${anchorId}`, 'vd-searched')
  // surroundSelection(wrappedElem)
  //
  // var cached = (cachedAnchor[anchorId] = cachedAnchor[anchorId] || {})
  // cached.elem = wrappedElem
}

function handleResult(anchorId, result) {
  var anchor = getAnchor(anchorId)
  anchor.classList.add('vd-searched')
  new Drop({
    target: anchor,
    content: result.word ? `<strong>${result.word}</strong><p>${result.shortDef}</p>` : '<strong>No result</strong>',
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

function getSelectionRect(selection) {
  if (selection) {
    return selection.getRangeAt(0).getClientRects()[0]
  }
  return null
}

function checkSelection() {
  var selection = window.getSelection()
  if (selection.isCollapsed) {
    return null
  }
  return selection
}

function createSearchAnchor(rect, anchorId, term) {
  var el = document.createElement('div')
  el.tip = createTip()
  el.appendChild(el.tip)
  el.classList.add('vd-search-anchor')
  el.classList.add(`vd-anchor-${anchorId}`)
  el.setAttribute('term', term)
  el.setAttribute('data-anchor-id', anchorId)
  document.body.appendChild(el)
  el.tip.style.display = 'block'
  el.style.display = 'block'
  el.style.top = rect.top + window.scrollY + 'px'
  el.style.left = rect.left + window.scrollX + 'px'
  el.style.width = rect.width + 'px'
  el.style.height = rect.height + 'px'

  cacheAnchor(anchorId, el)
}

function cacheAnchor(anchorId, anchor) {
  var cached = (cachedAnchor[anchorId] = cachedAnchor[anchorId] || {})
  cached.anchor = anchor
}

function createTip() {
  var tip = document.createElement('div')
  tip.classList.add('vd-tip')
  tip.style.backgroundImage = `url("${chrome.extension.getURL('images/icon@2x.png')}")`
  tip.addEventListener('click', onTipClick)

  return tip
}

function onTipClick(event) {
  var anchor = event.target.parentNode
  var term = anchor.getAttribute('term')
  var anchorId = anchor.getAttribute('data-anchor-id')
  if (term) {
    chrome.runtime.sendMessage(null, {type: 'getSelection', value: term, anchorId})
  }
  event.target.style.display = 'none'

  return false
}

function randomHash() {
  return Math.floor(Math.random() * 16777215).toString(16)
}

function getAnchor(anchorId) {
  return (cachedAnchor[anchorId] || {}).anchor
}
