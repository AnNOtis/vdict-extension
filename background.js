chrome.contextMenus.create({title: 'search it!', onclick: handleSearch, contexts: ['selection']})

function handleSearch(info, tab) {
  var selection = info.selectionText
  searchDict(selection)
    .then(sendResult(tab))
}

function searchDict(term) {
  if (!term) {
    return
  }

  return fetch(`https://www.vocabulary.com/dictionary/definition.ajax?search=${term}&lang=en`)
    .then(response => response.text())
    .then(parseResult)
}

function parseResult(resultHTML) {
  var el = document.createElement('html')
  el.innerHTML = resultHTML
  var defEl = el.querySelector('.definitionsContainer')
  var shortDef = defEl.querySelector('.main .section .short').innerHTML
  var longDef = defEl.querySelector('.main .section .long').innerHTML
  var meanings = parseMeanings(defEl)

  return {shortDef, longDef, meanings}
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

function sendResult(tab) {
  return function (result) {
    chrome.tabs.sendMessage(tab.id, {type: 'result', query: result})
  }
}
