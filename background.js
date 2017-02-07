// chrome.contextMenus.create({title: 'V-Dict', onclick: handleSearch, contexts: ['selection']})
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'search') {
    handleSearch(message.searchId, message.term, sender)
  }
})

function handleSearch(searchId, term, sender) {
  var tab = sender.tab

  startSearch(tab, searchId)

  searchDict(term)
    .then(parseResult)
    .then(sendResult(tab, searchId))
}

function startSearch(tab, searchId) {
  chrome.tabs.sendMessage(tab.id, {type: 'startSearch', searchId: searchId})
}

function searchDict(term) {
  if (!term) {
    return
  }

  return fetch(`https://www.vocabulary.com/dictionary/definition.ajax?search=${term}&lang=en`)
    .then(response => response.text())
}

function parseResult(resultHTML) {
  var el = document.createElement('html')
  el.innerHTML = resultHTML

  if (el.querySelector('.noresults')) {
    return {}
  }

  var wordElem = el.querySelector('.centeredContent h1.dynamictext')
  var defEl = el.querySelector('.definitionsContainer')
  var shortDef = defEl.querySelector('.main .section .short')
  var longDef = defEl.querySelector('.main .section .long')
  var meanings = parseMeanings(defEl)

  return {
    word: (wordElem && wordElem.innerHTML) || '',
    shortDef: (shortDef && shortDef.innerHTML) || '',
    longDef: (longDef && longDef.innerHTML) || '',
    meanings
  }
}

function parseMeanings(raw) {
  return Array.from(
    raw.querySelectorAll('.main .definitions .definition .group'),
    item =>
      Array.from(item.querySelectorAll('.sense'), elem => {
        var defElem = elem.querySelector('h3.definition')
        var posElem = elem.querySelector('a')
        var exampleElem = elem.querySelector('.defContent .example')
        var meaningElem = (() => {
          var dupDefElem = defElem.cloneNode(true)
          var posElem = dupDefElem.querySelector('a')
          dupDefElem.removeChild(posElem)
          return dupDefElem
        })()

        return {
          id: posElem.name,
          pos: posElem.innerHTML,
          meaning: (meaningElem && meaningElem.innerText.trim()) || null,
          exmaple: (exampleElem && exampleElem.innerHTML) || null
        }
      })
  )
}

function sendResult(tab, searchId) {
  return function (result) {
    chrome.tabs.sendMessage(tab.id, {type: 'searchResult', result: result, searchId: searchId})
  }
}
