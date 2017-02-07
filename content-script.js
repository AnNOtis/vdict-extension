var cached = {}

document.addEventListener('mouseup', function (event) {
  if (isTargetTip(event)) {
    return
  }
  if (isTriggerSearch()) {
    showTip()
  }
})

document.addEventListener('mousedown', function (event) {
  if (isTargetTip(event)) {
    return
  }
  destroyAnchorAndTip()
})

function isTargetTip(event) {
  return event.target.classList.contains('vd-tip')
}

function isTriggerSearch() {
  var sel = window.getSelection()

  if (sel.isCollapsed || !sel.toString().trim()) {
    return false
  }
  return true
}

function showTip() {
  createAnchorAndTip(window.getSelection())
}

function destroyAnchorAndTip() {
  var el = document.querySelector('.vd-search-anchor')
  if (el) {
    el.remove()
  }
}

function createAnchorAndTip() {
  var selection = window.getSelection()
  var rect = getSelectionRect()
  var el = document.createElement('div')
  el._term_ = selection.toString()
  el._range_ = selection.getRangeAt(0).cloneRange()
  el.appendChild(createTip())
  el.classList.add('vd-search-anchor')
  el.style.display = 'block'
  el.style.top = rect.top + window.scrollY + 'px'
  el.style.left = rect.left + window.scrollX + 'px'
  el.style.width = rect.width + 'px'
  el.style.height = rect.height + 'px'
  document.body.appendChild(el)
}

function getSelectionRect() {
  var selection = window.getSelection()
  if (selection) {
    return selection.getRangeAt(0).getClientRects()[0]
  }
  return null
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
  var term = anchor._term_
  var range = anchor._range_
  var searchId = randomHash()
  var wordWrapper = document.createElement('span')
  wordWrapper.classList.add('vd-word-wrapper')
  range.surroundContents(wordWrapper)

  cached[searchId] = {
    elem: wordWrapper
  }

  if (term) {
    chrome.runtime.sendMessage(null, {type: 'search', term: term, searchId: searchId})
  }
  event.target.style.display = 'none'

  destroyAnchorAndTip()
  return false
}

chrome.runtime.onMessage.addListener(function (request) {
  if (request.type === 'searchResult') {
    handleResult(request.searchId, request.result)
  }
})

function handleResult(searchId, result) {
  var word = cached[searchId].elem
  word.classList.add('is-searched')
  new Drop({
    target: word,
    content: result.word ? `<strong>${result.word}</strong><p>${result.shortDef}</p>` : '<strong>No result</strong>',
    openOn: 'hover',
    classes: 'drop-theme-arrows-bounce'
  }).open()
}

function randomHash() {
  return Math.floor(Math.random() * 16777215).toString(16)
}
